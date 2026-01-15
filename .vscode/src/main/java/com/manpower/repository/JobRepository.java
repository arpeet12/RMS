package com.manpower.repository;

import com.manpower.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByCountry(String country);
}
