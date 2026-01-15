package com.manpower.controller;

import com.manpower.entity.Candidate;
import com.manpower.entity.Job;
import com.manpower.entity.StatusHistory;
import com.manpower.entity.User;
import com.manpower.repository.CandidateRepository;
import com.manpower.repository.JobRepository;
import com.manpower.repository.StatusHistoryRepository;
import com.manpower.repository.UserRepository;
import com.manpower.util.FileUploadUtil;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final StatusHistoryRepository statusHistoryRepository;

    public AdminController(CandidateRepository candidateRepository, UserRepository userRepository,
            JobRepository jobRepository, StatusHistoryRepository statusHistoryRepository) {
        this.candidateRepository = candidateRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    // --- Candidate Management ---

    @GetMapping("/candidates")
    public String candidatesList(Model model) {
        List<Candidate> candidates = candidateRepository.findAll();
        model.addAttribute("candidates", candidates);
        return "candidates-list";
    }

    @GetMapping("/candidates/add")
    public String addCandidateForm(Model model) {
        model.addAttribute("candidate", new Candidate());
        return "add-candidate";
    }

    @PostMapping("/candidates/add")
    public String addCandidate(@ModelAttribute Candidate candidate,
            @RequestParam(required = false) String username,
            RedirectAttributes redirectAttributes) {
        try {
            // Check for duplicate passport number
            if (candidate.getPassportNumber() != null && !candidate.getPassportNumber().isEmpty()) {
                if (candidateRepository.findByPassportNumber(candidate.getPassportNumber()).isPresent()) {
                    redirectAttributes.addFlashAttribute("error", "Error adding candidate: Passport number "
                            + candidate.getPassportNumber() + " already exists.");
                    return "redirect:/admin/candidates/add";
                }
            }

            // If username provided, link to existing user
            if (username != null && !username.isEmpty()) {
                Optional<User> userOpt = userRepository.findByUsername(username);
                if (userOpt.isPresent()) {
                    candidate.setUser(userOpt.get());
                }
            }

            candidateRepository.save(candidate);
            redirectAttributes.addFlashAttribute("success", "Candidate added successfully!");
            return "redirect:/admin/candidates";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error adding candidate: " + e.getMessage());
            return "redirect:/admin/candidates/add";
        }
    }

    @GetMapping("/candidates/search")
    public String searchCandidate(@RequestParam String passportNumber, Model model) {
        Optional<Candidate> candidateOpt = candidateRepository.findByPassportNumber(passportNumber);
        if (candidateOpt.isPresent()) {
            model.addAttribute("candidate", candidateOpt.get());
            return "candidate-details";
        } else {
            model.addAttribute("error", "Candidate with passport number " + passportNumber + " not found");
            model.addAttribute("passportNumber", passportNumber);
            return "candidate-not-found";
        }
    }

    @GetMapping("/candidates/edit/{id}")
    public String editCandidateForm(@PathVariable Long id, Model model) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isPresent()) {
            model.addAttribute("candidate", candidateOpt.get());
            return "edit-candidate";
        }
        return "redirect:/admin/candidates";
    }

    @PostMapping("/candidates/update")
    public String updateCandidate(@ModelAttribute Candidate candidate, RedirectAttributes redirectAttributes) {
        try {
            // Check for duplicate passport number
            if (candidate.getPassportNumber() != null && !candidate.getPassportNumber().isEmpty()) {
                Optional<Candidate> duplicateCandidate = candidateRepository
                        .findByPassportNumber(candidate.getPassportNumber());
                if (duplicateCandidate.isPresent() && !duplicateCandidate.get().getId().equals(candidate.getId())) {
                    redirectAttributes.addFlashAttribute("error", "Error updating candidate: Passport number "
                            + candidate.getPassportNumber() + " is already registered to another candidate.");
                    return "redirect:/admin/candidates/edit/" + candidate.getId();
                }
            }

            Optional<Candidate> existingCandidateOpt = candidateRepository.findById(candidate.getId());
            if (existingCandidateOpt.isPresent()) {
                Candidate existingCandidate = existingCandidateOpt.get();

                // Update fields that are editable from the form
                existingCandidate.setFullName(candidate.getFullName());
                existingCandidate.setEmail(candidate.getEmail());
                existingCandidate.setPhone(candidate.getPhone());
                existingCandidate.setDateOfBirth(candidate.getDateOfBirth());
                existingCandidate.setAddress(candidate.getAddress());
                existingCandidate.setNationality(candidate.getNationality());
                existingCandidate.setPassportNumber(candidate.getPassportNumber());
                existingCandidate.setPassportIssueDate(candidate.getPassportIssueDate());
                existingCandidate.setPassportExpiryDate(candidate.getPassportExpiryDate());
                existingCandidate.setJobAppliedFor(candidate.getJobAppliedFor());
                existingCandidate.setDestinationCountry(candidate.getDestinationCountry());
                existingCandidate.setVisaStatus(candidate.getVisaStatus());
                existingCandidate.setMedicalStatus(candidate.getMedicalStatus());
                existingCandidate.setRemarks(candidate.getRemarks());

                candidateRepository.save(existingCandidate);
                redirectAttributes.addFlashAttribute("success", "Candidate updated successfully!");
                return "redirect:/admin/candidates";
            } else {
                redirectAttributes.addFlashAttribute("error", "Candidate not found");
                return "redirect:/admin/candidates";
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error updating candidate: " + e.getMessage());
            return "redirect:/admin/candidates/edit/" + candidate.getId();
        }
    }

    @GetMapping("/candidates/{id}")
    public String viewCandidate(@PathVariable Long id, Model model) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            model.addAttribute("candidate", candidate);
            // Get status history for this candidate
            List<StatusHistory> statusHistory = statusHistoryRepository.findByCandidateOrderByChangedAtDesc(candidate);
            model.addAttribute("statusHistory", statusHistory);
            return "candidate-details";
        }
        return "redirect:/admin/candidates";
    }

    @PostMapping("/candidates/{id}/status")
    public String updateCandidateStatus(@PathVariable Long id,
                                       @RequestParam String statusType,
                                       @RequestParam String statusValue,
                                       @RequestParam(required = false) String remarks,
                                       RedirectAttributes redirectAttributes) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            String oldStatus = "";
            String newStatus = statusValue;
            
            // Get old status and update
            switch (statusType) {
                case "passport":
                    oldStatus = candidate.getPassportStatus();
                    candidate.setPassportStatus(statusValue);
                    break;
                case "medical":
                    oldStatus = candidate.getMedicalStatus();
                    candidate.setMedicalStatus(statusValue);
                    break;
                case "police":
                    oldStatus = candidate.getPoliceReportStatus();
                    candidate.setPoliceReportStatus(statusValue);
                    break;
                case "health":
                    oldStatus = candidate.getHealthReportStatus();
                    candidate.setHealthReportStatus(statusValue);
                    break;
                case "visa":
                    oldStatus = candidate.getVisaStatus();
                    candidate.setVisaStatus(statusValue);
                    break;
                case "insurance":
                    oldStatus = candidate.getInsuranceStatus();
                    candidate.setInsuranceStatus(statusValue);
                    break;
            }
            
            candidateRepository.save(candidate);
            
            // Save to status history
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String changedBy = auth.getName();
            
            StatusHistory statusHistory = new StatusHistory();
            statusHistory.setCandidate(candidate);
            statusHistory.setDocumentType(statusType);
            statusHistory.setOldStatus(oldStatus);
            statusHistory.setNewStatus(newStatus);
            statusHistory.setChangedBy(changedBy);
            statusHistory.setRemarks(remarks);
            statusHistoryRepository.save(statusHistory);
            
            redirectAttributes.addFlashAttribute("success", "Status updated successfully!");
        } else {
            redirectAttributes.addFlashAttribute("error", "Candidate not found!");
        }
        return "redirect:/admin/candidates/" + id;
    }

    @PostMapping("/candidates/{id}/documents/passport")
    public String uploadPassportDocument(@PathVariable Long id,
                                        @RequestParam("passportDocument") MultipartFile passportDocument,
                                        RedirectAttributes redirectAttributes) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            try {
                if (!passportDocument.isEmpty()) {
                    String fileName = StringUtils.cleanPath(passportDocument.getOriginalFilename());
                    String uploadDir = "uploads/candidates/" + candidate.getId() + "/documents";
                    FileUploadUtil.saveFile(uploadDir, fileName, passportDocument);
                    candidate.setPassportPhotoPath("/uploads/candidates/" + candidate.getId() + "/documents/" + fileName);
                    String oldStatus = candidate.getPassportStatus();
                    candidate.setPassportStatus("PENDING");
                    candidateRepository.save(candidate);
                    
                    // Save to status history
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    StatusHistory statusHistory = new StatusHistory();
                    statusHistory.setCandidate(candidate);
                    statusHistory.setDocumentType("passport");
                    statusHistory.setOldStatus(oldStatus);
                    statusHistory.setNewStatus("PENDING");
                    statusHistory.setChangedBy(auth.getName());
                    statusHistory.setRemarks("Document uploaded by admin");
                    statusHistoryRepository.save(statusHistory);
                    
                    redirectAttributes.addFlashAttribute("success", "Passport document uploaded successfully!");
                } else {
                    redirectAttributes.addFlashAttribute("error", "Please select a file to upload.");
                }
            } catch (IOException e) {
                redirectAttributes.addFlashAttribute("error", "Error uploading passport document: " + e.getMessage());
            }
        } else {
            redirectAttributes.addFlashAttribute("error", "Candidate not found!");
        }
        return "redirect:/admin/candidates/" + id;
    }

    @PostMapping("/candidates/{id}/documents/medical")
    public String uploadMedicalDocument(@PathVariable Long id,
                                       @RequestParam("medicalDocument") MultipartFile medicalDocument,
                                       RedirectAttributes redirectAttributes) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            try {
                if (!medicalDocument.isEmpty()) {
                    // Validate PDF
                    String contentType = medicalDocument.getContentType();
                    if (contentType == null || !contentType.equals("application/pdf")) {
                        redirectAttributes.addFlashAttribute("error", "Only PDF files are allowed for medical reports.");
                        return "redirect:/admin/candidates/" + id;
                    }
                    
                    String fileName = StringUtils.cleanPath(medicalDocument.getOriginalFilename());
                    if (!fileName.toLowerCase().endsWith(".pdf")) {
                        redirectAttributes.addFlashAttribute("error", "Only PDF files are allowed.");
                        return "redirect:/admin/candidates/" + id;
                    }
                    
                    String uploadDir = "uploads/candidates/" + candidate.getId() + "/documents";
                    FileUploadUtil.saveFile(uploadDir, fileName, medicalDocument);
                    candidate.setMedicalReportPath("/uploads/candidates/" + candidate.getId() + "/documents/" + fileName);
                    String oldStatus = candidate.getMedicalStatus();
                    candidate.setMedicalStatus("PENDING");
                    candidateRepository.save(candidate);
                    
                    // Save to status history
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    StatusHistory statusHistory = new StatusHistory();
                    statusHistory.setCandidate(candidate);
                    statusHistory.setDocumentType("medical");
                    statusHistory.setOldStatus(oldStatus);
                    statusHistory.setNewStatus("PENDING");
                    statusHistory.setChangedBy(auth.getName());
                    statusHistory.setRemarks("Medical report uploaded by admin");
                    statusHistoryRepository.save(statusHistory);
                    
                    redirectAttributes.addFlashAttribute("success", "Medical report uploaded successfully!");
                } else {
                    redirectAttributes.addFlashAttribute("error", "Please select a file to upload.");
                }
            } catch (IOException e) {
                redirectAttributes.addFlashAttribute("error", "Error uploading medical report: " + e.getMessage());
            }
        } else {
            redirectAttributes.addFlashAttribute("error", "Candidate not found!");
        }
        return "redirect:/admin/candidates/" + id;
    }

    @PostMapping("/candidates/{id}/documents/police")
    public String uploadPoliceDocument(@PathVariable Long id,
                                      @RequestParam("policeDocument") MultipartFile policeDocument,
                                      RedirectAttributes redirectAttributes) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            try {
                if (!policeDocument.isEmpty()) {
                    // Validate PDF
                    String contentType = policeDocument.getContentType();
                    if (contentType == null || !contentType.equals("application/pdf")) {
                        redirectAttributes.addFlashAttribute("error", "Only PDF files are allowed for police reports.");
                        return "redirect:/admin/candidates/" + id;
                    }
                    
                    String fileName = StringUtils.cleanPath(policeDocument.getOriginalFilename());
                    if (!fileName.toLowerCase().endsWith(".pdf")) {
                        redirectAttributes.addFlashAttribute("error", "Only PDF files are allowed.");
                        return "redirect:/admin/candidates/" + id;
                    }
                    
                    String uploadDir = "uploads/candidates/" + candidate.getId() + "/documents";
                    FileUploadUtil.saveFile(uploadDir, fileName, policeDocument);
                    candidate.setPoliceReportPath("/uploads/candidates/" + candidate.getId() + "/documents/" + fileName);
                    String oldStatus = candidate.getPoliceReportStatus();
                    candidate.setPoliceReportStatus("PENDING");
                    candidateRepository.save(candidate);
                    
                    // Save to status history
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    StatusHistory statusHistory = new StatusHistory();
                    statusHistory.setCandidate(candidate);
                    statusHistory.setDocumentType("police");
                    statusHistory.setOldStatus(oldStatus);
                    statusHistory.setNewStatus("PENDING");
                    statusHistory.setChangedBy(auth.getName());
                    statusHistory.setRemarks("Police report uploaded by admin");
                    statusHistoryRepository.save(statusHistory);
                    
                    redirectAttributes.addFlashAttribute("success", "Police report uploaded successfully!");
                } else {
                    redirectAttributes.addFlashAttribute("error", "Please select a file to upload.");
                }
            } catch (IOException e) {
                redirectAttributes.addFlashAttribute("error", "Error uploading police report: " + e.getMessage());
            }
        } else {
            redirectAttributes.addFlashAttribute("error", "Candidate not found!");
        }
        return "redirect:/admin/candidates/" + id;
    }

    @PostMapping("/candidates/{id}/documents/health")
    public String uploadHealthDocument(@PathVariable Long id,
                                      @RequestParam("healthDocument") MultipartFile healthDocument,
                                      RedirectAttributes redirectAttributes) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            try {
                if (!healthDocument.isEmpty()) {
                    // Validate PDF
                    String contentType = healthDocument.getContentType();
                    if (contentType == null || !contentType.equals("application/pdf")) {
                        redirectAttributes.addFlashAttribute("error", "Only PDF files are allowed for health reports.");
                        return "redirect:/admin/candidates/" + id;
                    }
                    
                    String fileName = StringUtils.cleanPath(healthDocument.getOriginalFilename());
                    if (!fileName.toLowerCase().endsWith(".pdf")) {
                        redirectAttributes.addFlashAttribute("error", "Only PDF files are allowed.");
                        return "redirect:/admin/candidates/" + id;
                    }
                    
                    String uploadDir = "uploads/candidates/" + candidate.getId() + "/documents";
                    FileUploadUtil.saveFile(uploadDir, fileName, healthDocument);
                    candidate.setHealthReportPath("/uploads/candidates/" + candidate.getId() + "/documents/" + fileName);
                    String oldStatus = candidate.getHealthReportStatus();
                    candidate.setHealthReportStatus("PENDING");
                    candidateRepository.save(candidate);
                    
                    // Save to status history
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    StatusHistory statusHistory = new StatusHistory();
                    statusHistory.setCandidate(candidate);
                    statusHistory.setDocumentType("health");
                    statusHistory.setOldStatus(oldStatus);
                    statusHistory.setNewStatus("PENDING");
                    statusHistory.setChangedBy(auth.getName());
                    statusHistory.setRemarks("Health report uploaded by admin");
                    statusHistoryRepository.save(statusHistory);
                    
                    redirectAttributes.addFlashAttribute("success", "Health report uploaded successfully!");
                } else {
                    redirectAttributes.addFlashAttribute("error", "Please select a file to upload.");
                }
            } catch (IOException e) {
                redirectAttributes.addFlashAttribute("error", "Error uploading health report: " + e.getMessage());
            }
        } else {
            redirectAttributes.addFlashAttribute("error", "Candidate not found!");
        }
        return "redirect:/admin/candidates/" + id;
    }

    @PostMapping("/candidates/{id}/documents/visa")
    public String uploadVisaDocument(@PathVariable Long id,
                                    @RequestParam("visaDocument") MultipartFile visaDocument,
                                    RedirectAttributes redirectAttributes) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            try {
                if (!visaDocument.isEmpty()) {
                    String fileName = StringUtils.cleanPath(visaDocument.getOriginalFilename());
                    String uploadDir = "uploads/candidates/" + candidate.getId() + "/documents";
                    FileUploadUtil.saveFile(uploadDir, fileName, visaDocument);
                    candidate.setVisaDocumentPath("/uploads/candidates/" + candidate.getId() + "/documents/" + fileName);
                    String oldStatus = candidate.getVisaStatus();
                    candidate.setVisaStatus("PENDING");
                    candidateRepository.save(candidate);
                    
                    // Save to status history
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    StatusHistory statusHistory = new StatusHistory();
                    statusHistory.setCandidate(candidate);
                    statusHistory.setDocumentType("visa");
                    statusHistory.setOldStatus(oldStatus);
                    statusHistory.setNewStatus("PENDING");
                    statusHistory.setChangedBy(auth.getName());
                    statusHistory.setRemarks("Visa document uploaded by admin");
                    statusHistoryRepository.save(statusHistory);
                    
                    redirectAttributes.addFlashAttribute("success", "Visa document uploaded successfully!");
                } else {
                    redirectAttributes.addFlashAttribute("error", "Please select a file to upload.");
                }
            } catch (IOException e) {
                redirectAttributes.addFlashAttribute("error", "Error uploading visa document: " + e.getMessage());
            }
        } else {
            redirectAttributes.addFlashAttribute("error", "Candidate not found!");
        }
        return "redirect:/admin/candidates/" + id;
    }

    @PostMapping("/candidates/{id}/documents/insurance")
    public String uploadInsuranceDocument(@PathVariable Long id,
                                         @RequestParam("insuranceDocument") MultipartFile insuranceDocument,
                                         RedirectAttributes redirectAttributes) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            try {
                if (!insuranceDocument.isEmpty()) {
                    String fileName = StringUtils.cleanPath(insuranceDocument.getOriginalFilename());
                    String uploadDir = "uploads/candidates/" + candidate.getId() + "/documents";
                    FileUploadUtil.saveFile(uploadDir, fileName, insuranceDocument);
                    candidate.setInsuranceDocumentPath("/uploads/candidates/" + candidate.getId() + "/documents/" + fileName);
                    String oldStatus = candidate.getInsuranceStatus();
                    candidate.setInsuranceStatus("PENDING");
                    candidateRepository.save(candidate);
                    
                    // Save to status history
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    StatusHistory statusHistory = new StatusHistory();
                    statusHistory.setCandidate(candidate);
                    statusHistory.setDocumentType("insurance");
                    statusHistory.setOldStatus(oldStatus);
                    statusHistory.setNewStatus("PENDING");
                    statusHistory.setChangedBy(auth.getName());
                    statusHistory.setRemarks("Insurance document uploaded by admin");
                    statusHistoryRepository.save(statusHistory);
                    
                    redirectAttributes.addFlashAttribute("success", "Insurance document uploaded successfully!");
                } else {
                    redirectAttributes.addFlashAttribute("error", "Please select a file to upload.");
                }
            } catch (IOException e) {
                redirectAttributes.addFlashAttribute("error", "Error uploading insurance document: " + e.getMessage());
            }
        } else {
            redirectAttributes.addFlashAttribute("error", "Candidate not found!");
        }
        return "redirect:/admin/candidates/" + id;
    }

    // --- Job Management ---

    @GetMapping("/jobs")
    public String jobsList(Model model) {
        List<Job> jobs = jobRepository.findAll();
        model.addAttribute("jobs", jobs);
        return "admin-jobs-list";
    }

    @GetMapping("/jobs/add")
    public String addJobForm(Model model) {
        model.addAttribute("job", new Job());
        return "add-job";
    }

    @PostMapping("/jobs/add")
    public String addJob(@ModelAttribute Job job,
            @RequestParam("image") MultipartFile multipartFile,
            RedirectAttributes redirectAttributes) {
        try {
            if (!multipartFile.isEmpty()) {
                String fileName = StringUtils.cleanPath(multipartFile.getOriginalFilename());
                job.setPhotoPath(fileName);
                Job savedJob = jobRepository.save(job);

                String uploadDir = "uploads/jobs/" + savedJob.getId();
                FileUploadUtil.saveFile(uploadDir, fileName, multipartFile);
                job.setPhotoPath("/uploads/jobs/" + savedJob.getId() + "/" + fileName);
                jobRepository.save(job);
            } else {
                jobRepository.save(job);
            }

            redirectAttributes.addFlashAttribute("success", "Job added successfully!");
            return "redirect:/admin/jobs";
        } catch (IOException e) {
            redirectAttributes.addFlashAttribute("error", "Error uploading image: " + e.getMessage());
            return "redirect:/admin/jobs/add";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error adding job: " + e.getMessage());
            return "redirect:/admin/jobs/add";
        }
    }

    @GetMapping("/jobs/edit/{id}")
    public String editJobForm(@PathVariable Long id, Model model) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isPresent()) {
            model.addAttribute("job", jobOpt.get());
            return "edit-job";
        }
        return "redirect:/admin/jobs";
    }

    @PostMapping("/jobs/update")
    public String updateJob(@ModelAttribute Job job,
            @RequestParam("image") MultipartFile multipartFile,
            RedirectAttributes redirectAttributes) {
        try {
            Optional<Job> existingJobOpt = jobRepository.findById(job.getId());
            if (existingJobOpt.isPresent()) {
                Job existingJob = existingJobOpt.get();

                // Update fields
                existingJob.setTitle(job.getTitle());
                existingJob.setDescription(job.getDescription());
                existingJob.setCountry(job.getCountry());
                existingJob.setSalary(job.getSalary());
                existingJob.setVacancyCount(job.getVacancyCount());
                existingJob.setDeadline(job.getDeadline());

                // Handle image update
                if (!multipartFile.isEmpty()) {
                    String fileName = StringUtils.cleanPath(multipartFile.getOriginalFilename());
                    String uploadDir = "uploads/jobs/" + existingJob.getId();
                    FileUploadUtil.saveFile(uploadDir, fileName, multipartFile);
                    existingJob.setPhotoPath("/uploads/jobs/" + existingJob.getId() + "/" + fileName);
                }

                jobRepository.save(existingJob);
                redirectAttributes.addFlashAttribute("success", "Job updated successfully!");
                return "redirect:/admin/jobs";
            } else {
                redirectAttributes.addFlashAttribute("error", "Job not found");
                return "redirect:/admin/jobs";
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error updating job: " + e.getMessage());
            return "redirect:/admin/jobs/edit/" + job.getId();
        }
    }

    @GetMapping("/jobs/delete/{id}")
    public String deleteJob(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            jobRepository.deleteById(id);
            redirectAttributes.addFlashAttribute("success", "Job deleted successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error deleting job: " + e.getMessage());
        }
        return "redirect:/admin/jobs";
    }

    @PostMapping("/profile/photo")
    public String uploadAdminProfilePhoto(@RequestParam("photo") MultipartFile photo,
            RedirectAttributes redirectAttributes) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "User not found.");
                return "redirect:/admin/dashboard";
            }
            User user = userOpt.get();
            if (!photo.isEmpty()) {
                String fileName = StringUtils.cleanPath(photo.getOriginalFilename());
                String uploadDir = "uploads/users/" + user.getId();
                FileUploadUtil.saveFile(uploadDir, fileName, photo);
                user.setProfilePhotoPath("/uploads/users/" + user.getId() + "/" + fileName);
                userRepository.save(user);
                redirectAttributes.addFlashAttribute("success", "Profile photo updated successfully!");
            } else {
                redirectAttributes.addFlashAttribute("error", "Please select a photo to upload.");
            }
        } catch (IOException e) {
            redirectAttributes.addFlashAttribute("error", "Error uploading photo: " + e.getMessage());
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Unexpected error: " + e.getMessage());
        }
        return "redirect:/admin/dashboard";
    }
}
