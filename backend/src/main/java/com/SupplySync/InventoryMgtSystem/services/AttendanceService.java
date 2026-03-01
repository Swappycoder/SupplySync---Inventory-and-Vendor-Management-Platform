package com.SupplySync.InventoryMgtSystem.services;

import com.SupplySync.InventoryMgtSystem.dtos.AttendanceRecordDTO;
import com.SupplySync.InventoryMgtSystem.dtos.Response;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    Response clockIn(Long userId);
    Response clockOut(Long userId);
    Response getUserAttendance(Long userId, LocalDate startDate, LocalDate endDate);
    Response getStaffAttendanceAnalysis(LocalDate startDate, LocalDate endDate);
    Response getDefaultersList(LocalDate startDate, LocalDate endDate);
    Response getAttendanceStats();
    Response resetIncompleteRecord(Long userId);
}
