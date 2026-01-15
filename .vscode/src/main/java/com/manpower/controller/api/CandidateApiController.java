package com.manpower.controller.api;

import com.manpower.entity.Candidate;
import com.manpower.entity.User;
import com.manpower.repository.CandidateRepository;
import com.manpower.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/candidate")
@CrossOrigin(origins = "*")
public class CandidateApiController {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;

    public CandidateApiController(UserRepository userRepository, CandidateRepository candidateRepository) {
        this.userRepository = userRepository;
        this.candidateRepository = candidateRepository;
    }

    private Candidate getCurrentCandidate() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if ("CANDIDATE".equals(user.getRole())) {
                return candidateRepository.findByUser(user).orElseGet(() -> {
                    Candidate newCandidate = new Candidate();
                    newCandidate.setUser(user);
                    newCandidate.setFullName(user.getUsername());
                    newCandidate.setPassportStatus("NOT_UPLOADED");
                    newCandidate.setVisaStatus("NOT_UPLOADED");
                    newCandidate.setMedicalStatus("NOT_UPLOADED");
                    newCandidate.setInsuranceStatus("NOT_UPLOADED");
                    newCandidate.setHealthReportStatus("NOT_UPLOADED");
                    newCandidate.setPoliceReportStatus("NOT_UPLOADED");
                    return candidateRepository.save(newCandidate);
                });
            }
        }
        return null;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Candidate candidate = getCurrentCandidate();
        if (candidate == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
        }
        return ResponseEntity.ok(candidate);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Candidate candidateData) {
        Candidate candidate = getCurrentCandidate();
        if (candidate == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
        }

        try {
            candidate.setFullName(candidateData.getFullName());
            candidate.setPhone(candidateData.getPhone());
            candidate.setEmail(candidateData.getEmail());
            candidate.setAddress(candidateData.getAddress());
            candidate.setDateOfBirth(candidateData.getDateOfBirth());
            candidate.setNationality(candidateData.getNationality());
            candidate.setPassportNumber(candidateData.getPassportNumber());
            candidate.setPassportIssueDate(candidateData.getPassportIssueDate());
            candidate.setPassportExpiryDate(candidateData.getPassportExpiryDate());
            
            candidateRepository.save(candidate);
            return ResponseEntity.ok(Map.of("success", true, "message", "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Candidate candidate = getCurrentCandidate();
        if (candidate == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
        }
        return ResponseEntity.ok(candidate);
    }

    @GetMapping("/documents")
    public ResponseEntity<?> getDocuments() {
        Candidate candidate = getCurrentCandidate();
        if (candidate == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
        }
        return ResponseEntity.ok(candidate);
    }
}

