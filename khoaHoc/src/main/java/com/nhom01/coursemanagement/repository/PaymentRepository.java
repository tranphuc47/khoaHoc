// repository/PaymentRepository.java
package com.nhom01.coursemanagement.repository;

import com.nhom01.coursemanagement.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findByEnrollmentId(Integer enrollmentId);
}