// controller/PaymentController.java
package com.nhom01.coursemanagement.controller;

import com.nhom01.coursemanagement.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/api/enrollments/{id}/confirm-payment")
    public ResponseEntity<?> confirmPayment(@PathVariable Integer id) {
        return ResponseEntity.ok(paymentService.confirmPayment(id));
    }

    @GetMapping("/api/enrollments/{id}/payment")
    public ResponseEntity<?> getPayment(@PathVariable Integer id) {
        return ResponseEntity.ok(paymentService.getByEnrollmentId(id));
    }
}