package com.manpower.repository;

import com.manpower.entity.Agent;
import com.manpower.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AgentRepository extends JpaRepository<Agent, Long> {
    Optional<Agent> findByUser(User user);
    Optional<Agent> findByAgentCode(String agentCode);
}




