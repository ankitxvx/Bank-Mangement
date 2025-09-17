package com.bank.auth.controller;

import com.bank.auth.model.User;
import com.bank.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user, BindingResult bindingResult) {
        try {
            // Check for validation errors
            if (bindingResult.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                for (FieldError error : bindingResult.getFieldErrors()) {
                    errors.put(error.getField(), error.getDefaultMessage());
                }
                return ResponseEntity.badRequest().body(Map.of("validationErrors", errors));
            }
            
            User registeredUser = authService.registerUser(user);
            // Don't return password in response
            registeredUser.setPassword(null);
            return ResponseEntity.ok(Map.of("message", "User registered successfully", "user", registeredUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData, HttpSession session) {
        String username = loginData.get("username");
        String password = loginData.get("password");
        
        Optional<User> userOpt = authService.authenticateUser(username, password);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Store user info in session
            session.setAttribute("userId", user.getId());
            session.setAttribute("username", user.getUsername());
            session.setAttribute("role", user.getRole());
            
            // Don't return password in response
            user.setPassword(null);
            
            return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "user", user,
                "sessionId", session.getId()
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }
    
    @GetMapping("/session")
    public ResponseEntity<?> getSession(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId != null) {
            return ResponseEntity.ok(Map.of(
                "userId", userId,
                "username", session.getAttribute("username"),
                "role", session.getAttribute("role"),
                "sessionId", session.getId()
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "No active session"));
        }
    }
    
    @PostMapping("/validate")
    public ResponseEntity<?> validateCredentials(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        
        boolean isValid = authService.validateCredentials(username, password);
        
        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "Login Successful"));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Login unsuccessful"));
        }
    }
    
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = authService.getAllUsers();
        // Remove passwords from response
        users.forEach(user -> user.setPassword(null));
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/users/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        Optional<User> user = authService.findByUsername(username);
        if (user.isPresent()) {
            User foundUser = user.get();
            foundUser.setPassword(null); // Don't return password
            return ResponseEntity.ok(foundUser);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @Valid @RequestBody User userDetails) {
        try {
            User updatedUser = authService.updateUser(id, userDetails);
            updatedUser.setPassword(null); // Don't return password
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            authService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
