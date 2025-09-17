package com.bank.account.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Source account number is required")
    @Column(name = "source_account", length = 20, nullable = false)
    private String sourceAccount;
    
    @NotBlank(message = "Destination account number is required")
    @Column(name = "destination_account", length = 20, nullable = false)
    private String destinationAccount;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Column(name = "amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;
    
    @NotBlank(message = "Transaction type is required")
    @Column(name = "transaction_type", length = 20, nullable = false)
    private String transactionType; // TRANSFER, DEPOSIT, WITHDRAWAL
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "status", length = 20)
    private String status; // SUCCESS, FAILED, PENDING
    
    @Column(name = "description", length = 255)
    private String description;
    
    // Constructors
    public Transaction() {
        this.timestamp = LocalDateTime.now();
        this.status = "PENDING";
    }
    
    public Transaction(String sourceAccount, String destinationAccount, BigDecimal amount, String transactionType) {
        this();
        this.sourceAccount = sourceAccount;
        this.destinationAccount = destinationAccount;
        this.amount = amount;
        this.transactionType = transactionType;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getSourceAccount() { return sourceAccount; }
    public void setSourceAccount(String sourceAccount) { this.sourceAccount = sourceAccount; }
    
    public String getDestinationAccount() { return destinationAccount; }
    public void setDestinationAccount(String destinationAccount) { this.destinationAccount = destinationAccount; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
