package com.manpower.repository;

import com.manpower.entity.Candidate;
import com.manpower.entity.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {
    List<StatusHistory> findByCandidateOrderByChangedAtDesc(Candidate candidate);
    List<StatusHistory> findByCandidateAndDocumentTypeOrderByChangedAtDesc(Candidate candidate, String documentType);
}

