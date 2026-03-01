package com.SupplySync.InventoryMgtSystem.repositories;

import com.SupplySync.InventoryMgtSystem.enums.UserRole;
import com.SupplySync.InventoryMgtSystem.models.AttendanceRecord;
import com.SupplySync.InventoryMgtSystem.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    List<AttendanceRecord> findByUserAndDate(User user, LocalDate date);

    List<AttendanceRecord> findByUser(User user);

    List<AttendanceRecord> findByDate(LocalDate date);

    List<AttendanceRecord> findByDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT ar FROM AttendanceRecord ar WHERE ar.user.role = :role AND ar.date BETWEEN :startDate AND :endDate")
    List<AttendanceRecord> findStaffAttendanceBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, @Param("role") UserRole role);

    @Query("SELECT ar FROM AttendanceRecord ar WHERE ar.user.role = :role AND ar.isLate = true AND ar.date BETWEEN :startDate AND :endDate")
    List<AttendanceRecord> findLateStaffAttendanceBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, @Param("role") UserRole role);

    @Query("SELECT COUNT(ar) FROM AttendanceRecord ar WHERE ar.user = :user AND ar.date BETWEEN :startDate AND :endDate")
    Long countAttendanceByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(ar) FROM AttendanceRecord ar WHERE ar.user = :user AND ar.isLate = true AND ar.date BETWEEN :startDate AND :endDate")
    Long countLateAttendanceByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT ar FROM AttendanceRecord ar WHERE ar.user = :user AND ar.date = :date AND ar.clockInTime IS NOT NULL AND ar.clockOutTime IS NULL")
    List<AttendanceRecord> findIncompleteRecords(@Param("user") User user, @Param("date") LocalDate date);

    void deleteById(Long id);
}
