package com.bank.account.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@DiscriminatorValue("CURRENT")
public class CurrentAccount extends BankAccount {
    
    @Column(name = "overdraft_limit", precision = 12, scale = 2)
    private BigDecimal overdraftLimit = BigDecimal.valueOf(10000); // Default overdraft limit
    
    @Column(name = "maintenance_fee", precision = 12, scale = 2)
    private BigDecimal maintenanceFee = BigDecimal.valueOf(500); // Default maintenance fee
    
    // Constructors
    public CurrentAccount() {
        super();
    }
    
    public CurrentAccount(String accountNumber, String accountHolderName, BigDecimal balance, String customerSsn) {
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
        BigDecimal minimumAllowedBalance = overdraftLimit.negate();
        
        if (newBalance.compareTo(minimumAllowedBalance) < 0) {
            throw new IllegalStateException("Insufficient funds. Overdraft limit of " + overdraftLimit + " exceeded");
        }
        
        setBalance(newBalance);
    }
    
    @Override
    public String getAccountType() {
        return "CURRENT";
    }
    
    // Getters and Setters
    public BigDecimal getOverdraftLimit() { return overdraftLimit; }
    public void setOverdraftLimit(BigDecimal overdraftLimit) { this.overdraftLimit = overdraftLimit; }
    
    public BigDecimal getMaintenanceFee() { return maintenanceFee; }
    public void setMaintenanceFee(BigDecimal maintenanceFee) { this.maintenanceFee = maintenanceFee; }
}
