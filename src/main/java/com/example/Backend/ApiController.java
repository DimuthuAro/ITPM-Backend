package com.example.Backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Apply CORS globally
public class ApiController {

    private final DataSource dataSource;

    @Autowired
    public ApiController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        List<Map<String, Object>> users = new ArrayList<>();
        String sql = "SELECT id, name FROM user";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                Map<String, Object> user = new HashMap<>();
                user.put("id", resultSet.getInt("id"));
                user.put("email", resultSet.getString("email"));
                user.put("name", resultSet.getString("name"));

                users.add(user);
            }
            return ResponseEntity.ok(users);
            
        } catch (SQLException e) {
            return handleDatabaseError(e);
        }
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> request) {
        String sql = "INSERT INTO user (name) VALUES (?)";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            statement.setString(1, request.get("name"));
            int affectedRows = statement.executeUpdate();

            if (affectedRows > 0) {
                try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        Map<String, Object> response = new HashMap<>();
                        response.put("id", generatedKeys.getLong(1));
                        response.put("message", "User created successfully");
                        return ResponseEntity.status(HttpStatus.CREATED).body(response);
                    }
                }
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create user");
            
        } catch (SQLException e) {
            return handleDatabaseError(e);
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable int id, @RequestBody Map<String, String> request) {
        String sql = "UPDATE user SET name = ? WHERE id = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setString(1, request.get("name"));
            statement.setInt(2, id);
            
            int affectedRows = statement.executeUpdate();
            if (affectedRows > 0) {
                return ResponseEntity.ok("User updated successfully");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            
        } catch (SQLException e) {
            return handleDatabaseError(e);
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable int id) {
        String sql = "DELETE FROM user WHERE id = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setInt(1, id);
            int affectedRows = statement.executeUpdate();
            
            if (affectedRows > 0) {
                return ResponseEntity.ok("User deleted successfully");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            
        } catch (SQLException e) {
            return handleDatabaseError(e);
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable int id) {
        String sql = "SELECT id, name FROM user WHERE id = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setInt(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    Map<String, Object> user = new HashMap<>();
                    user.put("id", resultSet.getInt("id"));
                    user.put("name", resultSet.getString("name"));
                    return ResponseEntity.ok(user);
                }
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
        } catch (SQLException e) {
            return handleDatabaseError(e);
        }
    }

    private ResponseEntity<?> handleDatabaseError(SQLException e) {
        Map<String, Object> error = new HashMap<>();
        error.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        error.put("message", "Database error occurred");
        error.put("detail", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}