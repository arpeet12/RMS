package com.manpower.repository;

import com.manpower.entity.Application;
import com.manpower.entity.Candidate;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    @EntityGraph(attributePaths = {"job"})
    List<Application> findByCandidateOrderByCreatedAtDesc(Candidate candidate);
    
    @Query("SELECT a FROM Application a LEFT JOIN FETCH a.job WHERE a.id = :id")
    Optional<Application> findByIdWithJob(@Param("id") Long id);
}