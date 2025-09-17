package com.bank.employee.service;

import com.bank.employee.model.Employee;
import com.bank.employee.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EmployeeService {
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    public Employee createEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }
    
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }
    
    public Optional<Employee> getEmployeeById(Long id) {
        return employeeRepository.findById(id);
    }
    
    public Employee updateEmployee(Long id, Employee employeeDetails) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        
        employee.setFirstName(employeeDetails.getFirstName());
        employee.setLastName(employeeDetails.getLastName());
        employee.setEmail(employeeDetails.getEmail());
        employee.setContactNumber(employeeDetails.getContactNumber());
        employee.setDesignation(employeeDetails.getDesignation());
        employee.setSalary(employeeDetails.getSalary());
        
        return employeeRepository.save(employee);
    }
    
    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }
    
    public List<Employee> getEmployeesByDesignation(String designation) {
        return employeeRepository.findByDesignation(designation);
    }
    
    public void addSalaryToClerkEmployees(BigDecimal amount) {
        employeeRepository.updateSalaryByDesignation("Clerk", amount);
    }
    
    public void addPercentageSalaryToManagers(BigDecimal percentage) {
        employeeRepository.updateSalaryByPercentage("Manager", percentage);
    }
    
    public List<Employee> getUpdatedEmployeesByDesignation(String designation) {
        return employeeRepository.findByDesignation(designation);
    }
}
