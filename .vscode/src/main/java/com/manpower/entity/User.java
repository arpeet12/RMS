package com.manpower.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    private String password;

    @Column(name = "user_role")
    private String role; // ADMIN, OFFICER, CANDIDATE, or AGENT

    private String profilePhotoPath;

    // New fields for Admin/User details
    private String email;
    private String phone;
    private String address;
    private String citizenshipPhotoPath;

    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'ACTIVE'")
    private String status;

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getProfilePhotoPath() {
        return profilePhotoPath;
    }

    public void setProfilePhotoPath(String profilePhotoPath) {
        this.profilePhotoPath = profilePhotoPath;
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

    public String getCitizenshipPhotoPath() {
        return citizenshipPhotoPath;
    }

    public void setCitizenshipPhotoPath(String citizenshipPhotoPath) {
        this.citizenshipPhotoPath = citizenshipPhotoPath;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
