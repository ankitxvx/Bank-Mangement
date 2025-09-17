package com.bank.account.repository;

import com.bank.account.model.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, String> {
    
    List<BankAccount> findByCustomerSsn(String customerSsn);
}
