package com.bank.account.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@DiscriminatorValue("SAVINGS")
public class SavingsAccount extends BankAccount {
    
    @Column(name = "minimum_balance", precision = 12, scale = 2)
    private BigDecimal minimumBalance = BigDecimal.valueOf(1000); // Default minimum balance
    
    @Column(name = "interest_rate", precision = 5, scale = 2)
    private BigDecimal interestRate = BigDecimal.valueOf(3.5); // Default interest rate
    
    // Constructors
    public SavingsAccount() {
        super();
    }
    
    public SavingsAccount(String accountNumber, String accountHolderName, BigDecimal balance, String customerSsn) {
        super(accountNumber, accountHolderName, balance, customerSsn);
    }
    
    @Override
    public void deposit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }
        setBalance(getBalance().add(amount));
    }
    
    @Override
    public void withdraw(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }
        
        BigDecimal newBalance = getBalance().subtract(amount);
        if (newBalance.compareTo(minimumBalance) < 0) {
            throw new IllegalStateException("Insufficient funds. Minimum balance of " + minimumBalance + " must be maintained");
        }
        
        setBalance(newBalance);
    }
    
    @Override
    public String getAccountType() {
        return "SAVINGS";
    }
    
    // Getters and Setters
    public BigDecimal getMinimumBalance() { return minimumBalance; }
    public void setMinimumBalance(BigDecimal minimumBalance) { this.minimumBalance = minimumBalance; }
    
    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }
}
