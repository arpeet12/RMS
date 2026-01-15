package com.manpower.controller.api;

import com.manpower.entity.Agent;
import com.manpower.entity.Application;
import com.manpower.entity.Candidate;
import com.manpower.entity.FlightTicket;
import com.manpower.entity.Issue;
import com.manpower.entity.Job;
import com.manpower.entity.MedicalRecord;
import com.manpower.entity.StatusHistory;
import com.manpower.entity.User;
import com.manpower.repository.AgentRepository;
import com.manpower.repository.ApplicationRepository;
import com.manpower.repository.CandidateRepository;
import com.manpower.repository.FlightTicketRepository;
import com.manpower.repository.IssueRepository;
import com.manpower.repository.JobRepository;
import com.manpower.repository.MedicalRecordRepository;
import com.manpower.repository.StatusHistoryRepository;
import com.manpower.repository.UserRepository;
import com.manpower.util.FileUploadUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.util.ArrayList;
import java.util.Random;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminApiController {

    private final CandidateRepository candidateRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final ApplicationRepository applicationRepository;
    private final AgentRepository agentRepository;
    private final UserRepository userRepository;
    private final IssueRepository issueRepository;
    private final JobRepository jobRepository;
    private final FlightTicketRepository flightTicketRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthApiController authApiController;

    private String currentApprovalCodeHash;
    private long currentApprovalCodeExpiresAt;
    private final Random approvalCodeRandom = new Random();

    public AdminApiController(CandidateRepository candidateRepository,
            StatusHistoryRepository statusHistoryRepository,
            MedicalRecordRepository medicalRecordRepository,
            ApplicationRepository applicationRepository,
            AgentRepository agentRepository,
            UserRepository userRepository,
            IssueRepository issueRepository,
            JobRepository jobRepository,
            FlightTicketRepository flightTicketRepository,
            PasswordEncoder passwordEncoder,
            AuthApiController authApiController) {
        this.candidateRepository = candidateRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.applicationRepository = applicationRepository;
        this.agentRepository = agentRepository;
        this.userRepository = userRepository;
        this.issueRepository = issueRepository;
        this.jobRepository = jobRepository;
        this.flightTicketRepository = flightTicketRepository;
        this.passwordEncoder = passwordEncoder;
        this.authApiController = authApiController;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardOverview() {
        try {
            long totalCandidates = candidateRepository.count();
            long totalJobs = jobRepository.count();
            long totalIssues = issueRepository.count();

            long openIssues = issueRepository.findByStatus("OPEN").size();
            long resolvedIssues = issueRepository.findByStatus("RESOLVED").size();
            long closedIssues = issueRepository.findByStatus("CLOSED").size();

            long scheduledFlights = flightTicketRepository.findAll().stream()
                    .filter(t -> "SCHEDULED".equalsIgnoreCase(t.getStatus()))
                    .count();
            long departedFlights = flightTicketRepository.findAll().stream()
                    .filter(t -> "DEPARTED".equalsIgnoreCase(t.getStatus()))
                    .count();
            long arrivedFlights = flightTicketRepository.findAll().stream()
                    .filter(t -> "ARRIVED".equalsIgnoreCase(t.getStatus()))
                    .count();
            long cancelledFlights = flightTicketRepository.findAll().stream()
                    .filter(t -> "CANCELLED".equalsIgnoreCase(t.getStatus()))
                    .count();

            Map<String, Object> summary = new HashMap<>();
            summary.put("totalCandidates", totalCandidates);
            summary.put("totalJobs", totalJobs);
            summary.put("totalIssues", totalIssues);

            Map<String, Object> issueStats = new HashMap<>();
            issueStats.put("open", openIssues);
            issueStats.put("resolved", resolvedIssues);
            issueStats.put("closed", closedIssues);

            Map<String, Object> flightStats = new HashMap<>();
            flightStats.put("scheduled", scheduledFlights);
            flightStats.put("departed", departedFlights);
            flightStats.put("arrived", arrivedFlights);
            flightStats.put("cancelled", cancelledFlights);

            Map<String, Object> response = new HashMap<>();
            response.put("summary", summary);
            response.put("issues", issueStats);
            response.put("flights", flightStats);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to load dashboard overview: " + e.getMessage()));
        }
    }

    @PostMapping("/users/approval-code")
    public ResponseEntity<?> generateApprovalCode() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        String username = auth.getName();
        Optional<User> currentUserOpt = userRepository.findByUsername(username);
        if (currentUserOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        User currentUser = currentUserOpt.get();
        if (!"ADMIN".equals(currentUser.getRole()) || !"admin".equalsIgnoreCase(currentUser.getUsername())) {
            return ResponseEntity.status(403).body(Map.of("error", "Only super admin can generate approval codes"));
        }

        int codeInt = 100000 + approvalCodeRandom.nextInt(900000);
        String code = String.valueOf(codeInt);
        currentApprovalCodeHash = passwordEncoder.encode(code);
        currentApprovalCodeExpiresAt = System.currentTimeMillis() + 30 * 60_000;

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("code", code);
        response.put("expiresInMinutes", 30);
        return ResponseEntity.ok(response);
    }

    private boolean isApprovalCodeValid(String code) {
        if (code == null || code.isBlank()) {
            return false;
        }
        if (currentApprovalCodeHash == null) {
            return false;
        }
        if (System.currentTimeMillis() > currentApprovalCodeExpiresAt) {
            return false;
        }
        return passwordEncoder.matches(code, currentApprovalCodeHash);
    }

    @GetMapping("/officer-approval-codes")
    public ResponseEntity<?> getOfficerApprovalCodes() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        String username = auth.getName();
        Optional<User> currentUserOpt = userRepository.findByUsername(username);
        if (currentUserOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        User currentUser = currentUserOpt.get();
        if (!"ADMIN".equals(currentUser.getRole()) || !"admin".equalsIgnoreCase(currentUser.getUsername())) {
            return ResponseEntity.status(403).body(Map.of("error", "Only super admin can view approval codes"));
        }

        List<Map<String, Object>> list = authApiController.getOfficerApprovalRequestsForAdmin();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/issues")
    public ResponseEntity<?> getAllIssues() {
        List<Issue> issues = issueRepository.findAll();
        return ResponseEntity.ok(issues);
    }

    @GetMapping("/candidates")
    public ResponseEntity<?> getAllCandidates() {
        List<Candidate> candidates = candidateRepository.findAll();
        return ResponseEntity.ok(candidates);
    }

    @DeleteMapping("/candidates/{id}")
    public ResponseEntity<?> deleteCandidate(@PathVariable Long id) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
        }

        Candidate candidate = candidateOpt.get();

        try {
            // Delete related entities first to avoid foreign key constraint violations

            // 1. Status History
            List<StatusHistory> statusHistoryList = statusHistoryRepository
                    .findByCandidateOrderByChangedAtDesc(candidate);
            statusHistoryRepository.deleteAll(statusHistoryList);

            // 2. Medical Records
            List<MedicalRecord> medicalRecords = medicalRecordRepository.findByCandidateOrderByCreatedAtDesc(candidate);
            medicalRecordRepository.deleteAll(medicalRecords);

            // 3. Applications
            List<Application> applications = applicationRepository.findByCandidateOrderByCreatedAtDesc(candidate);
            applicationRepository.deleteAll(applications);

            // 4. Issues
            List<Issue> issues = issueRepository.findByCandidate(candidate);
            issueRepository.deleteAll(issues);

            // 5. Finally delete the candidate
            candidateRepository.delete(candidate);

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting candidate: " + e.getMessage()));
        }
    }

    @PostMapping("/candidates")
    public ResponseEntity<?> createCandidate(
            @RequestParam("fullName") String fullName,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "passportNumber", required = false) String passportNumber,
            @RequestParam(value = "passportExpiryDate", required = false) String passportExpiryDate,
            @RequestParam(value = "passportIssuedDistrict", required = false) String passportIssuedDistrict,
            @RequestParam(value = "dateOfBirth", required = false) String dateOfBirth,
            @RequestParam(value = "nationality", required = false) String nationality,
            @RequestParam(value = "religion", required = false) String religion,
            @RequestParam(value = "fatherName", required = false) String fatherName,
            @RequestParam(value = "motherName", required = false) String motherName,
            @RequestParam(value = "spouseName", required = false) String spouseName,
            @RequestParam(value = "noOfSons", required = false) Integer noOfSons,
            @RequestParam(value = "noOfDaughters", required = false) Integer noOfDaughters,
            @RequestParam(value = "permanentCountry", required = false) String permanentCountry,
            @RequestParam(value = "permanentDistrict", required = false) String permanentDistrict,
            @RequestParam(value = "permanentCityStreet", required = false) String permanentCityStreet,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "agentName", required = false) String agentName,
            @RequestParam(value = "height", required = false) String height,
            @RequestParam(value = "weight", required = false) String weight,
            @RequestParam(value = "experience", required = false) String experience,
            @RequestParam(value = "qualification", required = false) String qualification,
            @RequestParam(value = "technicalCourse", required = false) String technicalCourse,
            @RequestParam(value = "jobInterest", required = false) String jobInterest,
            @RequestParam(value = "countryOfInterest", required = false) String countryOfInterest) {
        try {
            Candidate candidate = new Candidate();
            candidate.setFullName(fullName);
            candidate.setGender(gender);
            candidate.setPassportNumber(passportNumber);
            if (passportExpiryDate != null && !passportExpiryDate.isEmpty())
                candidate.setPassportExpiryDate(java.time.LocalDate.parse(passportExpiryDate));
            candidate.setPassportIssuedDistrict(passportIssuedDistrict);
            if (dateOfBirth != null && !dateOfBirth.isEmpty())
                candidate.setDateOfBirth(java.time.LocalDate.parse(dateOfBirth));
            candidate.setNationality(nationality);
            candidate.setReligion(religion);
            candidate.setFatherName(fatherName);
            candidate.setMotherName(motherName);
            candidate.setSpouseName(spouseName);
            if (noOfSons != null)
                candidate.setNoOfSons(noOfSons);
            if (noOfDaughters != null)
                candidate.setNoOfDaughters(noOfDaughters);
            candidate.setPermanentCountry(permanentCountry);
            candidate.setPermanentDistrict(permanentDistrict);
            candidate.setPermanentCityStreet(permanentCityStreet);
            candidate.setPhone(phone);
            candidate.setEmail(email);
            candidate.setAgentName(agentName);
            candidate.setHeight(height);
            candidate.setWeight(weight);
            candidate.setExperience(experience);
            candidate.setQualification(qualification);
            candidate.setTechnicalCourse(technicalCourse);
            candidate.setJobInterest(jobInterest);
            candidate.setCountryOfInterest(countryOfInterest);

            if (photo != null && !photo.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
                FileUploadUtil.saveFile("uploads/candidates/photos", fileName, photo);
                candidate.setProfilePhotoPath("uploads/candidates/photos/" + fileName);
            }

            candidateRepository.save(candidate);
            return ResponseEntity.ok(candidate);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/candidates/{id}")
    public ResponseEntity<?> updateCandidate(
            @PathVariable Long id,
            @RequestParam("fullName") String fullName,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "passportNumber", required = false) String passportNumber,
            @RequestParam(value = "passportExpiryDate", required = false) String passportExpiryDate,
            @RequestParam(value = "passportIssuedDistrict", required = false) String passportIssuedDistrict,
            @RequestParam(value = "dateOfBirth", required = false) String dateOfBirth,
            @RequestParam(value = "nationality", required = false) String nationality,
            @RequestParam(value = "religion", required = false) String religion,
            @RequestParam(value = "fatherName", required = false) String fatherName,
            @RequestParam(value = "motherName", required = false) String motherName,
            @RequestParam(value = "spouseName", required = false) String spouseName,
            @RequestParam(value = "noOfSons", required = false) Integer noOfSons,
            @RequestParam(value = "noOfDaughters", required = false) Integer noOfDaughters,
            @RequestParam(value = "permanentCountry", required = false) String permanentCountry,
            @RequestParam(value = "permanentDistrict", required = false) String permanentDistrict,
            @RequestParam(value = "permanentCityStreet", required = false) String permanentCityStreet,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "agentName", required = false) String agentName,
            @RequestParam(value = "height", required = false) String height,
            @RequestParam(value = "weight", required = false) String weight,
            @RequestParam(value = "experience", required = false) String experience,
            @RequestParam(value = "qualification", required = false) String qualification,
            @RequestParam(value = "technicalCourse", required = false) String technicalCourse,
            @RequestParam(value = "jobInterest", required = false) String jobInterest,
            @RequestParam(value = "countryOfInterest", required = false) String countryOfInterest) {

        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
        }

        try {
            Candidate candidate = candidateOpt.get();
            candidate.setFullName(fullName);
            candidate.setGender(gender);
            candidate.setPassportNumber(passportNumber);
            if (passportExpiryDate != null && !passportExpiryDate.isEmpty())
                candidate.setPassportExpiryDate(java.time.LocalDate.parse(passportExpiryDate));
            candidate.setPassportIssuedDistrict(passportIssuedDistrict);
            if (dateOfBirth != null && !dateOfBirth.isEmpty())
                candidate.setDateOfBirth(java.time.LocalDate.parse(dateOfBirth));
            candidate.setNationality(nationality);
            candidate.setReligion(religion);
            candidate.setFatherName(fatherName);
            candidate.setMotherName(motherName);
            candidate.setSpouseName(spouseName);
            if (noOfSons != null)
                candidate.setNoOfSons(noOfSons);
            if (noOfDaughters != null)
                candidate.setNoOfDaughters(noOfDaughters);
            candidate.setPermanentCountry(permanentCountry);
            candidate.setPermanentDistrict(permanentDistrict);
            candidate.setPermanentCityStreet(permanentCityStreet);
            candidate.setPhone(phone);
            candidate.setEmail(email);
            candidate.setAgentName(agentName);
            candidate.setHeight(height);
            candidate.setWeight(weight);
            candidate.setExperience(experience);
            candidate.setQualification(qualification);
            candidate.setTechnicalCourse(technicalCourse);
            candidate.setJobInterest(jobInterest);
            candidate.setCountryOfInterest(countryOfInterest);

            if (photo != null && !photo.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
                FileUploadUtil.saveFile("uploads/candidates/photos", fileName, photo);
                candidate.setProfilePhotoPath("uploads/candidates/photos/" + fileName);
            }

            candidateRepository.save(candidate);
            return ResponseEntity.ok(candidate);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/candidates/{id}")
    public ResponseEntity<?> getCandidate(@PathVariable Long id) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            List<StatusHistory> statusHistory = statusHistoryRepository.findByCandidateOrderByChangedAtDesc(candidate);
            List<MedicalRecord> medicalRecords = medicalRecordRepository.findByCandidateOrderByCreatedAtDesc(candidate);
            List<Application> applications = applicationRepository.findByCandidateOrderByCreatedAtDesc(candidate);
            List<Issue> issues = issueRepository.findByCandidate(candidate);

            Map<String, Object> response = new HashMap<>();
            response.put("candidate", candidate);
            response.put("statusHistory", statusHistory);
            response.put("medicalRecords", medicalRecords);
            response.put("applications", applications);
            response.put("issues", issues);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
    }

    @PostMapping("/candidates/{id}/medical-records")
    public ResponseEntity<?> addMedicalRecord(@PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
        }

        try {
            Candidate candidate = candidateOpt.get();

            MedicalRecord record = new MedicalRecord();
            record.setCandidate(candidate);
            record.setHealthCenter(body.get("healthCenter"));
            record.setStickerNo(body.get("stickerNo"));
            String medicalDate = body.get("medicalDate");
            if (medicalDate != null && !medicalDate.isEmpty()) {
                record.setMedicalDate(java.time.LocalDate.parse(medicalDate));
            }
            String medicalExpiry = body.get("medicalExpiry");
            if (medicalExpiry != null && !medicalExpiry.isEmpty()) {
                record.setMedicalExpiry(java.time.LocalDate.parse(medicalExpiry));
            }
            record.setResult(body.getOrDefault("result", "Fit"));
            record.setRemarks(body.getOrDefault("remarks", ""));

            MedicalRecord saved = medicalRecordRepository.save(record);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to add medical record: " + e.getMessage()));
        }
    }

    @DeleteMapping("/medical-records/{recordId}")
    public ResponseEntity<?> deleteMedicalRecord(@PathVariable Long recordId) {
        if (!medicalRecordRepository.existsById(recordId)) {
            return ResponseEntity.status(404).body(Map.of("error", "Medical record not found"));
        }
        medicalRecordRepository.deleteById(recordId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/candidates/{id}/applications")
    public ResponseEntity<?> addApplication(@PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
        }

        try {
            Candidate candidate = candidateOpt.get();

            Application application = new Application();
            application.setCandidate(candidate);

            String jobIdStr = body.get("jobId");
            if (jobIdStr != null && !jobIdStr.isEmpty()) {
                try {
                    Long jobId = Long.parseLong(jobIdStr);
                    Optional<Job> jobOpt = jobRepository.findById(jobId);
                    if (jobOpt.isPresent()) {
                        application.setJob(jobOpt.get());
                    }
                } catch (NumberFormatException nfe) {
                    System.err.println("Invalid jobId format: " + jobIdStr);
                }
            }

            application.setCountry(body.get("country"));
            application.setInterviewed(body.get("interviewed"));
            String interviewDate = body.get("interviewDate");
            if (interviewDate != null && !interviewDate.isEmpty()) {
                application.setInterviewDate(java.time.LocalDate.parse(interviewDate));
            }
            application.setInterviewResult(body.getOrDefault("interviewResult", "Pass"));
            application.setRemarks(body.getOrDefault("remarks", ""));

            Application saved = applicationRepository.save(application);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to add application: " + e.getMessage()));
        }
    }

    @PutMapping("/applications/{appId}")
    public ResponseEntity<?> updateApplication(@PathVariable Long appId,
            @RequestBody Map<String, Object> body) {
        Optional<Application> appOpt = applicationRepository.findById(appId);
        if (appOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Application not found"));
        }

        try {
            Application application = appOpt.get();

            // Status Update
            if (body.containsKey("status")) {
                application.setStatus((String) body.get("status"));
            }

            // Forward Date
            if (body.containsKey("applicationForwardedDate")) {
                String dateStr = (String) body.get("applicationForwardedDate");
                if (dateStr != null && !dateStr.isEmpty()) {
                    application.setApplicationForwardedDate(java.time.LocalDate.parse(dateStr));
                }
            }

            // Visa Details
            if (body.containsKey("visaNumber")) {
                application.setVisaNumber((String) body.get("visaNumber"));
            }
            if (body.containsKey("visaIssuedDate")) {
                String dateStr = (String) body.get("visaIssuedDate");
                if (dateStr != null && !dateStr.isEmpty()) {
                    application.setVisaIssuedDate(java.time.LocalDate.parse(dateStr));
                }
            }
            if (body.containsKey("visaExpiryDate")) {
                String dateStr = (String) body.get("visaExpiryDate");
                if (dateStr != null && !dateStr.isEmpty()) {
                    application.setVisaExpiryDate(java.time.LocalDate.parse(dateStr));
                }
            }

            // Ministry Approval
            if (body.containsKey("ministryChalaniNo")) {
                application.setMinistryChalaniNo((String) body.get("ministryChalaniNo"));
            }
            if (body.containsKey("ministryApprovalDate")) {
                String dateStr = (String) body.get("ministryApprovalDate");
                if (dateStr != null && !dateStr.isEmpty()) {
                    application.setMinistryApprovalDate(java.time.LocalDate.parse(dateStr));
                }
            }

            // Flight
            if (body.containsKey("flightDate")) {
                String dateStr = (String) body.get("flightDate");
                if (dateStr != null && !dateStr.isEmpty()) {
                    application.setFlightDate(java.time.LocalDate.parse(dateStr));
                }
            }

            Application saved = applicationRepository.save(application);
            // Explicitly fetch with job relationship to ensure it's loaded for JSON
            // serialization
            Optional<Application> savedWithJob = applicationRepository.findByIdWithJob(saved.getId());
            return ResponseEntity.ok(savedWithJob.orElse(saved));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update application: " + e.getMessage()));
        }
    }

    @DeleteMapping("/applications/{appId}")
    public ResponseEntity<?> deleteApplication(@PathVariable Long appId) {
        if (!applicationRepository.existsById(appId)) {
            return ResponseEntity.status(404).body(Map.of("error", "Application not found"));
        }
        applicationRepository.deleteById(appId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/candidates/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
            @RequestBody Map<String, String> request) {
        System.out.println("Received status update request for candidate ID: " + id);
        try {
            if (request == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Request body is missing"));
            }

            Optional<Candidate> candidateOpt = candidateRepository.findById(id);
            if (!candidateOpt.isPresent()) {
                System.out.println("Candidate not found with ID: " + id);
                return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
            }

            Candidate candidate = candidateOpt.get();
            String statusType = request.get("statusType");
            String statusValue = request.get("statusValue");
            String remarks = request.getOrDefault("remarks", "");

            System.out.println("Status Type: " + statusType + ", Value: " + statusValue);

            if (statusType == null || statusValue == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "statusType and statusValue are required"));
            }

            String oldStatus = "NOT_UPLOADED"; // Default
            boolean changed = false;

            if (statusType != null) {
                switch (statusType) {
                    case "passport":
                        oldStatus = candidate.getPassportStatus();
                        candidate.setPassportStatus(statusValue);
                        changed = true;
                        break;
                    case "medical":
                        oldStatus = candidate.getMedicalStatus();
                        candidate.setMedicalStatus(statusValue);
                        changed = true;
                        break;
                    case "police":
                        oldStatus = candidate.getPoliceReportStatus();
                        candidate.setPoliceReportStatus(statusValue);
                        changed = true;
                        break;
                    case "health":
                        oldStatus = candidate.getHealthReportStatus();
                        candidate.setHealthReportStatus(statusValue);
                        changed = true;
                        break;
                    case "visa":
                        oldStatus = candidate.getVisaStatus();
                        candidate.setVisaStatus(statusValue);
                        changed = true;
                        break;
                    case "insurance":
                        oldStatus = candidate.getInsuranceStatus();
                        candidate.setInsuranceStatus(statusValue);
                        changed = true;
                        break;
                    default:
                        System.out.println("Unknown status type: " + statusType);
                }
            }

            if (changed) {
                candidateRepository.save(candidate);
                System.out.println("Candidate saved.");
            }

            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                String changedBy = (auth != null && auth.getName() != null) ? auth.getName() : "Admin";

                // Truncate fields to fit DB
                if (remarks != null && remarks.length() > 250)
                    remarks = remarks.substring(0, 250);
                if (oldStatus == null)
                    oldStatus = "NOT_UPLOADED";

                StatusHistory statusHistory = new StatusHistory();
                statusHistory.setCandidate(candidate);
                statusHistory.setDocumentType(statusType);
                statusHistory.setOldStatus(oldStatus);
                statusHistory.setNewStatus(statusValue);
                statusHistory.setChangedBy(changedBy);
                statusHistory.setRemarks(remarks);

                statusHistoryRepository.save(statusHistory);
                System.out.println("Status history saved.");
            } catch (Exception historyEx) {
                // Log history error but don't fail the request since the status update itself
                // succeeded
                System.err.println("Failed to save status history: " + historyEx.getMessage());
                historyEx.printStackTrace();
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Status updated successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error updating status: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update status: " + e.getMessage()));
        }
    }

    @PostMapping("/candidates/{id}/documents/{documentType}")
    public ResponseEntity<?> uploadDocument(@PathVariable Long id,
            @PathVariable String documentType,
            @RequestParam("file") MultipartFile file) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (!candidateOpt.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
        }

        Candidate candidate = candidateOpt.get();
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            String fileName = StringUtils.cleanPath(file.getOriginalFilename());
            String uploadDir = "uploads/candidates/" + candidate.getId() + "/documents";
            FileUploadUtil.saveFile(uploadDir, fileName, file);
            String filePath = "/uploads/candidates/" + candidate.getId() + "/documents/" + fileName;

            String oldStatus = "";
            switch (documentType) {
                case "passport":
                    candidate.setPassportPhotoPath(filePath);
                    oldStatus = candidate.getPassportStatus();
                    candidate.setPassportStatus("PENDING");
                    break;
                case "medical":
                    if (!fileName.toLowerCase().endsWith(".pdf")) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Only PDF files allowed"));
                    }
                    candidate.setMedicalReportPath(filePath);
                    oldStatus = candidate.getMedicalStatus();
                    candidate.setMedicalStatus("PENDING");
                    break;
                case "police":
                    if (!fileName.toLowerCase().endsWith(".pdf")) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Only PDF files allowed"));
                    }
                    candidate.setPoliceReportPath(filePath);
                    oldStatus = candidate.getPoliceReportStatus();
                    candidate.setPoliceReportStatus("PENDING");
                    break;
                case "health":
                    if (!fileName.toLowerCase().endsWith(".pdf")) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Only PDF files allowed"));
                    }
                    candidate.setHealthReportPath(filePath);
                    oldStatus = candidate.getHealthReportStatus();
                    candidate.setHealthReportStatus("PENDING");
                    break;
                case "visa":
                    candidate.setVisaDocumentPath(filePath);
                    oldStatus = candidate.getVisaStatus();
                    candidate.setVisaStatus("PENDING");
                    break;
                case "insurance":
                    candidate.setInsuranceDocumentPath(filePath);
                    oldStatus = candidate.getInsuranceStatus();
                    candidate.setInsuranceStatus("PENDING");
                    break;
                case "cv":
                    if (!fileName.toLowerCase().endsWith(".pdf")) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Only PDF files allowed"));
                    }
                    candidate.setCvPath(filePath);
                    oldStatus = "NOT_UPLOADED";
                    break;
                default:
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid document type"));
            }

            candidateRepository.save(candidate);

            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                String changedBy = (auth != null && auth.getName() != null) ? auth.getName() : "Admin";

                StatusHistory statusHistory = new StatusHistory();
                statusHistory.setCandidate(candidate);
                statusHistory.setDocumentType(documentType);
                statusHistory.setOldStatus(oldStatus);
                statusHistory.setNewStatus("PENDING");
                statusHistory.setChangedBy(changedBy);
                statusHistory.setRemarks(documentType + " document uploaded by admin");
                statusHistoryRepository.save(statusHistory);
            } catch (Exception historyEx) {
                System.err.println("Failed to save status history during upload: " + historyEx.getMessage());
                historyEx.printStackTrace();
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Document uploaded successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error uploading file: " + e.getMessage()));
        }
    }

    @GetMapping("/candidates/{id}/download-all-documents")
    public ResponseEntity<?> downloadAllDocuments(@PathVariable Long id) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (!candidateOpt.isPresent()) {
            return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
        }
        Candidate candidate = candidateOpt.get();

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ZipOutputStream zos = new ZipOutputStream(baos);

            Map<String, String> filesToZip = new HashMap<>();

            if (StringUtils.hasText(candidate.getPassportPhotoPath()))
                filesToZip.put("Passport", candidate.getPassportPhotoPath());
            if (StringUtils.hasText(candidate.getMedicalReportPath()))
                filesToZip.put("MedicalReport", candidate.getMedicalReportPath());
            if (StringUtils.hasText(candidate.getPoliceReportPath()))
                filesToZip.put("PoliceReport", candidate.getPoliceReportPath());
            if (StringUtils.hasText(candidate.getHealthReportPath()))
                filesToZip.put("HealthReport", candidate.getHealthReportPath());
            if (StringUtils.hasText(candidate.getVisaDocumentPath()))
                filesToZip.put("Visa", candidate.getVisaDocumentPath());
            if (StringUtils.hasText(candidate.getInsuranceDocumentPath()))
                filesToZip.put("Insurance", candidate.getInsuranceDocumentPath());
            if (StringUtils.hasText(candidate.getCvPath()))
                filesToZip.put("CV", candidate.getCvPath());
            if (StringUtils.hasText(candidate.getProfilePhotoPath()))
                filesToZip.put("ProfilePhoto", candidate.getProfilePhotoPath());

            for (Map.Entry<String, String> entry : filesToZip.entrySet()) {
                String pathStr = entry.getValue();
                if (pathStr.startsWith("/"))
                    pathStr = pathStr.substring(1); // Remove leading slash

                Path path = Paths.get(pathStr);
                if (Files.exists(path)) {
                    String originalFileName = path.getFileName().toString();
                    String extension = "";
                    int i = originalFileName.lastIndexOf('.');
                    if (i >= 0) {
                        extension = originalFileName.substring(i);
                    }

                    ZipEntry zipEntry = new ZipEntry(entry.getKey() + extension);
                    zos.putNextEntry(zipEntry);
                    Files.copy(path, zos);
                    zos.closeEntry();
                }
            }

            zos.close();

            byte[] bytes = baos.toByteArray();
            ByteArrayResource resource = new ByteArrayResource(bytes);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + candidate.getFullName().replaceAll("\\s+", "_")
                                    + "_Documents.zip\"")
                    .contentLength(bytes.length)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error creating zip file: " + e.getMessage()));
        }
    }

    // ===== Flight Tickets =====

    @GetMapping("/candidates/{id}/flight-tickets")
    public ResponseEntity<?> getFlightTickets(@PathVariable Long id) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
        }
        return ResponseEntity.ok(flightTicketRepository.findByCandidateOrderByDepartureDateDesc(candidateOpt.get()));
    }

    @PostMapping("/candidates/{id}/flight-tickets")
    public ResponseEntity<?> addFlightTicket(@PathVariable Long id, @RequestBody FlightTicket ticket) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
        }
        ticket.setCandidate(candidateOpt.get());
        return ResponseEntity.ok(flightTicketRepository.save(ticket));
    }

    @PutMapping("/flight-tickets/{ticketId}")
    public ResponseEntity<?> updateFlightTicket(@PathVariable Long ticketId, @RequestBody FlightTicket ticketDetails) {
        Optional<FlightTicket> ticketOpt = flightTicketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Ticket not found"));
        }
        FlightTicket ticket = ticketOpt.get();
        ticket.setAirline(ticketDetails.getAirline());
        ticket.setDepartureFrom(ticketDetails.getDepartureFrom());
        ticket.setDestination(ticketDetails.getDestination());
        ticket.setDepartureDate(ticketDetails.getDepartureDate());
        ticket.setDepartureTime(ticketDetails.getDepartureTime());
        ticket.setStatus(ticketDetails.getStatus());
        ticket.setRemarks(ticketDetails.getRemarks());

        return ResponseEntity.ok(flightTicketRepository.save(ticket));
    }

    @DeleteMapping("/flight-tickets/{ticketId}")
    public ResponseEntity<?> deleteFlightTicket(@PathVariable Long ticketId) {
        if (!flightTicketRepository.existsById(ticketId)) {
            return ResponseEntity.status(404).body(Map.of("error", "Ticket not found"));
        }
        flightTicketRepository.deleteById(ticketId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ===== Agents Management (Admin) =====

    @GetMapping("/agents")
    public ResponseEntity<?> getAgents() {
        List<User> users = userRepository.findAll();
        for (User u : users) {
            if ("AGENT".equals(u.getRole())) {
                agentRepository.findByUser(u).orElseGet(() -> {
                    Agent a = new Agent();
                    a.setUser(u);
                    a.setFullName(u.getUsername());
                    a.setStatus("ACTIVE");
                    return agentRepository.save(a);
                });
            }
        }
        return ResponseEntity.ok(agentRepository.findAll());
    }

    @GetMapping("/agents/{id}")
    public ResponseEntity<?> getAgent(@PathVariable Long id) {
        Optional<Agent> agentOpt = agentRepository.findById(id);
        if (agentOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Agent not found"));
        }
        return ResponseEntity.ok(agentOpt.get());
    }

    @PutMapping("/agents/{id}/permissions")
    public ResponseEntity<?> updateAgentPermissions(@PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Optional<Agent> agentOpt = agentRepository.findById(id);
        if (agentOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Agent not found"));
        }

        try {
            Agent agent = agentOpt.get();
            Object permissions = body.get("permissions");
            if (permissions == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "permissions is required"));
            }

            // Simple JSON serialization using Jackson's ObjectMapper without injection
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String json = mapper.writeValueAsString(permissions);
            agent.setPermissionsJson(json);
            Agent saved = agentRepository.save(agent);

            return ResponseEntity.ok(Map.of("success", true, "agent", saved));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update permissions: " + e.getMessage()));
        }
    }

    @GetMapping("/candidates/{id}/issues")
    public ResponseEntity<?> getIssues(@PathVariable Long id) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
        }
        Candidate candidate = candidateOpt.get();
        List<Issue> issues = issueRepository.findByCandidate(candidate);
        return ResponseEntity.ok(issues);
    }

    @PostMapping("/candidates/{id}/issues")
    public ResponseEntity<?> addIssue(@PathVariable Long id, @RequestBody Issue issue) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Candidate not found"));
        }
        Candidate candidate = candidateOpt.get();
        issue.setCandidate(candidate);
        Issue savedIssue = issueRepository.save(issue);
        return ResponseEntity.ok(savedIssue);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = users.stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("username", user.getUsername());
            map.put("role", user.getRole());
            map.put("profilePhotoPath", user.getProfilePhotoPath());

            if ("AGENT".equals(user.getRole())) {
                Optional<Agent> agentOpt = agentRepository.findByUser(user);
                agentOpt.ifPresent(agent -> map.put("agent", agent));
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String role = body.get("role");
        String approvalCode = body.get("approvalCode");

        if (username == null || password == null || role == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username, password and role are required"));
        }

        if ("ADMIN".equals(role) || "OFFICER".equals(role)) {
            if (approvalCode == null || approvalCode.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Approval code is required for ADMIN or OFFICER accounts"));
            }
            if (!isApprovalCodeValid(approvalCode)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired approval code"));
            }
            currentApprovalCodeHash = null;
            currentApprovalCodeExpiresAt = 0L;
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }

        try {
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            User savedUser = userRepository.save(user);

            if ("AGENT".equals(role)) {
                Agent agent = new Agent();
                agent.setUser(savedUser);
                agent.setFullName(username);
                agent.setStatus("ACTIVE");
                agentRepository.save(agent);
            }

            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create user: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        try {
            User user = userOpt.get();

            if (body.containsKey("username")) {
                String newUsername = body.get("username");
                if (!newUsername.equals(user.getUsername()) && userRepository.findByUsername(newUsername).isPresent()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
                }
                user.setUsername(newUsername);
            }

            if (body.containsKey("password") && body.get("password") != null && !body.get("password").isEmpty()) {
                user.setPassword(passwordEncoder.encode(body.get("password")));
            }

            if (body.containsKey("role")) {
                String newRole = body.get("role");
                // Handle role change logic if needed (e.g. creating/deleting agent entity)
                if (!newRole.equals(user.getRole())) {
                    if ("AGENT".equals(newRole)) {
                        // Create agent if not exists
                        if (agentRepository.findByUser(user).isEmpty()) {
                            Agent agent = new Agent();
                            agent.setUser(user);
                            agent.setFullName(user.getUsername());
                            agent.setStatus("ACTIVE");
                            agentRepository.save(agent);
                        }
                    }
                    // We don't delete agent entity if role changes from AGENT, to preserve history,
                    // or we could depending on requirements. For now, keep it simple.
                    user.setRole(newRole);
                }
            }

            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update user: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();
        if (!"OFFICER".equals(user.getRole())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only OFFICER accounts can be approved via this endpoint"));
        }

        user.setStatus("ACTIVE");
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("success", true, "message", "User approved successfully"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        try {
            // Check if user is agent and delete agent first if necessary (Cascading usually
            // handles this if configured,
            // but let's be safe if no cascade)
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                Optional<Agent> agentOpt = agentRepository.findByUser(user);
                agentOpt.ifPresent(agentRepository::delete);
            }

            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting user: " + e.getMessage()));
        }
    }

    // List all flight tickets (admin) with candidate info
    @GetMapping("/flight-tickets")
    public ResponseEntity<?> getAllFlightTickets(@RequestParam(required = false) String status) {
        try {
            List<FlightTicket> all = flightTicketRepository.findAllByOrderByDepartureDateDesc();
            if (status != null && !status.isBlank()) {
                String s = status.trim().toUpperCase();
                all = all.stream()
                        .filter(t -> t.getStatus() != null && t.getStatus().equalsIgnoreCase(s))
                        .toList();
            }
            List<Map<String, Object>> result = all.stream().map(t -> {
                Map<String, Object> m = new java.util.HashMap<>();
                m.put("id", t.getId());
                m.put("airline", t.getAirline());
                m.put("departureFrom", t.getDepartureFrom());
                m.put("destination", t.getDestination());
                m.put("departureDate", t.getDepartureDate());
                m.put("departureTime", t.getDepartureTime());
                m.put("status", t.getStatus());
                m.put("remarks", t.getRemarks());
                m.put("candidateId", t.getCandidate() != null ? t.getCandidate().getId() : null);
                m.put("candidateName", t.getCandidate() != null ? t.getCandidate().getFullName() : null);
                return m;
            }).toList();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to load flight tickets: " + e.getMessage()));
        }
    }
}
