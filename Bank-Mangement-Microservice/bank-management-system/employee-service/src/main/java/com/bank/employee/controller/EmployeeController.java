package com.bank.employee.controller;

import com.bank.employee.model.Employee;
import com.bank.employee.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {
    
    @Autowired
    private EmployeeService employeeService;
    
    @PostMapping
    public ResponseEntity<Employee> createEmployee(@Valid @RequestBody Employee employee) {
        Employee createdEmployee = employeeService.createEmployee(employee);
        return new ResponseEntity<>(createdEmployee, HttpStatus.CREATED);
    }
    
    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        List<Employee> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        Optional<Employee> employee = employeeService.getEmployeeById(id);
        return employee.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @Valid @RequestBody Employee employeeDetails) {
        try {
            Employee updatedEmployee = employeeService.updateEmployee(id, employeeDetails);
            return ResponseEntity.ok(updatedEmployee);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        try {
            employeeService.deleteEmployee(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/designation/{designation}")
    public ResponseEntity<List<Employee>> getEmployeesByDesignation(@PathVariable String designation) {
        List<Employee> employees = employeeService.getEmployeesByDesignation(designation);
        return ResponseEntity.ok(employees);
    }
    
    @PutMapping("/salary/clerk/add/{amount}")
    public ResponseEntity<List<Employee>> addSalaryToClerkEmployees(@PathVariable BigDecimal amount) {
        employeeService.addSalaryToClerkEmployees(amount);
        List<Employee> updatedEmployees = employeeService.getUpdatedEmployeesByDesignation("Clerk");
        return ResponseEntity.ok(updatedEmployees);
    }
    
    @PutMapping("/salary/manager/percentage/{percentage}")
    public ResponseEntity<List<Employee>> addPercentageSalaryToManagers(@PathVariable BigDecimal percentage) {
        employeeService.addPercentageSalaryToManagers(percentage);
        List<Employee> updatedEmployees = employeeService.getUpdatedEmployeesByDesignation("Manager");
        return ResponseEntity.ok(updatedEmployees);
    }
}
