package com.bank.customer.controller;

import com.bank.customer.model.Customer;
import com.bank.customer.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {
    
    @Autowired
    private CustomerService customerService;
    
    @PostMapping
    public ResponseEntity<Customer> createCustomer(@Valid @RequestBody Customer customer) {
        try {
            Customer createdCustomer = customerService.createCustomer(customer);
            return new ResponseEntity<>(createdCustomer, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {
        List<Customer> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }
    
    @GetMapping("/{ssnId}")
    public ResponseEntity<Customer> getCustomerBySsnId(@PathVariable String ssnId) {
        Optional<Customer> customer = customerService.getCustomerBySsnId(ssnId);
        return customer.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<Customer> getCustomerByAccountNumber(@PathVariable String accountNumber) {
        Optional<Customer> customer = customerService.getCustomerByAccountNumber(accountNumber);
        return customer.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{ssnId}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable String ssnId, @Valid @RequestBody Customer customerDetails) {
        try {
            Customer updatedCustomer = customerService.updateCustomer(ssnId, customerDetails);
            return ResponseEntity.ok(updatedCustomer);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{ssnId}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable String ssnId) {
        try {
            customerService.deleteCustomer(ssnId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<Long> getTotalCustomerCount() {
        long count = customerService.getTotalCustomerCount();
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/exists/account/{accountNumber}")
    public ResponseEntity<Boolean> checkAccountExists(@PathVariable String accountNumber) {
        boolean exists = customerService.existsByAccountNumber(accountNumber);
        return ResponseEntity.ok(exists);
    }
}
