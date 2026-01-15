package com.manpower.controller.api;

import com.manpower.entity.Application;
import com.manpower.entity.Candidate;
import com.manpower.entity.FlightTicket;
import com.manpower.repository.ApplicationRepository;
import com.manpower.repository.CandidateRepository;
import com.manpower.repository.FlightTicketRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/public/candidate")
@CrossOrigin(origins = "*")
public class PublicCandidateController {

    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final FlightTicketRepository flightTicketRepository;

    public PublicCandidateController(CandidateRepository candidateRepository,
                                     ApplicationRepository applicationRepository,
                                     FlightTicketRepository flightTicketRepository) {
        this.candidateRepository = candidateRepository;
        this.applicationRepository = applicationRepository;
        this.flightTicketRepository = flightTicketRepository;
    }

    @PostMapping("/status")
    public ResponseEntity<?> checkStatus(@RequestBody Map<String, String> request) {
        String passportNumber = request.get("passportNumber");
        String dobStr = request.get("dateOfBirth");

        if (passportNumber == null || dobStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Passport number and Date of Birth are required"));
        }

        Optional<Candidate> candidateOpt = candidateRepository.findByPassportNumber(passportNumber);

        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
        }

        Candidate candidate = candidateOpt.get();
        
        try {
            LocalDate dob = LocalDate.parse(dobStr);
            if (candidate.getDateOfBirth() == null || !candidate.getDateOfBirth().equals(dob)) {
                 return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
            }
        } catch (Exception e) {
             return ResponseEntity.badRequest().body(Map.of("error", "Invalid Date Format"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("candidate", candidate);

        List<Application> applications = applicationRepository.findByCandidateOrderByCreatedAtDesc(candidate);
        response.put("applications", applications);

        List<FlightTicket> tickets = flightTicketRepository.findByCandidateOrderByDepartureDateDesc(candidate);
        response.put("tickets", tickets);

        return ResponseEntity.ok(response);
    }
}
