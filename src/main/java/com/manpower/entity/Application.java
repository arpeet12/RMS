package com.manpower.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "applications")
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    @JsonIgnore
    private Candidate candidate;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = true)
    private Job job; // Link to demand/job

    private String country;
    private String interviewed;
    private LocalDate interviewDate;
    private String interviewResult; // Pass, Fail
    private String remarks;

    // New fields for workflow
    private String status; // ACCEPTED, REJECTED, WITHDRAWN, PENDING
    private LocalDate applicationForwardedDate;

    // Visa Details
    private String visaNumber;
    private LocalDate visaIssuedDate;
    private LocalDate visaExpiryDate;

    // Ministry Approval
    private String ministryChalaniNo;
    private LocalDate ministryApprovalDate;

    // Flight
    private LocalDate flightDate;

    private LocalDate createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Candidate getCandidate() {
        return candidate;
    }

    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getInterviewed() {
        return interviewed;
    }

    public void setInterviewed(String interviewed) {
        this.interviewed = interviewed;
    }

    public LocalDate getInterviewDate() {
        return interviewDate;
    }

    public void setInterviewDate(LocalDate interviewDate) {
        this.interviewDate = interviewDate;
    }

    public String getInterviewResult() {
        return interviewResult;
    }

    public void setInterviewResult(String interviewResult) {
        this.interviewResult = interviewResult;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getApplicationForwardedDate() {
        return applicationForwardedDate;
    }

    public void setApplicationForwardedDate(LocalDate applicationForwardedDate) {
        this.applicationForwardedDate = applicationForwardedDate;
    }

    public String getVisaNumber() {
        return visaNumber;
    }

    public void setVisaNumber(String visaNumber) {
        this.visaNumber = visaNumber;
    }

    public LocalDate getVisaIssuedDate() {
        return visaIssuedDate;
    }

    public void setVisaIssuedDate(LocalDate visaIssuedDate) {
        this.visaIssuedDate = visaIssuedDate;
    }

    public LocalDate getVisaExpiryDate() {
        return visaExpiryDate;
    }

    public void setVisaExpiryDate(LocalDate visaExpiryDate) {
        this.visaExpiryDate = visaExpiryDate;
    }

    public String getMinistryChalaniNo() {
        return ministryChalaniNo;
    }

    public void setMinistryChalaniNo(String ministryChalaniNo) {
        this.ministryChalaniNo = ministryChalaniNo;
    }

    public LocalDate getMinistryApprovalDate() {
        return ministryApprovalDate;
    }

    public void setMinistryApprovalDate(LocalDate ministryApprovalDate) {
        this.ministryApprovalDate = ministryApprovalDate;
    }

    public LocalDate getFlightDate() {
        return flightDate;
    }

    public void setFlightDate(LocalDate flightDate) {
        this.flightDate = flightDate;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }
}
