package com.manpower.repository;

import com.manpower.entity.DemandFile;
import com.manpower.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DemandFileRepository extends JpaRepository<DemandFile, Long> {
    List<DemandFile> findByJob(Job job);
    List<DemandFile> findByJob_Company(String company);
}

