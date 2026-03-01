package com.SupplySync.InventoryMgtSystem.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.SupplySync.InventoryMgtSystem.dtos.Response;
import com.SupplySync.InventoryMgtSystem.models.User;
import com.SupplySync.InventoryMgtSystem.repositories.UserRepository;
import com.SupplySync.InventoryMgtSystem.services.AttendanceService;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        return user != null ? user.getId() : null;
    }

    @PostMapping("/clock-in")
    public ResponseEntity<Response> clockIn() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.badRequest().body(Response.builder()
                    .status(400)
                    .message("User not found")
                    .build());
        }
        return ResponseEntity.ok(attendanceService.clockIn(userId));
    }

    @PostMapping("/clock-out")
    public ResponseEntity<Response> clockOut() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.badRequest().body(Response.builder()
                    .status(400)
                    .message("User not found")
                    .build());
        }
        return ResponseEntity.ok(attendanceService.clockOut(userId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Response> getUserAttendance(
            @PathVariable Long userId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getUserAttendance(userId, startDate, endDate));
    }

    @GetMapping("/my-attendance")
    public ResponseEntity<Response> getMyAttendance(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.badRequest().body(Response.builder()
                    .status(400)
                    .message("User not found")
                    .build());
        }
        return ResponseEntity.ok(attendanceService.getUserAttendance(userId, startDate, endDate));
    }

    @GetMapping("/analysis")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getStaffAttendanceAnalysis(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getStaffAttendanceAnalysis(startDate, endDate));
    }

    @GetMapping("/defaulters")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getDefaultersList(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getDefaultersList(startDate, endDate));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getAttendanceStats() {
        return ResponseEntity.ok(attendanceService.getAttendanceStats());
    }

    @PostMapping("/reset")
    public ResponseEntity<Response> resetIncompleteRecord() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.badRequest().body(Response.builder()
                    .status(400)
                    .message("User not found")
                    .build());
        }
        return ResponseEntity.ok(attendanceService.resetIncompleteRecord(userId));
    }
}
