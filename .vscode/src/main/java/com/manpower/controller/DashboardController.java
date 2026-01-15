package com.manpower.controller;

import com.manpower.entity.Agent;
import com.manpower.entity.Candidate;
import com.manpower.entity.User;
import com.manpower.repository.AgentRepository;
import com.manpower.repository.CandidateRepository;
import com.manpower.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Optional;

@Controller
public class DashboardController {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final AgentRepository agentRepository;

    public DashboardController(UserRepository userRepository, CandidateRepository candidateRepository, AgentRepository agentRepository) {
        this.userRepository = userRepository;
        this.candidateRepository = candidateRepository;
        this.agentRepository = agentRepository;
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String role = user.getRole();

                if ("CANDIDATE".equals(role)) {
                    // Find or Create Candidate profile
                    Candidate candidate = candidateRepository.findByUser(user).orElseGet(() -> {
                        // Self-healing: Create missing candidate profile
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

                    model.addAttribute("candidate", candidate);
                    return "candidate-dashboard";
                } else if ("ADMIN".equals(role) || "OFFICER".equals(role)) {
                    // Admin/Officer dashboard
                    model.addAttribute("role", role);
                    model.addAttribute("user", user);
                    return "admin-dashboard";
                } else if ("AGENT".equals(role)) {
                    // Find or Create Agent profile
                    Agent agent = agentRepository.findByUser(user).orElseGet(() -> {
                        Agent newAgent = new Agent();
                        newAgent.setUser(user);
                        newAgent.setFullName(user.getUsername());
                        newAgent.setStatus("ACTIVE");
                        return agentRepository.save(newAgent);
                    });

                    model.addAttribute("agent", agent);
                    return "agent-dashboard";
                }
            }

            return "dashboard";
        } catch (Exception e) {
            e.printStackTrace(); // Log to console
            model.addAttribute("error", "An unexpected error occurred: " + e.getMessage());
            return "error-500";
        }
    }
}
