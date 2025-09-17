package com.bank.employee.repository;

import com.bank.employee.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    List<Employee> findByDesignation(String designation);
    
    @Modifying
    @Query("UPDATE Employee e SET e.salary = e.salary + :amount WHERE e.designation = :designation")
    int updateSalaryByDesignation(@Param("designation") String designation, @Param("amount") BigDecimal amount);
    
    @Modifying
    @Query("UPDATE Employee e SET e.salary = e.salary + (e.salary * :percentage / 100) WHERE e.designation = :designation")
    int updateSalaryByPercentage(@Param("designation") String designation, @Param("percentage") BigDecimal percentage);
}
