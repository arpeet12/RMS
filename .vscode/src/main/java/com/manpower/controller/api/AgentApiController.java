package com.manpower.controller.api;

import com.manpower.entity.Agent;
import com.manpower.entity.Candidate;
import com.manpower.entity.User;
import com.manpower.repository.AgentRepository;
import com.manpower.repository.CandidateRepository;
import com.manpower.repository.JobRepository;
import com.manpower.repository.IssueRepository;
import com.manpower.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/agent")
@CrossOrigin(origins = "*")
public class AgentApiController {

    private final UserRepository userRepository;
    private final AgentRepository agentRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final IssueRepository issueRepository;

    public AgentApiController(UserRepository userRepository, AgentRepository agentRepository, CandidateRepository candidateRepository, JobRepository jobRepository, IssueRepository issueRepository) {
        this.userRepository = userRepository;
        this.agentRepository = agentRepository;
        this.candidateRepository = candidateRepository;
        this.jobRepository = jobRepository;
        this.issueRepository = issueRepository;
    }

    private Agent getCurrentAgent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if ("AGENT".equals(user.getRole())) {
                return agentRepository.findByUser(user).orElseGet(() -> {
                    Agent newAgent = new Agent();
                    newAgent.setUser(user);
                    newAgent.setFullName(user.getUsername());
                    newAgent.setStatus("ACTIVE");
                    return agentRepository.save(newAgent);
                });
            }
        }
        return null;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Agent agent = getCurrentAgent();
        if (agent == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
        }
        return ResponseEntity.ok(agent);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Agent agent = getCurrentAgent();
        if (agent == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
        }

        List<Candidate> candidates = candidateRepository.findAll();
        long totalReferred = candidates.stream()
                .filter(c -> agent.getFullName() != null &&
                        agent.getFullName().equalsIgnoreCase(c.getAgentName()))
                .count();
        long decidedApplicants = candidates.stream()
                .filter(c -> agent.getFullName() != null &&
                        agent.getFullName().equalsIgnoreCase(c.getAgentName()))
                .filter(c -> c.getJobAppliedFor() != null && !c.getJobAppliedFor().isEmpty())
                .count();
        long undecidedApplicants = totalReferred - decidedApplicants;

        long totalDemands = jobRepository.count();
        long fulfilledDemands = jobRepository.findAll().stream()
                .filter(j -> j.getVacancyCount() != null && j.getVacancyCount() == 0)
                .count();
        long vacantDemands = totalDemands - fulfilledDemands;

        long totalIssues = issueRepository.count();
        long openIssues = issueRepository.findByStatus("OPEN").size();
        long resolvedIssues = issueRepository.findByStatus("RESOLVED").size();
        long closedIssues = issueRepository.findByStatus("CLOSED").size();

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalCandidatesReferred", totalReferred);
        statistics.put("decidedApplicants", decidedApplicants);
        statistics.put("undecidedApplicants", undecidedApplicants);
        statistics.put("totalDemands", totalDemands);
        statistics.put("fulfilledDemands", fulfilledDemands);
        statistics.put("vacantDemands", vacantDemands);
        statistics.put("totalIssues", totalIssues);
        statistics.put("openIssues", openIssues);
        statistics.put("resolvedIssues", resolvedIssues);
        statistics.put("closedIssues", closedIssues);

        Map<String, Object> dashboardData = new HashMap<>();
        dashboardData.put("agent", agent);
        dashboardData.put("statistics", statistics);

        return ResponseEntity.ok(dashboardData);
    }

    @GetMapping("/candidates")
    public ResponseEntity<?> getCandidates() {
        Agent agent = getCurrentAgent();
        if (agent == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized"));
        }

        // Return candidates associated with this agent (read-only)
        List<Candidate> allCandidates = candidateRepository.findAll();
        List<Candidate> agentCandidates = allCandidates.stream()
                .filter(c -> {
                    boolean nameMatch = agent.getFullName() != null && 
                            agent.getFullName().equalsIgnoreCase(c.getAgentName());
                    boolean userMatch = agent.getUser().getUsername().equalsIgnoreCase(c.getAgentName());
                    return nameMatch || userMatch;
                })
                .toList();

        return ResponseEntity.ok(agentCandidates);
    }
}


