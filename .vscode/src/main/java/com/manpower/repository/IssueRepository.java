package com.manpower.repository;

import com.manpower.entity.Issue;
import com.manpower.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findByJob(Job job);
    List<Issue> findByCandidate(com.manpower.entity.Candidate candidate);
    List<Issue> findByJob_Company(String company);
    List<Issue> findByStatus(String status);
}

