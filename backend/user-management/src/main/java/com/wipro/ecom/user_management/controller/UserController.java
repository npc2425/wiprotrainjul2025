package com.wipro.ecom.user_management.controller;

import com.wipro.ecom.user_management.dto.LoginRequest;
import com.wipro.ecom.user_management.dto.LoginResponse;
import com.wipro.ecom.user_management.entity.User;
import com.wipro.ecom.user_management.repository.UserRepository;
import com.wipro.ecom.user_management.service.UserService;
import com.wipro.ecom.user_management.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/user")
@Tag(name = "User Management", description = "APIs for all user-related operations including registration, login, and administration")
public class UserController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserService userService;

    // --- Authentication and Registration Endpoints ---

    @Operation(summary = "Register a new customer account")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Registration failed due to invalid data (e.g., username already exists)")
    })
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User registeredUser = userService.registerNewUser(user);
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Registration failed: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Operation(summary = "Authenticate a user and receive a JWT token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Authentication successful"),
            @ApiResponse(responseCode = "403", description = "Invalid credentials")
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> createAuthenticationToken(@RequestBody LoginRequest loginRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUserId(), loginRequest.getPassword())
        );

        final User user = userRepository.findByUserId(loginRequest.getUserId()).orElseThrow();
        final String token = jwtUtil.generateToken(user);

        return ResponseEntity.ok(new LoginResponse(
          user.getId(),         // 1. id (Integer)
          token,                // 2. token (String)
          user.getUserId(),     // 3. userId (String)
          user.getUserType(),   // 4. userType (int)
          user.getFirstName(),    // 5. firstName (String)
          user.getLastName(),     // 6. lastName (String)
          user.getAvatar()      // 7. avatar (String)
  ));

          
    }

    // --- User Profile Endpoints ---

    @Operation(summary = "Update a user's own profile information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/profile/{id}")
    @PreAuthorize("#id == authentication.principal.id or hasRole('ADMIN')")
    public ResponseEntity<User> updateUserProfile(@PathVariable Integer id, @RequestBody User userDetails) {
        User updatedUser = userService.updateUserProfile(id, userDetails);
        return ResponseEntity.ok(updatedUser);
    }
    
    @Operation(summary = "Get a user's details by ID (Admin or owner only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/{id}")
    @PreAuthorize("#id == authentication.principal.id or hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }



    @Operation(summary = "Get a list of all users (Admin only)")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list of users")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }
    
    @Operation(summary = "Create a new admin user (Admin only)")
    @ApiResponse(responseCode = "201", description = "Admin user created successfully")
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createAdmin(@RequestBody User user) {
        return new ResponseEntity<>(userService.createAdminUser(user), HttpStatus.CREATED);
    }

    @Operation(summary = "Delete a user by ID (Admin only)")
    @ApiResponse(responseCode = "204", description = "User deleted successfully")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

 @PostMapping("/check-username")
public ResponseEntity<?> checkUsername(@RequestBody Map<String, String> payload) {
  String username = payload.get("username");

  System.out.println("Checking username: '" + username + "'");
  if (username == null || username.trim().isEmpty()) {

      return ResponseEntity.ok().body(Map.of("exists", false));
  }
  boolean exists = userRepository.findByUserId(username.trim()).isPresent();  
  System.out.println("Does username exist?: " + exists);
  return ResponseEntity.ok().body(Map.of("exists", exists));

}
}
