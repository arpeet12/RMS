package com.manpower.controller.api;

import com.manpower.entity.Job;
import com.manpower.repository.AdvertisementRepository;
import com.manpower.repository.DemandFileRepository;
import com.manpower.repository.IssueRepository;
import com.manpower.repository.JobRepository;
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
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobApiController {

    private final JobRepository jobRepository;
    private final AdvertisementRepository advertisementRepository;
    private final DemandFileRepository demandFileRepository;
    private final IssueRepository issueRepository;

    public JobApiController(JobRepository jobRepository,
            AdvertisementRepository advertisementRepository,
            DemandFileRepository demandFileRepository,
            IssueRepository issueRepository) {
        this.jobRepository = jobRepository;
        this.advertisementRepository = advertisementRepository;
        this.demandFileRepository = demandFileRepository;
        this.issueRepository = issueRepository;
    }

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getJob(@PathVariable("id") Long id) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isPresent()) {
            return ResponseEntity.ok(jobOpt.get());
        }
        return ResponseEntity.status(404).body(Map.of("error", "Job not found"));
    }

    @GetMapping("/grouped")
    public ResponseEntity<?> getGroupedDemands(
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "company", required = false) String company,
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate) {
        try {
            List<Job> allJobs = jobRepository.findAll();

            // Apply filters
            List<Job> filteredJobs = allJobs.stream()
                    .filter(job -> country == null || country.isEmpty() || country.equals("No Preferences") ||
                            (job.getCountry() != null && job.getCountry().equalsIgnoreCase(country)))
                    .filter(job -> company == null || company.isEmpty() || company.equals("No Preferences") ||
                            (job.getCompany() != null && job.getCompany().equalsIgnoreCase(company)))
                    .filter(job -> {
                        if (fromDate == null || fromDate.isEmpty())
                            return true;
                        try {
                            LocalDate from = LocalDate.parse(fromDate);
                            return job.getCreatedAt() != null && !job.getCreatedAt().isBefore(from);
                        } catch (Exception e) {
                            return true;
                        }
                    })
                    .filter(job -> {
                        if (toDate == null || toDate.isEmpty())
                            return true;
                        try {
                            LocalDate to = LocalDate.parse(toDate);
                            return job.getCreatedAt() != null && !job.getCreatedAt().isAfter(to);
                        } catch (Exception e) {
                            return true;
                        }
                    })
                    .collect(Collectors.toList());

            // Group by country and company
            Map<String, Map<String, List<Job>>> grouped = filteredJobs.stream()
                    .collect(Collectors.groupingBy(
                            job -> job.getCountry() != null ? job.getCountry() : "Unknown",
                            Collectors.groupingBy(
                                    job -> job.getCompany() != null ? job.getCompany() : "Unknown")));

            // Convert to response format
            List<Map<String, Object>> result = new ArrayList<>();
            for (Map.Entry<String, Map<String, List<Job>>> countryEntry : grouped.entrySet()) {
                for (Map.Entry<String, List<Job>> companyEntry : countryEntry.getValue().entrySet()) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("country", countryEntry.getKey());
                    item.put("company", companyEntry.getKey());
                    item.put("demandCount", companyEntry.getValue().size());
                    result.add(item);
                }
            }

            // Sort by country, then company
            result.sort((a, b) -> {
                int countryCompare = ((String) a.get("country")).compareTo((String) b.get("country"));
                if (countryCompare != 0)
                    return countryCompare;
                return ((String) a.get("company")).compareTo((String) b.get("company"));
            });

            return ResponseEntity.ok(Map.of("data", result, "total", result.size()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Error fetching grouped demands: " + e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('OFFICER') or hasRole('AGENT')")
    public ResponseEntity<?> createJob(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("country") String country,
            @RequestParam(value = "company", required = false) String company,
            @RequestParam("salary") String salary,
            @RequestParam("vacancyCount") Integer vacancyCount,
            @RequestParam("deadline") String deadline,
            @RequestParam(value = "requiredMale", required = false) Integer requiredMale,
            @RequestParam(value = "requiredFemale", required = false) Integer requiredFemale,
            @RequestParam(value = "currency", required = false, defaultValue = "$") String currency,
            @RequestParam(value = "overtime", required = false) String overtime,
            @RequestParam(value = "workingHours", required = false) String workingHours,
            @RequestParam(value = "workDaysPerWeek", required = false) String workDaysPerWeek,
            @RequestParam(value = "yearlyLeave", required = false) String yearlyLeave,
            @RequestParam(value = "food", required = false) String food,
            @RequestParam(value = "housing", required = false) String housing,
            @RequestParam(value = "tenure", required = false) String tenure,
            @RequestParam(value = "isUrgent", required = false, defaultValue = "false") Boolean isUrgent,
            @RequestParam(value = "isFeatured", required = false, defaultValue = "false") Boolean isFeatured,
            @RequestParam(value = "isZeroCost", required = false, defaultValue = "false") Boolean isZeroCost,
            @RequestParam(value = "image", required = false) MultipartFile multipartFile) {
        try {
            Job job = new Job();
            job.setTitle(title);
            job.setDescription(description);
            job.setCountry(country);
            job.setCompany(company);
            job.setSalary(salary);
            job.setVacancyCount(vacancyCount);
            job.setDeadline(java.time.LocalDate.parse(deadline));

            // New Demand Fields
            job.setRequiredMale(requiredMale);
            job.setRequiredFemale(requiredFemale);
            job.setCurrency(currency);
            job.setOvertime(overtime);
            job.setWorkingHours(workingHours);
            job.setWorkDaysPerWeek(workDaysPerWeek);
            job.setYearlyLeave(yearlyLeave);
            job.setFood(food);
            job.setHousing(housing);
            job.setTenure(tenure);

            // Homepage Flags
            job.setIsUrgent(isUrgent);
            job.setIsFeatured(isFeatured);
            job.setIsZeroCost(isZeroCost);

            if (multipartFile != null && !multipartFile.isEmpty()) {
                String originalFilename = multipartFile.getOriginalFilename();
                String fileName = originalFilename != null ? StringUtils.cleanPath(originalFilename) : "image.jpg";
                job.setPhotoPath(fileName);
                Job savedJob = jobRepository.save(job);

                String uploadDir = "uploads/jobs/" + savedJob.getId();
                FileUploadUtil.saveFile(uploadDir, fileName, multipartFile);
                job.setPhotoPath("/uploads/jobs/" + savedJob.getId() + "/" + fileName);
                jobRepository.save(job);
            } else {
                jobRepository.save(job);
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Job created successfully", "job", job));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error uploading image: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error creating job: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OFFICER') or hasRole('AGENT')")
    public ResponseEntity<?> updateJob(
            @PathVariable("id") Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("country") String country,
            @RequestParam(value = "company", required = false) String company,
            @RequestParam("salary") String salary,
            @RequestParam("vacancyCount") Integer vacancyCount,
            @RequestParam("deadline") String deadline,
            @RequestParam(value = "requiredMale", required = false) Integer requiredMale,
            @RequestParam(value = "requiredFemale", required = false) Integer requiredFemale,
            @RequestParam(value = "currency", required = false, defaultValue = "$") String currency,
            @RequestParam(value = "overtime", required = false) String overtime,
            @RequestParam(value = "workingHours", required = false) String workingHours,
            @RequestParam(value = "workDaysPerWeek", required = false) String workDaysPerWeek,
            @RequestParam(value = "yearlyLeave", required = false) String yearlyLeave,
            @RequestParam(value = "food", required = false) String food,
            @RequestParam(value = "housing", required = false) String housing,
            @RequestParam(value = "tenure", required = false) String tenure,
            @RequestParam(value = "isUrgent", required = false) Boolean isUrgent,
            @RequestParam(value = "isFeatured", required = false) Boolean isFeatured,
            @RequestParam(value = "isZeroCost", required = false) Boolean isZeroCost,
            @RequestParam(value = "image", required = false) MultipartFile multipartFile) {
        try {
            Optional<Job> existingJobOpt = jobRepository.findById(id);
            if (existingJobOpt.isPresent()) {
                Job existingJob = existingJobOpt.get();

                existingJob.setTitle(title);
                existingJob.setDescription(description);
                existingJob.setCountry(country);
                existingJob.setCompany(company);
                existingJob.setSalary(salary);
                existingJob.setVacancyCount(vacancyCount);
                existingJob.setDeadline(java.time.LocalDate.parse(deadline));

                // Update New Fields
                existingJob.setRequiredMale(requiredMale);
                existingJob.setRequiredFemale(requiredFemale);
                existingJob.setCurrency(currency);
                existingJob.setOvertime(overtime);
                existingJob.setWorkingHours(workingHours);
                existingJob.setWorkDaysPerWeek(workDaysPerWeek);
                existingJob.setYearlyLeave(yearlyLeave);
                existingJob.setFood(food);
                existingJob.setHousing(housing);
                existingJob.setTenure(tenure);

                // Update Homepage Flags
                if (isUrgent != null)
                    existingJob.setIsUrgent(isUrgent);
                if (isFeatured != null)
                    existingJob.setIsFeatured(isFeatured);
                if (isZeroCost != null)
                    existingJob.setIsZeroCost(isZeroCost);

                if (multipartFile != null && !multipartFile.isEmpty()) {
                    String originalFilename = multipartFile.getOriginalFilename();
                    String fileName = originalFilename != null ? StringUtils.cleanPath(originalFilename) : "image.jpg";
                    String uploadDir = "uploads/jobs/" + existingJob.getId();
                    FileUploadUtil.saveFile(uploadDir, fileName, multipartFile);
                    existingJob.setPhotoPath("/uploads/jobs/" + existingJob.getId() + "/" + fileName);
                }

                jobRepository.save(existingJob);
                return ResponseEntity
                        .ok(Map.of("success", true, "message", "Job updated successfully", "job", existingJob));
            } else {
                return ResponseEntity.status(404).body(Map.of("error", "Job not found"));
            }
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error uploading image: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error updating job: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/flags")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateJobFlags(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Boolean> flags) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Job job = jobOpt.get();
        if (flags.containsKey("isUrgent"))
            job.setIsUrgent(flags.get("isUrgent"));
        if (flags.containsKey("isFeatured"))
            job.setIsFeatured(flags.get("isFeatured"));
        if (flags.containsKey("isZeroCost"))
            job.setIsZeroCost(flags.get("isZeroCost"));

        jobRepository.save(job);
        return ResponseEntity.ok(job);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OFFICER') or hasRole('AGENT')")
    public ResponseEntity<?> deleteJob(@PathVariable("id") Long id) {
        try {
            Optional<Job> jobOpt = jobRepository.findById(id);
            if (jobOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Job not found"));
            }

            Job job = jobOpt.get();

            // Delete dependent rows first to satisfy foreign key constraints
            advertisementRepository.deleteAll(advertisementRepository.findByJob(job));
            demandFileRepository.deleteAll(demandFileRepository.findByJob(job));
            issueRepository.deleteAll(issueRepository.findByJob(job));

            jobRepository.delete(job);
            return ResponseEntity.ok(Map.of("success", true, "message", "Job deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error deleting job: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/pre-approval")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OFFICER') or hasRole('AGENT')")
    public ResponseEntity<?> updatePreApproval(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> payload) {
        try {
            Optional<Job> jobOpt = jobRepository.findById(id);
            if (jobOpt.isPresent()) {
                Job job = jobOpt.get();

                if (payload.containsKey("preApprovalDate") && payload.get("preApprovalDate") != null) {
                    job.setPreApprovalDate(java.time.LocalDate.parse((String) payload.get("preApprovalDate")));
                }
                if (payload.containsKey("lotNo")) {
                    job.setLotNo((String) payload.get("lotNo"));
                }
                if (payload.containsKey("chalaniNo")) {
                    job.setChalaniNo((String) payload.get("chalaniNo"));
                }
                if (payload.containsKey("remarks")) {
                    job.setRemarks((String) payload.get("remarks"));
                }

                jobRepository.save(job);
                return ResponseEntity
                        .ok(Map.of("success", true, "message", "Pre-approval updated successfully", "job", job));
            } else {
                return ResponseEntity.status(404).body(Map.of("error", "Job not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error updating pre-approval: " + e.getMessage()));
        }
    }
}
