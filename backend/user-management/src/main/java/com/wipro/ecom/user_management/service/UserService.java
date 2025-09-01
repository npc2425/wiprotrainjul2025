package com.wipro.ecom.user_management.service;

import com.wipro.ecom.user_management.entity.User;
import com.wipro.ecom.user_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerNewUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setUserType(1);
        return userRepository.save(user);
    }

    public User updateUserProfile(Integer userId, User userDetails) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        existingUser.setFirstName(userDetails.getFirstName());
        existingUser.setLastName(userDetails.getLastName());
        existingUser.setAddress(userDetails.getAddress());
        existingUser.setEmailId(userDetails.getEmailId());
        
        return userRepository.save(existingUser);
    }
    


    public User createAdminUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setUserType(0); 
        return userRepository.save(user);
    }

 
    public Optional<User> getUserById(Integer userId) {
        return userRepository.findById(userId);
    }
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

 
    public void deleteUser(Integer userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }
}
