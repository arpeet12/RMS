package com.manpower.controller.api;

import com.manpower.entity.*;
import com.manpower.repository.*;
import com.manpower.util.FileUploadUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/demand-details")
@CrossOrigin(origins = "*")
public class DemandDetailsApiController {

    private final JobRepository jobRepository;
    private final AdvertisementRepository advertisementRepository;
    private final DemandFileRepository demandFileRepository;
    private final IssueRepository issueRepository;

    public DemandDetailsApiController(
            JobRepository jobRepository,
            AdvertisementRepository advertisementRepository,
            DemandFileRepository demandFileRepository,
            IssueRepository issueRepository) {
        this.jobRepository = jobRepository;
        this.advertisementRepository = advertisementRepository;
        this.demandFileRepository = demandFileRepository;
        this.issueRepository = issueRepository;
    }

    // Get all details for a company's demands
    @GetMapping("/company/{company}")
    public ResponseEntity<?> getDemandDetailsByCompany(@PathVariable String company) {
        try {
            List<Job> jobs = jobRepository.findAll().stream()
                    .filter(job -> company.equals(job.getCompany()))
                    .collect(Collectors.toList());

            if (jobs.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "No demands found for company: " + company));
            }

            // Get all related data
            List<Advertisement> advertisements = new ArrayList<>();
            List<DemandFile> files = new ArrayList<>();
            List<Issue> issues = new ArrayList<>();

            for (Job job : jobs) {
                advertisements.addAll(advertisementRepository.findByJob(job));
                files.addAll(demandFileRepository.findByJob(job));
                issues.addAll(issueRepository.findByJob(job));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("demandLines", jobs);
            response.put("advertisements", advertisements);
            response.put("files", files);
            response.put("issues", issues);
            response.put("demand", Map.of(
                    "company", company,
                    "country", jobs.get(0).getCountry(),
                    "companyDetail", jobs.get(0).getDescription() != null ? jobs.get(0).getDescription() : "",
                    "demandExpiry", jobs.get(0).getDeadline() != null ? jobs.get(0).getDeadline().toString() : ""
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching demand details: " + e.getMessage()));
        }
    }

    // Advertisement endpoints
    @PostMapping("/advertisements")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OFFICER') or hasRole('AGENT')")
    public ResponseEntity<?> createAdvertisement(
            @RequestParam("jobId") Long jobId,
            @RequestParam("newspaper") String newspaper,
            @RequestParam("publishedDate") String publishedDate,
            @RequestParam(value = "pageNo", required = false) String pageNo,
            @RequestParam(value = "remarks", required = false) String remarks) {
        try {
            Optional<Job> jobOpt = jobRepository.findById(jobId);
            if (jobOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Job not found"));
            }

            Advertisement advertisement = new Advertisement();
            advertisement.setJob(jobOpt.get());
            advertisement.setNewspaper(newspaper);
            advertisement.setPublishedDate(LocalDate.parse(publishedDate));
            advertisement.setPageNo(pageNo);
            advertisement.setRemarks(remarks);

            Advertisement saved = advertisementRepository.save(advertisement);
            return ResponseEntity.ok(Map.of("success", true, "advertisement", saved));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error creating advertisement: " + e.getMessage()));
        }
    }

    @DeleteMapping("/advertisements/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OFFICER') or hasRole('AGENT')")
    public ResponseEntity<?> deleteAdvertisement(@PathVariable Long id) {
        try {
            if (advertisementRepository.existsById(id)) {
                advertisementRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("success", true, "message", "Advertisement deleted"));
            }
            return ResponseEntity.status(404).body(Map.of("error", "Advertisement not found"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting advertisement: " + e.getMessage()));
        }
    }

    // File endpoints
    @PostMapping("/files")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OFFICER') or hasRole('AGENT')")
    public ResponseEntity<?> uploadFile(
            @RequestParam("jobId") Long jobId,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file") MultipartFile file) {
        try {
            Optional<Job> jobOpt = jobRepository.findById(jobId);
            if (jobOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Job not found"));
            }

            String fileName = StringUtils.cleanPath(file.getOriginalFilename());
            String uploadDir = "uploads/demand-files/" + jobId;
            FileUploadUtil.saveFile(uploadDir, fileName, file);
            String filePath = "/uploads/demand-files/" + jobId + "/" + fileName;

            DemandFile demandFile = new DemandFile();
            demandFile.setJob(jobOpt.get());
            demandFile.setName(name);
            demandFile.setDescription(description);
            demandFile.setFilePath(filePath);

            DemandFile saved = demandFileRepository.save(demandFile);
            return ResponseEntity.ok(Map.of("success", true, "file", saved));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error uploading file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error creating file record: " + e.getMessage()));
        }
    }

    @DeleteMapping("/files/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OFFICER') or hasRole('AGENT')")
    public ResponseEntity<?> deleteFile(@PathVariable Long id) {
        try {
            Optional<DemandFile> fileOpt = demandFileRepository.findById(id);
            if (fileOpt.isPresent()) {
                demandFileRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("success", true, "message", "File deleted"));
            }
            return ResponseEntity.status(404).body(Map.of("error", "File not found"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting file: " + e.getMessage()));
        }
    }

    // Issue endpoints
    @PostMapping("/issues")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OFFICER') or hasRole('AGENT')")
    public ResponseEntity<?> createIssue(
            @RequestParam("jobId") Long jobId,
            @RequestParam("title") String title,
            @RequestParam("description") String description) {
        try {
            Optional<Job> jobOpt = jobRepository.findById(jobId);
            if (jobOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Job not found"));
            }

            Issue issue = new Issue();
            issue.setJob(jobOpt.get());
            issue.setTitle(title);
            issue.setDescription(description);
            issue.setStatus("OPEN");

            Issue saved = issueRepository.save(issue);
            return ResponseEntity.ok(Map.of("success", true, "issue", saved));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error creating issue: " + e.getMessage()));
        }
    }

    @PutMapping("/issues/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OFFICER') or hasRole('AGENT')")
    public ResponseEntity<?> updateIssueStatus(
            @PathVariable Long id,
            @RequestParam("status") String status) {
        try {
            Optional<Issue> issueOpt = issueRepository.findById(id);
            if (issueOpt.isPresent()) {
                Issue issue = issueOpt.get();
                issue.setStatus(status);
                Issue saved = issueRepository.save(issue);
                return ResponseEntity.ok(Map.of("success", true, "issue", saved));
            }
            return ResponseEntity.status(404).body(Map.of("error", "Issue not found"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error updating issue: " + e.getMessage()));
        }
    }

    @DeleteMapping("/issues/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OFFICER') or hasRole('AGENT')")
    public ResponseEntity<?> deleteIssue(@PathVariable Long id) {
        try {
            if (issueRepository.existsById(id)) {
                issueRepository.deleteById(id);
                return ResponseEntity.ok(Map.of("success", true, "message", "Issue deleted"));
            }
            return ResponseEntity.status(404).body(Map.of("error", "Issue not found"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting issue: " + e.getMessage()));
        }
    }
}

