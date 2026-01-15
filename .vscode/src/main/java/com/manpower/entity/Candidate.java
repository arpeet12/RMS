package com.manpower.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "candidates")
public class Candidate {

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
    private String address; // Kept for backward compatibility, but prefer permanent address fields below
    private LocalDate dateOfBirth;
    private String nationality;
    private String gender; // Male, Female, Other
    private String religion;
    private String fatherName;
    private String motherName;
    private String spouseName;
    private Integer noOfSons;
    private Integer noOfDaughters;

    // Permanent Address
    private String permanentCountry;
    private String permanentDistrict;
    private String permanentCityStreet;

    // Physical & Experience
    private String height;
    private String weight;
    private String experience;
    private String qualification;
    private String technicalCourse;
    private String jobInterest;

    // Agent Info
    private String agentName;

    // Passport Information
    @Column(unique = true)
    private String passportNumber;
    private LocalDate passportIssueDate;
    private LocalDate passportExpiryDate;
    private String passportIssuedDistrict;
    private String passportPhotoPath; // Path to stored passport photo

    private String profilePhotoPath; // Path to candidate profile photo

    // Status Fields (NOT_UPLOADED, PENDING, IN_PROGRESS, APPROVED, REJECTED)
    private String passportStatus = "NOT_UPLOADED";
    private String visaStatus = "NOT_UPLOADED";
    private String medicalStatus = "NOT_UPLOADED";
    private String insuranceStatus = "NOT_UPLOADED";
    private String healthReportStatus = "NOT_UPLOADED";
    private String policeReportStatus = "NOT_UPLOADED";

    // Document Paths
    private String medicalReportPath;
    private String healthReportPath;
    private String policeReportPath;
    private String visaDocumentPath;
    private String insuranceDocumentPath;
    private String cvPath;

    // Additional Information
    private String jobAppliedFor;
    private String destinationCountry;
    private String countryOfInterest; // Comma-separated or JSON for multiple countries
    private String remarks;

    // Timestamps
    private LocalDate createdAt;
    private LocalDate updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
        updatedAt = LocalDate.now();
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

    public String getReligion() {
        return religion;
    }

    public void setReligion(String religion) {
        this.religion = religion;
    }

    public String getFatherName() {
        return fatherName;
    }

    public void setFatherName(String fatherName) {
        this.fatherName = fatherName;
    }

    public String getMotherName() {
        return motherName;
    }

    public void setMotherName(String motherName) {
        this.motherName = motherName;
    }

    public String getSpouseName() {
        return spouseName;
    }

    public void setSpouseName(String spouseName) {
        this.spouseName = spouseName;
    }

    public Integer getNoOfSons() {
        return noOfSons;
    }

    public void setNoOfSons(Integer noOfSons) {
        this.noOfSons = noOfSons;
    }

    public Integer getNoOfDaughters() {
        return noOfDaughters;
    }

    public void setNoOfDaughters(Integer noOfDaughters) {
        this.noOfDaughters = noOfDaughters;
    }

    public String getPermanentCountry() {
        return permanentCountry;
    }

    public void setPermanentCountry(String permanentCountry) {
        this.permanentCountry = permanentCountry;
    }

    public String getPermanentDistrict() {
        return permanentDistrict;
    }

    public void setPermanentDistrict(String permanentDistrict) {
        this.permanentDistrict = permanentDistrict;
    }

    public String getPermanentCityStreet() {
        return permanentCityStreet;
    }

    public void setPermanentCityStreet(String permanentCityStreet) {
        this.permanentCityStreet = permanentCityStreet;
    }

    public String getHeight() {
        return height;
    }

    public void setHeight(String height) {
        this.height = height;
    }

    public String getWeight() {
        return weight;
    }

    public void setWeight(String weight) {
        this.weight = weight;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public String getTechnicalCourse() {
        return technicalCourse;
    }

    public void setTechnicalCourse(String technicalCourse) {
        this.technicalCourse = technicalCourse;
    }

    public String getJobInterest() {
        return jobInterest;
    }

    public void setJobInterest(String jobInterest) {
        this.jobInterest = jobInterest;
    }

    public String getAgentName() {
        return agentName;
    }

    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }

