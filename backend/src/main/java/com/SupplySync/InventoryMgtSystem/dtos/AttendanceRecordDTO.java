package com.SupplySync.InventoryMgtSystem.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AttendanceRecordDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private LocalDate date;
    private LocalDateTime clockInTime;
    private LocalDateTime clockOutTime;
    private Boolean isLate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
