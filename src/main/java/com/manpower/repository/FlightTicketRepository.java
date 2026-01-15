package com.manpower.repository;

import com.manpower.entity.Candidate;
import com.manpower.entity.FlightTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlightTicketRepository extends JpaRepository<FlightTicket, Long> {
    List<FlightTicket> findByCandidate(Candidate candidate);

    List<FlightTicket> findByCandidateOrderByDepartureDateDesc(Candidate candidate);

    List<FlightTicket> findAllByOrderByDepartureDateDesc();
}
