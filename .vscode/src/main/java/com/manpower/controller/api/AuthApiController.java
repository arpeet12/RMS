package com.manpower.controller.api;

import com.manpower.entity.Agent;
import com.manpower.entity.User;
import com.manpower.repository.AgentRepository;
import com.manpower.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.manpower.util.FileUploadUtil;
import org.springframework.util.StringUtils;
import java.io.IOException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthApiController {

    private final UserRepository userRepository;
    private final AgentRepository agentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthApiController(UserRepository userRepository, AgentRepository agentRepository,
            PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.agentRepository = agentRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public List<Map<String, Object>> getOfficerApprovalRequestsForAdmin() {
        return userRepository.findAll().stream()
                .filter(u -> "OFFICER".equals(u.getRole()) && "PENDING".equals(u.getStatus()))
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("username", u.getUsername());
                    map.put("email", u.getEmail());
                    map.put("phone", u.getPhone());
                    map.put("status", u.getStatus());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "citizenshipPhoto", required = false) MultipartFile citizenshipPhoto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
            }

            Optional<User> userOpt = userRepository.findByUsername(auth.getName());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            boolean updated = false;

            if (password != null && !password.isEmpty()) {
                user.setPassword(passwordEncoder.encode(password));
                updated = true;
            }

            // Update User fields (for Admin and others)
            if (email != null && !email.isEmpty()) {
                user.setEmail(email);
                updated = true;
            }
            if (phone != null && !phone.isEmpty()) {
                user.setPhone(phone);
                updated = true;
            }
            if (address != null && !address.isEmpty()) {
                user.setAddress(address);
                updated = true;
            }

            if (citizenshipPhoto != null && !citizenshipPhoto.isEmpty()) {
                String fileName = StringUtils.cleanPath(citizenshipPhoto.getOriginalFilename());
                String uniqueFileName = System.currentTimeMillis() + "_citizen_" + fileName;
                String uploadDir = "uploads/users/" + user.getId();
                FileUploadUtil.saveFile(uploadDir, uniqueFileName, citizenshipPhoto);

                String photoPath = "/uploads/users/" + user.getId() + "/" + uniqueFileName;
                user.setCitizenshipPhotoPath(photoPath);
                updated = true;
            }

            // If user is AGENT, update Agent entity specific fields as well (keep synced)
            if ("AGENT".equals(user.getRole())) {
                Optional<Agent> agentOpt = agentRepository.findByUser(user);
                if (agentOpt.isPresent()) {
                    Agent agent = agentOpt.get();
                    boolean agentUpdated = false;

                    if (email != null && !email.isEmpty()) {
                        agent.setEmail(email);
                        agentUpdated = true;
                    }
                    if (phone != null && !phone.isEmpty()) {
                        agent.setPhone(phone);
                        agentUpdated = true;
                    }
                    if (address != null && !address.isEmpty()) {
                        agent.setAddress(address);
                        agentUpdated = true;
                    }

                    if (citizenshipPhoto != null && !citizenshipPhoto.isEmpty()) {
                        // Agent stores in separate path, let's keep it that way for now or sync it?
                        // The existing code was:
                        String fileName = StringUtils.cleanPath(citizenshipPhoto.getOriginalFilename());
                        String uniqueFileName = System.currentTimeMillis() + "_citizen_" + fileName;
                        String uploadDir = "uploads/agents/" + agent.getId();
                        FileUploadUtil.saveFile(uploadDir, uniqueFileName, citizenshipPhoto);

                        String photoPath = "/uploads/agents/" + agent.getId() + "/" + uniqueFileName;
                        agent.setCitizenshipPhotoPath(photoPath);
                        agentUpdated = true;
                    }

                    if (agentUpdated) {
                        agentRepository.save(agent);
                    }
                }
            }

            if (photo != null && !photo.isEmpty()) {
                String fileName = StringUtils.cleanPath(photo.getOriginalFilename());
                // Use a timestamp to avoid caching issues or name collisions
                String uniqueFileName = System.currentTimeMillis() + "_" + fileName;
                String uploadDir = "uploads/users/" + user.getId();
                FileUploadUtil.saveFile(uploadDir, uniqueFileName, photo);

                String photoPath = "/uploads/users/" + user.getId() + "/" + uniqueFileName;
                user.setProfilePhotoPath(photoPath);

                // If user is AGENT, update Agent entity as well
                if ("AGENT".equals(user.getRole())) {
                    Optional<Agent> agentOpt = agentRepository.findByUser(user);
                    if (agentOpt.isPresent()) {
                        Agent agent = agentOpt.get();
                        agent.setProfilePhotoPath(photoPath);
                        agentRepository.save(agent);
                    }
                }

                updated = true;
            }

            if (updated) {
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("success", true, "message", "Profile updated successfully", "photoPath",
                        user.getProfilePhotoPath()));
            } else {
                // Return success even if no user-level changes, as agent changes might have
                // occurred
                return ResponseEntity.ok(Map.of("success", true, "message", "Profile updated successfully"));
            }

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error saving photo: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
                return ResponseEntity.ok(Map.of("authenticated", false));
            }

            Optional<User> userOpt = userRepository.findByUsername(auth.getName());
            if (userOpt.isPresent()) {
                User user = userOpt.get();

                if ("PENDING".equals(user.getStatus())) {
                    return ResponseEntity.ok(Map.of("authenticated", false));
                }

                Map<String, Object> userData = new HashMap<>();
                userData.put("authenticated", true);
                userData.put("id", user.getId());
                userData.put("username", user.getUsername());
                userData.put("role", user.getRole());
                userData.put("profilePhotoPath", user.getProfilePhotoPath());
                userData.put("email", user.getEmail());
                userData.put("phone", user.getPhone());
                userData.put("address", user.getAddress());
                userData.put("citizenshipPhotoPath", user.getCitizenshipPhotoPath());

                if ("AGENT".equals(user.getRole())) {
                    Optional<Agent> agentOpt = agentRepository.findByUser(user);
                    if (agentOpt.isPresent()) {
                        userData.put("permissionsJson", agentOpt.get().getPermissionsJson());
                    }
                }

                return ResponseEntity.ok(userData);
            }
            return ResponseEntity.ok(Map.of("authenticated", false));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> apiLogout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            String role = request.getOrDefault("role", "CANDIDATE");

            if (userRepository.findByUsername(username).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
            }

            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);

            if ("OFFICER".equals(role)) {
                user.setStatus("PENDING");
            } else {
                user.setStatus("ACTIVE");
            }

            userRepository.save(user);

            if ("OFFICER".equals(role)) {
                return ResponseEntity.ok(
                        Map.of("success", true, "message", "Registration successful. Please wait for admin approval."));
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Registration successful"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            String username = request.get("username");
            String password = request.get("password");

            if (username == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required"));
            }

            try {
                // Authenticate using Spring Security's AuthenticationManager
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(username, password));

                // Create security context and set authentication
                SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
                securityContext.setAuthentication(authentication);
                SecurityContextHolder.setContext(securityContext);

                // Store security context in HTTP session
                HttpSession session = httpRequest.getSession(true);
                session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);

                // Get the user details
                Optional<User> userOpt = userRepository.findByUsername(username);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();

                    if ("PENDING".equals(user.getStatus())) {
                        SecurityContextHolder.clearContext();
                        session.invalidate();
                        return ResponseEntity.status(403)
                                .body(Map.of("error", "Your account is pending approval by admin."));
                    }

                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Login successful");

                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("username", user.getUsername());
                    userMap.put("role", user.getRole());

                    if ("AGENT".equals(user.getRole())) {
                        Optional<Agent> agentOpt = agentRepository.findByUser(user);
                        if (agentOpt.isPresent()) {
                            userMap.put("permissionsJson", agentOpt.get().getPermissionsJson());
                        }
                    }

                    response.put("user", userMap);
                    return ResponseEntity.ok(response);
                }
            } catch (org.springframework.security.core.AuthenticationException e) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
            }

            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }
}
