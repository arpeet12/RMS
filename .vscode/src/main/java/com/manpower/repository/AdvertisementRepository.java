package com.manpower.repository;

import com.manpower.entity.Advertisement;
import com.manpower.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdvertisementRepository extends JpaRepository<Advertisement, Long> {
    List<Advertisement> findByJob(Job job);
    List<Advertisement> findByJob_Company(String company);
}

