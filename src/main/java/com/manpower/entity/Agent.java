package com.manpower.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "agents")
public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    // Personal Information
    private String fullName;
    private String email;
    private String phone;
    private String mobile;
    private String address;
    private LocalDate dateOfBirth;
    private String nationality;
    private String gender; // Male, Female, Other

    // Agent Specific Information
    private String agentCode; // Unique agent identification code
    private String licenseNumber; // Agent license number
    private LocalDate licenseExpiryDate;
    private String status; // ACTIVE, INACTIVE, SUSPENDED
    private String commissionRate; // e.g., "5%"

    // Performance Metrics (read-only for agent)
    private Integer totalCandidatesReferred = 0;
    private Integer successfulPlacements = 0;
    private Integer pendingApplications = 0;

    private String profilePhotoPath;
    private String citizenshipPhotoPath;

    @Column(length = 4000)
    private String permissionsJson; // JSON string with module permissions

    // Timestamps
    private LocalDate createdAt;
    private LocalDate updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
        updatedAt = LocalDate.now();
        if (status == null) {
            status = "ACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDate.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getNationality() {
        return nationality;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getAgentCode() {
        return agentCode;
    }

    public void setAgentCode(String agentCode) {
        this.agentCode = agentCode;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public LocalDate getLicenseExpiryDate() {
        return licenseExpiryDate;
    }

    public void setLicenseExpiryDate(LocalDate licenseExpiryDate) {
        this.licenseExpiryDate = licenseExpiryDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCommissionRate() {
        return commissionRate;
    }

    public void setCommissionRate(String commissionRate) {
        this.commissionRate = commissionRate;
    }

    public Integer getTotalCandidatesReferred() {
        return totalCandidatesReferred;
    }

    public void setTotalCandidatesReferred(Integer totalCandidatesReferred) {
        this.totalCandidatesReferred = totalCandidatesReferred;
    }

    public Integer getSuccessfulPlacements() {
        return successfulPlacements;
    }

    public void setSuccessfulPlacements(Integer successfulPlacements) {
        this.successfulPlacements = successfulPlacements;
    }

    public Integer getPendingApplications() {
        return pendingApplications;
    }

    public void setPendingApplications(Integer pendingApplications) {
        this.pendingApplications = pendingApplications;
    }

    public String getProfilePhotoPath() {
        return profilePhotoPath;
    }

    public void setProfilePhotoPath(String profilePhotoPath) {
        this.profilePhotoPath = profilePhotoPath;
    }

    public String getCitizenshipPhotoPath() {
        return citizenshipPhotoPath;
    }

    public void setCitizenshipPhotoPath(String citizenshipPhotoPath) {
        this.citizenshipPhotoPath = citizenshipPhotoPath;
    }

    public String getPermissionsJson() {
        return permissionsJson;
    }

    public void setPermissionsJson(String permissionsJson) {
        this.permissionsJson = permissionsJson;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDate getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDate updatedAt) {
        this.updatedAt = updatedAt;
    }
}