    public String getPassportIssuedDistrict() {
        return passportIssuedDistrict;
    }

    public void setPassportIssuedDistrict(String passportIssuedDistrict) {
        this.passportIssuedDistrict = passportIssuedDistrict;
    }

    public String getPassportNumber() {
        return passportNumber;
    }

    public void setPassportNumber(String passportNumber) {
        this.passportNumber = passportNumber;
    }

    public LocalDate getPassportIssueDate() {
        return passportIssueDate;
    }

    public void setPassportIssueDate(LocalDate passportIssueDate) {
        this.passportIssueDate = passportIssueDate;
    }

    public LocalDate getPassportExpiryDate() {
        return passportExpiryDate;
    }

    public void setPassportExpiryDate(LocalDate passportExpiryDate) {
        this.passportExpiryDate = passportExpiryDate;
    }

    public String getPassportPhotoPath() {
        return passportPhotoPath;
    }

    public void setPassportPhotoPath(String passportPhotoPath) {
        this.passportPhotoPath = passportPhotoPath;
    }

    public String getProfilePhotoPath() {
        return profilePhotoPath;
    }

    public void setProfilePhotoPath(String profilePhotoPath) {
        this.profilePhotoPath = profilePhotoPath;
    }

    public String getPassportStatus() {
        return passportStatus;
    }

    public void setPassportStatus(String passportStatus) {
        this.passportStatus = passportStatus;
    }

    public String getVisaStatus() {
        return visaStatus;
    }

    public void setVisaStatus(String visaStatus) {
        this.visaStatus = visaStatus;
    }

    public String getMedicalStatus() {
        return medicalStatus;
    }

    public void setMedicalStatus(String medicalStatus) {
        this.medicalStatus = medicalStatus;
    }

    public String getInsuranceStatus() {
        return insuranceStatus;
    }

    public void setInsuranceStatus(String insuranceStatus) {
        this.insuranceStatus = insuranceStatus;
    }

    public String getHealthReportStatus() {
        return healthReportStatus;
    }

    public void setHealthReportStatus(String healthReportStatus) {
        this.healthReportStatus = healthReportStatus;
    }

    public String getPoliceReportStatus() {
        return policeReportStatus;
    }

    public void setPoliceReportStatus(String policeReportStatus) {
        this.policeReportStatus = policeReportStatus;
    }

    public String getMedicalReportPath() {
        return medicalReportPath;
    }

    public void setMedicalReportPath(String medicalReportPath) {
        this.medicalReportPath = medicalReportPath;
    }

    public String getHealthReportPath() {
        return healthReportPath;
    }

    public void setHealthReportPath(String healthReportPath) {
        this.healthReportPath = healthReportPath;
    }

    public String getPoliceReportPath() {
        return policeReportPath;
    }

    public void setPoliceReportPath(String policeReportPath) {
        this.policeReportPath = policeReportPath;
    }

    public String getVisaDocumentPath() {
        return visaDocumentPath;
    }

    public void setVisaDocumentPath(String visaDocumentPath) {
        this.visaDocumentPath = visaDocumentPath;
    }

    public String getInsuranceDocumentPath() {
        return insuranceDocumentPath;
    }

    public void setInsuranceDocumentPath(String insuranceDocumentPath) {
        this.insuranceDocumentPath = insuranceDocumentPath;
    }

    public String getCvPath() {
        return cvPath;
    }

    public void setCvPath(String cvPath) {
        this.cvPath = cvPath;
    }

    public String getJobAppliedFor() {
        return jobAppliedFor;
    }

    public void setJobAppliedFor(String jobAppliedFor) {
        this.jobAppliedFor = jobAppliedFor;
    }

    public String getDestinationCountry() {
        return destinationCountry;
    }

    public void setDestinationCountry(String destinationCountry) {
        this.destinationCountry = destinationCountry;
    }

    public String getCountryOfInterest() {
        return countryOfInterest;
    }

    public void setCountryOfInterest(String countryOfInterest) {
        this.countryOfInterest = countryOfInterest;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
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
