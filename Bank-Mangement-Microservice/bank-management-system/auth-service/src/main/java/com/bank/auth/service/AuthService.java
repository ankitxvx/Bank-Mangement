package com.bank.auth.service;

import com.bank.auth.model.User;
import com.bank.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    public User registerUser(User user) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // Store password as plain text (not recommended for production)
        // user.setPassword(user.getPassword()); // Password is already set
        
        return userRepository.save(user);
    }
    
    public Optional<User> authenticateUser(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (password.equals(user.getPassword()) && user.getEnabled()) {
                // Update last login
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);
                return Optional.of(user);
            }
        }
        
        return Optional.empty();
    }
    
    public boolean validateCredentials(String username, String password) {
        return authenticateUser(username, password).isPresent();
    }
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());
        user.setEnabled(userDetails.getEnabled());
        
        // Only update password if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(userDetails.getPassword()); // Store as plain text
        }
        
        return userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
