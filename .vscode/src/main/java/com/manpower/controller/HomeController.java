package com.manpower.controller;

import com.manpower.entity.Job;
import com.manpower.repository.JobRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class HomeController {

    private final JobRepository jobRepository;

    public HomeController(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @GetMapping("/")
    public String home(Model model) {
        List<Job> jobs = jobRepository.findAll();
        model.addAttribute("jobs", jobs);
        return "homepage";
    }

    @GetMapping("/home")
    public String homePage(Model model) {
        List<Job> jobs = jobRepository.findAll();
        model.addAttribute("jobs", jobs);
        return "homepage";
    }

    @GetMapping("/about")
    public String about(Model model) {
        model.addAttribute("activeLink", "about");
        return "about";
    }

    @GetMapping("/contact")
    public String contact(Model model) {
        model.addAttribute("activeLink", "contact");
        return "contact";
    }

}
