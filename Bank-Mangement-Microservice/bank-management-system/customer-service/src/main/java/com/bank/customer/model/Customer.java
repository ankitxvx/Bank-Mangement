package com.bank.customer.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @Column(name = "ssn_id", length = 7)
    @Pattern(regexp = "\\d{7}", message = "SSN ID must be 7 digits")
    private String ssnId;

    @NotBlank(message = "Customer name is required")
    @Size(max = 50, message = "Customer name cannot exceed 50 characters")
    @Column(name = "customer_name", length = 50, nullable = false)
    private String customerName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(name = "email", nullable = false)
    private String email;

    @NotBlank(message = "Address is required")
    @Size(max = 100, message = "Address cannot exceed 100 characters")
    @Column(name = "address", length = 100, nullable = false)
    private String address;

    @NotBlank(message = "Contact number is required")
    @Size(max = 10, message = "Contact number cannot exceed 10 characters")
    @Column(name = "contact_number", length = 10, nullable = false)
    private String contactNumber;

    @NotBlank(message = "Aadhar number is required")
    @Size(max = 12, message = "Aadhar number cannot exceed 12 characters")
    @Column(name = "aadhar_number", length = 12, nullable = false, unique = true)
    private String aadharNumber;

    @NotBlank(message = "PAN number is required")
    @Size(max = 10, message = "PAN number cannot exceed 10 characters")
    @Column(name = "pan_number", length = 10, nullable = false, unique = true)
    private String panNumber;

    @NotBlank(message = "Account number is required")
    @Size(max = 20, message = "Account number cannot exceed 20 characters")
    @Column(name = "account_number", length = 20, nullable = false, unique = true)
    private String accountNumber;

    @NotNull(message = "Initial deposit amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Initial deposit must be greater than 0")
    @Column(name = "initial_deposit", precision = 12, scale = 2, nullable = false)
    private BigDecimal initialDeposit;

    @Column(name = "age")
    private Integer age;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "city", length = 50)
    private String city;

    @Pattern(regexp = "M|F", message = "Gender must be M or F")
    @Column(name = "gender", length = 1)
    private String gender;

    @Pattern(regexp = "Current|Savings", message = "Account type must be Current or Savings")
    @Column(name = "account_type")
    private String accountType;

    @Column(name = "balance", precision = 12, scale = 2)
    private BigDecimal balance;

    // Constructors
    public Customer() {}

    public Customer(String ssnId, String customerName, String email, String address, 
                   String contactNumber, String aadharNumber, String panNumber, 
                   String accountNumber, BigDecimal initialDeposit) {
        this.ssnId = ssnId;
        this.customerName = customerName;
        this.email = email;
        this.address = address;
        this.contactNumber = contactNumber;
        this.aadharNumber = aadharNumber;
        this.panNumber = panNumber;
        this.accountNumber = accountNumber;
        this.initialDeposit = initialDeposit;
        this.balance = initialDeposit;
    }

    // Getters and Setters
    public String getSsnId() { return ssnId; }
    public void setSsnId(String ssnId) { this.ssnId = ssnId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getAadharNumber() { return aadharNumber; }
    public void setAadharNumber(String aadharNumber) { this.aadharNumber = aadharNumber; }

    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String panNumber) { this.panNumber = panNumber; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public BigDecimal getInitialDeposit() { return initialDeposit; }
    public void setInitialDeposit(BigDecimal initialDeposit) { this.initialDeposit = initialDeposit; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
}
