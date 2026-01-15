package com.manpower.repository;

import com.manpower.entity.Candidate;
import com.manpower.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByCandidateOrderByCreatedAtDesc(Candidate candidate);
}