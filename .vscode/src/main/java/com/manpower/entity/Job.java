package com.manpower.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 1000)
    private String description;

    private String country;

    private String company;

    private String salary;

    private String photoPath; // Path to the uploaded photo

    private Integer vacancyCount;

    private LocalDate deadline;

    private LocalDate createdAt;

    // New Demand Line Fields
    private Integer requiredMale;
    private Integer requiredFemale;
    private String currency; // Default $
    private String overtime; // Default 0
    private String workingHours; // e.g. 8 hr
    private String workDaysPerWeek; // e.g. 6 days
    private String yearlyLeave; // or As per company policy
    private String food; // Yes, No, As per company policy
    private String housing; // Yes, No, As per company policy
    private String tenure; // e.g. 2 years

    // Homepage Display Flags
    private Boolean isUrgent = false;
    private Boolean isFeatured = false;
    private Boolean isZeroCost = false;
    private Integer views = 0;

    // Pre Approval Fields
    private LocalDate preApprovalDate;
    private String lotNo;
    private String chalaniNo;
    @Column(length = 1000)
    private String remarks;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
        if (currency == null)
            currency = "$";
        if (overtime == null)
            overtime = "0";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public Boolean getIsUrgent() {
        return isUrgent;
    }

    public void setIsUrgent(Boolean urgent) {
        isUrgent = urgent;
    }

    public Boolean getIsFeatured() {
        return isFeatured;
    }

    public void setIsFeatured(Boolean featured) {
        isFeatured = featured;
    }

    public Boolean getIsZeroCost() {
        return isZeroCost;
    }

    public void setIsZeroCost(Boolean zeroCost) {
        isZeroCost = zeroCost;
    }

    public Integer getViews() {
        return views;
    }

    public void setViews(Integer views) {
        this.views = views;
    }

    public String getSalary() {
        return salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
    }

    public String getPhotoPath() {
        return photoPath;
    }

    public void setPhotoPath(String photoPath) {
        this.photoPath = photoPath;
    }

    public Integer getVacancyCount() {
        return vacancyCount;
    }

    public void setVacancyCount(Integer vacancyCount) {
        this.vacancyCount = vacancyCount;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getRequiredMale() {
        return requiredMale;
    }

    public void setRequiredMale(Integer requiredMale) {
        this.requiredMale = requiredMale;
    }

    public Integer getRequiredFemale() {
        return requiredFemale;
    }

    public void setRequiredFemale(Integer requiredFemale) {
        this.requiredFemale = requiredFemale;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getOvertime() {
        return overtime;
    }

    public void setOvertime(String overtime) {
        this.overtime = overtime;
    }

    public String getWorkingHours() {
        return workingHours;
    }

    public void setWorkingHours(String workingHours) {
        this.workingHours = workingHours;
    }

    public String getWorkDaysPerWeek() {
        return workDaysPerWeek;
    }

    public void setWorkDaysPerWeek(String workDaysPerWeek) {
        this.workDaysPerWeek = workDaysPerWeek;
    }

    public String getYearlyLeave() {
        return yearlyLeave;
    }

    public void setYearlyLeave(String yearlyLeave) {
        this.yearlyLeave = yearlyLeave;
    }

    public String getFood() {
        return food;
    }

    public void setFood(String food) {
        this.food = food;
    }

    public String getHousing() {
        return housing;
    }

    public void setHousing(String housing) {
        this.housing = housing;
    }

    public String getTenure() {
        return tenure;
    }

    public void setTenure(String tenure) {
        this.tenure = tenure;
    }

    public LocalDate getPreApprovalDate() {
        return preApprovalDate;
    }

    public void setPreApprovalDate(LocalDate preApprovalDate) {
        this.preApprovalDate = preApprovalDate;
    }

    public String getLotNo() {
        return lotNo;
    }

    public void setLotNo(String lotNo) {
        this.lotNo = lotNo;
    }

    public String getChalaniNo() {
        return chalaniNo;
    }

    public void setChalaniNo(String chalaniNo) {
        this.chalaniNo = chalaniNo;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
