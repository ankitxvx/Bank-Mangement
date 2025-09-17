package com.bank.account.service;

import com.bank.account.model.*;
import com.bank.account.repository.BankAccountRepository;
import com.bank.account.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AccountService {
    
    @Autowired
    private BankAccountRepository accountRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    public BankAccount createAccount(String accountType, String accountNumber, String accountHolderName, 
                                   BigDecimal initialBalance, String customerSsn) {
        BankAccount account;
        
        if ("SAVINGS".equalsIgnoreCase(accountType)) {
            account = new SavingsAccount(accountNumber, accountHolderName, initialBalance, customerSsn);
        } else if ("CURRENT".equalsIgnoreCase(accountType)) {
            account = new CurrentAccount(accountNumber, accountHolderName, initialBalance, customerSsn);
        } else {
            throw new IllegalArgumentException("Invalid account type: " + accountType);
        }
        
        return accountRepository.save(account);
    }
    
    public Optional<BankAccount> getAccountByNumber(String accountNumber) {
        return accountRepository.findById(accountNumber);
    }
    
    public List<BankAccount> getAllAccounts() {
        return accountRepository.findAll();
    }
    
    public List<BankAccount> getAccountsByCustomerSsn(String customerSsn) {
        return accountRepository.findByCustomerSsn(customerSsn);
    }
    
    public BigDecimal getBalance(String accountNumber) {
        BankAccount account = accountRepository.findById(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));
        return account.getBalance();
    }
    
    public Transaction transferFunds(String sourceAccountNumber, String destinationAccountNumber, BigDecimal amount) {
        // Create transaction record
        Transaction transaction = new Transaction(sourceAccountNumber, destinationAccountNumber, amount, "TRANSFER");
        
        try {
            // Get source and destination accounts
            BankAccount sourceAccount = accountRepository.findById(sourceAccountNumber)
                    .orElseThrow(() -> new RuntimeException("Source account not found: " + sourceAccountNumber));
            
            BankAccount destinationAccount = accountRepository.findById(destinationAccountNumber)
                    .orElseThrow(() -> new RuntimeException("Destination account not found: " + destinationAccountNumber));
            
            // Validate amount
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Transfer amount must be positive");
            }
            
            // Perform transfer
            sourceAccount.withdraw(amount);
            destinationAccount.deposit(amount);
            
            // Save updated accounts
            accountRepository.save(sourceAccount);
            accountRepository.save(destinationAccount);
            
            // Update transaction status
            transaction.setStatus("SUCCESS");
            transaction.setDescription("Fund transfer successful");
            
        } catch (Exception e) {
            transaction.setStatus("FAILED");
            transaction.setDescription("Fund transfer failed: " + e.getMessage());
            throw e;
        } finally {
            transactionRepository.save(transaction);
        }
        
        return transaction;
    }
    
    public Transaction deposit(String accountNumber, BigDecimal amount) {
        Transaction transaction = new Transaction(accountNumber, accountNumber, amount, "DEPOSIT");
        
        try {
            BankAccount account = accountRepository.findById(accountNumber)
                    .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));
            
            account.deposit(amount);
            accountRepository.save(account);
            
            transaction.setStatus("SUCCESS");
            transaction.setDescription("Deposit successful");
            
        } catch (Exception e) {
            transaction.setStatus("FAILED");
            transaction.setDescription("Deposit failed: " + e.getMessage());
            throw e;
        } finally {
            transactionRepository.save(transaction);
        }
        
        return transaction;
    }
    
    public Transaction withdraw(String accountNumber, BigDecimal amount) {
        Transaction transaction = new Transaction(accountNumber, accountNumber, amount, "WITHDRAWAL");
        
        try {
            BankAccount account = accountRepository.findById(accountNumber)
                    .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));
            
            account.withdraw(amount);
            accountRepository.save(account);
            
            transaction.setStatus("SUCCESS");
            transaction.setDescription("Withdrawal successful");
            
        } catch (Exception e) {
            transaction.setStatus("FAILED");
            transaction.setDescription("Withdrawal failed: " + e.getMessage());
            throw e;
        } finally {
            transactionRepository.save(transaction);
        }
        
        return transaction;
    }
    
    public List<Transaction> getTransactionHistory(String accountNumber) {
        return transactionRepository.findBySourceAccountOrDestinationAccountOrderByTimestampDesc(accountNumber, accountNumber);
    }
    
    public void deleteAccount(String accountNumber) {
        if (!accountRepository.existsById(accountNumber)) {
            throw new RuntimeException("Account not found: " + accountNumber);
        }
        accountRepository.deleteById(accountNumber);
    }
}
