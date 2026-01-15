package com.manpower.repository;

import com.manpower.entity.Candidate;
import com.manpower.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByUser(User user);
    Optional<Candidate> findByPassportNumber(String passportNumber);
    Optional<Candidate> findByUserUsername(String username);
}

