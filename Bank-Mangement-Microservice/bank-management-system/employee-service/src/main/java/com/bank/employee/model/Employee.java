package com.bank.employee.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_id")
    private Long employeeId;

    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name cannot exceed 50 characters")
    @Column(name = "first_name", length = 50, nullable = false)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name cannot exceed 50 characters")
    @Column(name = "last_name", length = 50, nullable = false)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "\\d{10}", message = "Contact number must be 10 digits")
    @Column(name = "contact_number", length = 10, nullable = false)
    private String contactNumber;

    @NotBlank(message = "Designation is required")
    @Pattern(regexp = "Clerk|Manager|Accountant", message = "Designation must be Clerk, Manager, or Accountant")
    @Column(name = "designation", nullable = false)
    private String designation;

    @NotNull(message = "Salary is required")
    @Digits(integer = 10, fraction = 2, message = "Salary must be numeric with maximum 10 digits")
    @Column(name = "salary", precision = 12, scale = 2, nullable = false)
    private BigDecimal salary;

    // Constructors
    public Employee() {}

    public Employee(String firstName, String lastName, String email, String contactNumber, String designation, BigDecimal salary) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.contactNumber = contactNumber;
        this.designation = designation;
        this.salary = salary;
    }

    // Getters and Setters
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public BigDecimal getSalary() { return salary; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }

    @Override
    public String toString() {
        return "Employee{" +
                "employeeId=" + employeeId +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", contactNumber='" + contactNumber + '\'' +
                ", designation='" + designation + '\'' +
                ", salary=" + salary +
                '}';
    }
}
