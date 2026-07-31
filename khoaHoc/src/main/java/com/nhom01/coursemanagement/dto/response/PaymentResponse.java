// dto/response/PaymentResponse.java
package com.nhom01.coursemanagement.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentResponse {
    private Integer id;
    private Integer enrollmentId;
    private String courseTitle;
    private BigDecimal amount;
    private String transactionCode;
    private String status;
    private LocalDateTime paidAt;
}