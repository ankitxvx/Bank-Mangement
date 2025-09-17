package com.bank.customer.repository;

import com.bank.customer.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    
    Optional<Customer> findByAccountNumber(String accountNumber);
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByAadharNumber(String aadharNumber);
    Optional<Customer> findByPanNumber(String panNumber);
}
