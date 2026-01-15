package com.manpower.controller;

import com.manpower.entity.Candidate;
import com.manpower.entity.User;
import com.manpower.repository.CandidateRepository;
import com.manpower.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AuthController {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, CandidateRepository candidateRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.candidateRepository = candidateRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String registerForm(Model model) {
        return "register";
    }

    @PostMapping("/register")
    public String register(@ModelAttribute User user, Model model, RedirectAttributes redirectAttributes) {
        // Check if username already exists
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            model.addAttribute("error", "Username already exists!");
            return "register";
        }

        // Validate role
        if (user.getRole() == null || user.getRole().isEmpty()) {
            model.addAttribute("error", "Please select a role!");
            return "register";
        }

        // Validate password
        if (user.getPassword() == null || user.getPassword().length() < 3) {
            model.addAttribute("error", "Password must be at least 3 characters!");
            return "register";
        }

        try {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            User savedUser = userRepository.save(user);

            // Automatically create a Candidate profile if the user is a CANDIDATE
            if ("CANDIDATE".equals(savedUser.getRole())) {
                Candidate candidate = new Candidate();
                candidate.setUser(savedUser);
                // Set default values or leave them null/pending
                candidate.setFullName(savedUser.getUsername()); // Use username as placeholder name
                candidate.setVisaStatus("PENDING");
                candidate.setMedicalStatus("PENDING");
                candidate.setInsuranceStatus("PENDING");
                candidate.setHealthReportStatus("PENDING");
                candidate.setPoliceReportStatus("PENDING");
                
                candidateRepository.save(candidate);
            }

            redirectAttributes.addFlashAttribute("success", true);
            return "redirect:/login";
        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("error", "Registration failed: " + e.getMessage());
            return "register";
        }
    }
}
