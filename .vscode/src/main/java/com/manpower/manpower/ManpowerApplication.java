package com.manpower.manpower;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories("com.manpower.repository")
@EntityScan("com.manpower.entity")
@ComponentScan("com.manpower")
public class ManpowerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ManpowerApplication.class, args);
	}

}
