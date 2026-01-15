package com.manpower.config;

import com.manpower.entity.Candidate;
import com.manpower.entity.Job;
import com.manpower.entity.User;
import com.manpower.repository.CandidateRepository;
import com.manpower.repository.JobRepository;
import com.manpower.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final PasswordEncoder passwordEncoder;
    private final Random random = new Random();

    public DataInitializer(UserRepository userRepository, JobRepository jobRepository,
            CandidateRepository candidateRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.candidateRepository = candidateRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        createOrUpdateUser("admin", "admin123", "ADMIN");
        createOrUpdateUser("officer", "officer123", "OFFICER");
        createOrUpdateUser("agent", "agent123", "AGENT");

        seedCandidates();
        seedDemands();
    }

    private void seedCandidates() {
        if (candidateRepository.count() > 0) {
            return;
        }

        System.out.println("🌱 Seeding test candidate...");
        Candidate candidate = new Candidate();
        candidate.setFullName("Test Candidate");
        candidate.setPassportNumber("A1234567");
        candidate.setDateOfBirth(LocalDate.of(1990, 1, 1));
        candidate.setPassportStatus("APPROVED");
        candidate.setVisaStatus("IN_PROGRESS");
        candidate.setMedicalStatus("PASSED");
        candidate.setNationality("Nepali");
        candidate.setAddress("Kathmandu, Nepal");
        candidate.setPhone("9800000000");

        candidateRepository.save(candidate);
        System.out.println("✅ Created test candidate: Passport A1234567, DOB 1990-01-01");
    }

    private void createOrUpdateUser(String username, String password, String role) {
        userRepository.findByUsername(username).ifPresentOrElse(
                user -> {
                    if (user.getRole() == null) {
                        user.setRole(role);
                        userRepository.save(user);
                        System.out.println("✅ Updated role for user: " + username);
                    }
                },
                () -> {
                    User user = new User();
                    user.setUsername(username);
                    user.setPassword(passwordEncoder.encode(password));
                    user.setRole(role);
                    userRepository.save(user);
                    System.out.println("✅ Created user: " + username);
                });
    }

    private void seedDemands() {
        if (jobRepository.count() > 0) {
            System.out.println("ℹ️ Jobs already exist, skipping seed.");
            return;
        }

        System.out.println("🌱 Seeding demands...");

        String[] countries = { "Qatar", "Saudi Arabia", "UAE", "Malaysia", "Kuwait" };
        String[] jobTitles = { "Mason (राजमिस्त्री)", "Helper (सहायक मजदुर)", "Electrician (विद्युत मिस्त्री)",
                "Plumber (प्लम्बर)", "Factory Worker", "Hotel Staff" };
        String[] companies = {
                "Al-Futtaim Group", "Bin Ladin Group", "Aramco", "Qatar Petroleum", "Emaar Properties",
                "Almarai", "Saudi Oger", "Drake & Scull", "Arabtec", "Habtoor Leighton",
                "Petronas", "Genting Group", "YTL Corporation", "Sunway Group", "IOI Corporation",
                "Kuwait Oil Company", "Agility", "Zain", "KIPCO", "Alghanim Industries"
        };

        for (int i = 0; i < 20; i++) {
            String company = companies[i % companies.length];
            String country = countries[random.nextInt(countries.length)];
            LocalDate deadline = LocalDate.now().plusMonths(random.nextInt(6) + 1);

            int numJobs = 4 + random.nextInt(2); // 4 or 5 jobs

            for (int j = 0; j < numJobs; j++) {
                Job job = new Job();
                String title = jobTitles[random.nextInt(jobTitles.length)];

                job.setCompany(company);
                job.setCountry(country);
                job.setTitle(title);
                job.setDeadline(deadline);
                job.setDescription("Demand for " + title + " at " + company);

                // Specific details based on job title or random
                if (title.contains("Mason")) {
                    job.setSalary("1200");
                    job.setRequiredMale(20);
                } else if (title.contains("Helper")) {
                    job.setSalary("900");
                    job.setRequiredMale(30);
                } else if (title.contains("Electrician")) {
                    job.setSalary("1500");
                    job.setRequiredMale(10);
                } else if (title.contains("Plumber")) {
                    job.setSalary("1400");
                    job.setRequiredMale(5);
                } else {
                    job.setSalary(String.valueOf(800 + random.nextInt(1000)));
                    job.setRequiredMale(5 + random.nextInt(20));
                }

                job.setRequiredFemale(0);
                job.setCurrency("QAR"); // As per user example
                job.setWorkingHours("8");
                job.setWorkDaysPerWeek("6");
                job.setYearlyLeave("30 दिन");
                job.setFood(random.nextBoolean() ? "Yes" : "As per company policy");
                job.setHousing(random.nextBoolean() ? "Yes" : "As per company policy");
                job.setOvertime("2 घण्टा / दिन");
                job.setTenure("2 Years");
                job.setVacancyCount(job.getRequiredMale() + job.getRequiredFemale());

                // Set some flags randomly
                job.setIsUrgent(random.nextBoolean());
                job.setIsFeatured(random.nextDouble() < 0.2); // 20% chance
                job.setIsZeroCost(random.nextDouble() < 0.1); // 10% chance

                jobRepository.save(job);
            }
        }
        System.out.println("✅ Seeded 20 demands with jobs.");
    }
}
