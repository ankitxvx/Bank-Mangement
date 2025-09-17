package com.bank.account.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Entity
@Table(name = "bank_accounts")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "account_type", discriminatorType = DiscriminatorType.STRING)
public abstract class BankAccount {
    
    @Id
    @Column(name = "account_number", length = 20)
    private String accountNumber;
    
    @NotBlank(message = "Account holder name is required")
    @Size(max = 100, message = "Account holder name cannot exceed 100 characters")
    @Column(name = "account_holder_name", length = 100, nullable = false)
    private String accountHolderName;
    
    @NotNull(message = "Balance is required")
    @DecimalMin(value = "0.0", message = "Balance cannot be negative")
    @Column(name = "balance", precision = 12, scale = 2, nullable = false)
    private BigDecimal balance;
    
    @Column(name = "customer_ssn", length = 7)
    private String customerSsn;
    
    // Constructors
    public BankAccount() {}
    
    public BankAccount(String accountNumber, String accountHolderName, BigDecimal balance, String customerSsn) {
        this.accountNumber = accountNumber;
        this.accountHolderName = accountHolderName;
        this.balance = balance;
        this.customerSsn = customerSsn;
    }
    
    // Abstract methods for different account types
    public abstract void deposit(BigDecimal amount);
    public abstract void withdraw(BigDecimal amount);
    public abstract String getAccountType();
    
    // Common methods
    public BigDecimal getBalance() {
        return balance;
    }
    
    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
    
    // Getters and Setters
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    
    public String getAccountHolderName() { return accountHolderName; }
    public void setAccountHolderName(String accountHolderName) { this.accountHolderName = accountHolderName; }
    
    public String getCustomerSsn() { return customerSsn; }
    public void setCustomerSsn(String customerSsn) { this.customerSsn = customerSsn; }
}
