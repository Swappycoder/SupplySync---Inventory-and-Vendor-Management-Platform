package com.SupplySync.InventoryMgtSystem.services.impl;

import com.SupplySync.InventoryMgtSystem.dtos.AttendanceRecordDTO;
import com.SupplySync.InventoryMgtSystem.dtos.Response;
import com.SupplySync.InventoryMgtSystem.enums.UserRole;
import com.SupplySync.InventoryMgtSystem.models.AttendanceRecord;
import com.SupplySync.InventoryMgtSystem.models.User;
import com.SupplySync.InventoryMgtSystem.repositories.AttendanceRecordRepository;
import com.SupplySync.InventoryMgtSystem.repositories.UserRepository;
import com.SupplySync.InventoryMgtSystem.services.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    // Official work hours
    private static final LocalTime OFFICIAL_CLOCK_IN_TIME = LocalTime.of(9, 0); // 9:00 AM
    private static final LocalTime OFFICIAL_CLOCK_OUT_TIME = LocalTime.of(17, 0); // 5:00 PM

    @Override
    public Response clockIn(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        // Get all records for today - now returns a List
        List<AttendanceRecord> todayRecords = attendanceRecordRepository.findByUserAndDate(user, today);
        
        log.info("User {} has {} attendance records for today", userId, todayRecords.size());
        for (AttendanceRecord r : todayRecords) {
            log.info("Record: clockIn={}, clockOut={}", r.getClockInTime(), r.getClockOutTime());
        }

        // Check if late (after 9:00 AM)
        boolean isLate = now.toLocalTime().isAfter(OFFICIAL_CLOCK_IN_TIME);

        AttendanceRecord record;
        
        // Find an incomplete record (has clock-in but no clock-out) or create new one
        AttendanceRecord incompleteRecord = todayRecords.stream()
                .filter(r -> r.getClockInTime() != null && r.getClockOutTime() == null)
                .findFirst()
                .orElse(null);

        if (incompleteRecord != null) {
            // Already clocked in and not clocked out yet
            log.warn("User {} already has an incomplete clock-in record", userId);
            return Response.builder()
                    .status(400)
                    .message("Already clocked in today")
                    .build();
        }

        // No incomplete record found - create a new one (allows clock in again after clock out)
        record = AttendanceRecord.builder()
                .user(user)
                .date(today)
                .clockInTime(now)
                .isLate(isLate)
                .build();
        record = attendanceRecordRepository.save(record);

        String message = isLate ? "Clocked in successfully but LATE (after 9:00 AM)" : "Clocked in successfully";

        return Response.builder()
                .status(200)
                .message(message)
                .attendanceRecord(modelMapper.map(record, AttendanceRecordDTO.class))
                .build();
    }

    @Override
    public Response clockOut(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        // Get all records for today - now returns a List
        List<AttendanceRecord> todayRecords = attendanceRecordRepository.findByUserAndDate(user, today);

        // Find an incomplete record (has clock-in but no clock-out)
        AttendanceRecord incompleteRecord = todayRecords.stream()
                .filter(r -> r.getClockInTime() != null && r.getClockOutTime() == null)
                .findFirst()
                .orElse(null);

        if (incompleteRecord == null) {
            return Response.builder()
                    .status(400)
                    .message("No clock-in record found for today")
                    .build();
        }

        if (incompleteRecord.getClockOutTime() != null) {
            return Response.builder()
                    .status(400)
                    .message("Already clocked out today")
                    .build();
        }

        incompleteRecord.setClockOutTime(now);
        incompleteRecord.setUpdatedAt(LocalDateTime.now());
        AttendanceRecord record = attendanceRecordRepository.save(incompleteRecord);

        return Response.builder()
                .status(200)
                .message("Clocked out successfully")
                .attendanceRecord(modelMapper.map(record, AttendanceRecordDTO.class))
                .build();
    }

    @Override
    public Response getUserAttendance(Long userId, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<AttendanceRecord> records = attendanceRecordRepository.findByUser(user).stream()
                .filter(r -> r.getDate().compareTo(startDate) >= 0 && r.getDate().compareTo(endDate) <= 0)
                .collect(Collectors.toList());

        List<AttendanceRecordDTO> dtos = records.stream()
                .map(r -> modelMapper.map(r, AttendanceRecordDTO.class))
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .attendanceRecords(dtos)
                .build();
    }

    @Override
    public Response getStaffAttendanceAnalysis(LocalDate startDate, LocalDate endDate) {
        List<AttendanceRecord> records = attendanceRecordRepository.findStaffAttendanceBetweenDates(startDate, endDate, UserRole.STAFF);

        // Get all staff
        List<User> staffList = userRepository.findAll().stream()
                .filter(u -> u.getRole().equals(UserRole.STAFF))
                .collect(Collectors.toList());

        // Create analysis data
        List<Map<String, Object>> staffAnalysis = staffList.stream()
                .map(staff -> {
                    Map<String, Object> analysis = new HashMap<>();
                    analysis.put("userId", staff.getId());
                    analysis.put("userName", staff.getName());
                    analysis.put("userEmail", staff.getEmail());

                    // Filter records for this staff
                    List<AttendanceRecord> staffRecords = records.stream()
                            .filter(r -> r.getUser().getId().equals(staff.getId()))
                            .collect(Collectors.toList());

                    long totalDays = staffRecords.size();
                    long lateDays = staffRecords.stream().filter(r -> Boolean.TRUE.equals(r.getIsLate())).count();
                    long onTimeDays = totalDays - lateDays;
                    long clockedOutDays = staffRecords.stream().filter(r -> r.getClockOutTime() != null).count();

                    analysis.put("totalDays", totalDays);
                    analysis.put("onTimeDays", onTimeDays);
                    analysis.put("lateDays", lateDays);
                    analysis.put("clockedOutDays", clockedOutDays);
                    analysis.put("attendancePercentage", totalDays > 0 ? (onTimeDays * 100.0 / totalDays) : 0);

                    return analysis;
                })
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .staffAnalysis(staffAnalysis)
                .build();
    }

    @Override
    public Response getDefaultersList(LocalDate startDate, LocalDate endDate) {
        List<AttendanceRecord> lateRecords = attendanceRecordRepository.findLateStaffAttendanceBetweenDates(startDate, endDate, UserRole.STAFF);

        // Group by user and count late occurrences
        Map<Long, Map<String, Object>> defaulterMap = new HashMap<>();

        for (AttendanceRecord record : lateRecords) {
            User user = record.getUser();
            Long userId = user.getId();

            if (!defaulterMap.containsKey(userId)) {
                Map<String, Object> defaulter = new HashMap<>();
                defaulter.put("userId", userId);
                defaulter.put("userName", user.getName());
                defaulter.put("userEmail", user.getEmail());
                defaulter.put("lateCount", 0L);
                defaulter.put("lateDates", java.util.Collections.synchronizedList(new java.util.ArrayList<>()));
                defaulterMap.put(userId, defaulter);
            }

            Map<String, Object> defaulter = defaulterMap.get(userId);
            defaulter.put("lateCount", ((Long) defaulter.get("lateCount")) + 1);
            ((java.util.List) defaulter.get("lateDates")).add(record.getDate().toString());
        }

        List<Map<String, Object>> defaulters = defaulterMap.values().stream()
                .sorted((a, b) -> Long.compare((Long) b.get("lateCount"), (Long) a.get("lateCount")))
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .defaulters(defaulters)
                .build();
    }

    @Override
    public Response getAttendanceStats() {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today;

        List<AttendanceRecord> monthRecords = attendanceRecordRepository.findStaffAttendanceBetweenDates(startOfMonth, endOfMonth, UserRole.STAFF);

        long totalClockIns = monthRecords.size();
        long lateClockIns = monthRecords.stream().filter(r -> Boolean.TRUE.equals(r.getIsLate())).count();
        long onTimeClockIns = totalClockIns - lateClockIns;

        // Get today's attendance
        List<AttendanceRecord> todayRecords = attendanceRecordRepository.findByDate(today);
        long clockedInToday = todayRecords.stream().filter(r -> r.getClockInTime() != null).count();
        long clockedOutToday = todayRecords.stream().filter(r -> r.getClockOutTime() != null).count();

        // Get all staff count
        long totalStaff = userRepository.findAll().stream().filter(u -> u.getRole().equals(UserRole.STAFF)).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStaff", totalStaff);
        stats.put("clockedInToday", clockedInToday);
        stats.put("clockedOutToday", clockedOutToday);
        stats.put("totalClockInsThisMonth", totalClockIns);
        stats.put("onTimeClockIns", onTimeClockIns);
        stats.put("lateClockIns", lateClockIns);
        stats.put("attendanceRate", totalClockIns > 0 ? (onTimeClockIns * 100.0 / totalClockIns) : 0);

        return Response.builder()
                .status(200)
                .message("success")
                .attendanceStats(stats)
                .build();
    }

    @Override
    public Response resetIncompleteRecord(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate today = LocalDate.now();

        // Find incomplete records
        List<AttendanceRecord> incompleteRecords = attendanceRecordRepository.findIncompleteRecords(user, today);

        if (incompleteRecords.isEmpty()) {
            return Response.builder()
                    .status(200)
                    .message("No incomplete records found")
                    .build();
        }

        // Delete all incomplete records
        for (AttendanceRecord record : incompleteRecords) {
            attendanceRecordRepository.deleteById(record.getId());
            log.info("Deleted incomplete attendance record: {}", record.getId());
        }

        return Response.builder()
                .status(200)
                .message("Incomplete records cleared. You can now clock in again.")
                .build();
    }
}
