package com.bank.account.controller;

import com.bank.account.model.BankAccount;
import com.bank.account.model.Transaction;
import com.bank.account.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
public class AccountController {
    
    @Autowired
    private AccountService accountService;
    
    @PostMapping
    public ResponseEntity<BankAccount> createAccount(@RequestBody Map<String, Object> accountData) {
        try {
            String accountType = (String) accountData.get("accountType");
            String accountNumber = (String) accountData.get("accountNumber");
            String accountHolderName = (String) accountData.get("accountHolderName");
            BigDecimal initialBalance = new BigDecimal(accountData.get("initialBalance").toString());
            String customerSsn = (String) accountData.get("customerSsn");
            
            BankAccount account = accountService.createAccount(accountType, accountNumber, accountHolderName, initialBalance, customerSsn);
            return new ResponseEntity<>(account, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<BankAccount>> getAllAccounts() {
        List<BankAccount> accounts = accountService.getAllAccounts();
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/{accountNumber}")
    public ResponseEntity<BankAccount> getAccountByNumber(@PathVariable String accountNumber) {
        Optional<BankAccount> account = accountService.getAccountByNumber(accountNumber);
        return account.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/customer/{customerSsn}")
    public ResponseEntity<List<BankAccount>> getAccountsByCustomerSsn(@PathVariable String customerSsn) {
        List<BankAccount> accounts = accountService.getAccountsByCustomerSsn(customerSsn);
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/{accountNumber}/balance")
    public ResponseEntity<Map<String, BigDecimal>> getBalance(@PathVariable String accountNumber) {
        try {
            BigDecimal balance = accountService.getBalance(accountNumber);
            return ResponseEntity.ok(Map.of("balance", balance));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/transfer")
    public ResponseEntity<Transaction> transferFunds(@RequestBody Map<String, Object> transferData) {
        try {
            String sourceAccount = (String) transferData.get("sourceAccount");
            String destinationAccount = (String) transferData.get("destinationAccount");
            BigDecimal amount = new BigDecimal(transferData.get("amount").toString());
            
            Transaction transaction = accountService.transferFunds(sourceAccount, destinationAccount, amount);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/{accountNumber}/deposit")
    public ResponseEntity<Transaction> deposit(@PathVariable String accountNumber, @RequestBody Map<String, Object> depositData) {
        try {
            BigDecimal amount = new BigDecimal(depositData.get("amount").toString());
            Transaction transaction = accountService.deposit(accountNumber, amount);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{accountNumber}/withdraw")
    public ResponseEntity<Transaction> withdraw(@PathVariable String accountNumber, @RequestBody Map<String, Object> withdrawData) {
        try {
            BigDecimal amount = new BigDecimal(withdrawData.get("amount").toString());
            Transaction transaction = accountService.withdraw(accountNumber, amount);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{accountNumber}/transactions")
    public ResponseEntity<List<Transaction>> getTransactionHistory(@PathVariable String accountNumber) {
        List<Transaction> transactions = accountService.getTransactionHistory(accountNumber);
        return ResponseEntity.ok(transactions);
    }
    
    @DeleteMapping("/{accountNumber}")
    public ResponseEntity<Void> deleteAccount(@PathVariable String accountNumber) {
        try {
            accountService.deleteAccount(accountNumber);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
