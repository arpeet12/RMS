package com.manpower.controller;

import com.manpower.entity.Candidate;
import com.manpower.entity.User;
import com.manpower.repository.CandidateRepository;
import com.manpower.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.manpower.util.FileUploadUtil;
import org.springframework.util.StringUtils;
import java.io.IOException;
import java.util.Optional;

@Controller
@RequestMapping("/candidate")
public class CandidateController {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;

    public CandidateController(UserRepository userRepository, CandidateRepository candidateRepository) {
        this.userRepository = userRepository;
        this.candidateRepository = candidateRepository;
    }

    private Candidate getCurrentCandidate() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Only create candidate profile if user role is CANDIDATE
            if ("CANDIDATE".equals(user.getRole())) {
                return candidateRepository.findByUser(user).orElseGet(() -> {
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
            }
        }
        return null;
    }

    @GetMapping("/profile")
    public String profile(Model model) {
        Candidate candidate = getCurrentCandidate();
        if (candidate == null) {
            return "redirect:/dashboard";
        }
        model.addAttribute("candidate", candidate);
        return "candidate-profile";
    }

    @PostMapping("/profile")
    public String updateProfile(@ModelAttribute Candidate candidateForm, RedirectAttributes redirectAttributes) {
        Candidate currentCandidate = getCurrentCandidate();
        if (currentCandidate == null) {
            return "redirect:/dashboard";
        }

        try {
            // Update fields
            currentCandidate.setFullName(candidateForm.getFullName());
            currentCandidate.setPhone(candidateForm.getPhone());
            currentCandidate.setEmail(candidateForm.getEmail());
            currentCandidate.setAddress(candidateForm.getAddress());
            currentCandidate.setDateOfBirth(candidateForm.getDateOfBirth());
            currentCandidate.setNationality(candidateForm.getNationality());
            currentCandidate.setPassportNumber(candidateForm.getPassportNumber());
            currentCandidate.setPassportIssueDate(candidateForm.getPassportIssueDate());
            currentCandidate.setPassportExpiryDate(candidateForm.getPassportExpiryDate());
            
            candidateRepository.save(currentCandidate);
            redirectAttributes.addFlashAttribute("success", "Profile updated successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error updating profile: " + e.getMessage());
        }
        
        return "redirect:/candidate/profile";
    }

    @PostMapping("/profile/photo")
    public String uploadProfilePhoto(@RequestParam("photo") MultipartFile photo,
                                     RedirectAttributes redirectAttributes) {
        Candidate currentCandidate = getCurrentCandidate();
        if (currentCandidate == null) {
            return "redirect:/dashboard";
        }
        try {
            if (!photo.isEmpty()) {
                String fileName = StringUtils.cleanPath(photo.getOriginalFilename());
                String uploadDir = "uploads/candidates/" + currentCandidate.getId();
                FileUploadUtil.saveFile(uploadDir, fileName, photo);
                currentCandidate.setProfilePhotoPath("/uploads/candidates/" + currentCandidate.getId() + "/" + fileName);
                candidateRepository.save(currentCandidate);
                redirectAttributes.addFlashAttribute("success", "Profile photo updated successfully!");
            } else {
                redirectAttributes.addFlashAttribute("error", "Please select a photo to upload.");
            }
        } catch (IOException e) {
            redirectAttributes.addFlashAttribute("error", "Error uploading photo: " + e.getMessage());
        }
        return "redirect:/candidate/profile";
    }



    @GetMapping("/jobs")
    public String jobs(Model model) {
        Candidate candidate = getCurrentCandidate();
        if (candidate == null) {
            return "redirect:/dashboard";
        }
        model.addAttribute("candidate", candidate);
        return "candidate-jobs";
    }

    @GetMapping("/documents")
    public String documents(Model model) {
        Candidate candidate = getCurrentCandidate();
        if (candidate == null) {
            return "redirect:/dashboard";
        }
        model.addAttribute("candidate", candidate);
        return "candidate-documents";
    }

    @GetMapping("/settings")
    public String settings(Model model) {
        Candidate candidate = getCurrentCandidate();
        if (candidate == null) {
            return "redirect:/dashboard";
        }
        model.addAttribute("candidate", candidate);
        return "candidate-settings";
    }
}
