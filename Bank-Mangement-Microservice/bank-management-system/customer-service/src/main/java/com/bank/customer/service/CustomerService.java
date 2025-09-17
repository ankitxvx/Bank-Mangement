package com.bank.customer.service;

import com.bank.customer.model.Customer;
import com.bank.customer.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CustomerService {
    
    @Autowired
    private CustomerRepository customerRepository;
    
    public Customer createCustomer(Customer customer) {
        // Set balance to initial deposit if not set
        if (customer.getBalance() == null) {
            customer.setBalance(customer.getInitialDeposit());
        }
        return customerRepository.save(customer);
    }
    
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }
    
    public Optional<Customer> getCustomerBySsnId(String ssnId) {
        return customerRepository.findById(ssnId);
    }
    
    public Optional<Customer> getCustomerByAccountNumber(String accountNumber) {
        return customerRepository.findByAccountNumber(accountNumber);
    }
    
    public Customer updateCustomer(String ssnId, Customer customerDetails) {
        Customer customer = customerRepository.findById(ssnId)
                .orElseThrow(() -> new RuntimeException("Customer not found with SSN ID: " + ssnId));
        
        customer.setCustomerName(customerDetails.getCustomerName());
        customer.setEmail(customerDetails.getEmail());
        customer.setAddress(customerDetails.getAddress());
        customer.setContactNumber(customerDetails.getContactNumber());
        customer.setCity(customerDetails.getCity());
        customer.setAge(customerDetails.getAge());
        customer.setDateOfBirth(customerDetails.getDateOfBirth());
        customer.setGender(customerDetails.getGender());
        customer.setAccountType(customerDetails.getAccountType());
        
        return customerRepository.save(customer);
    }
    
    public void deleteCustomer(String ssnId) {
        if (!customerRepository.existsById(ssnId)) {
            throw new RuntimeException("Customer not found with SSN ID: " + ssnId);
        }
        customerRepository.deleteById(ssnId);
    }
    
    public long getTotalCustomerCount() {
        return customerRepository.count();
    }
    
    public boolean existsByAccountNumber(String accountNumber) {
        return customerRepository.findByAccountNumber(accountNumber).isPresent();
    }
}
