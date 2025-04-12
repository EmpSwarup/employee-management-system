// src/services/attendanceService.ts
import apiClient from "../lib/axios";
import { MonthlyAttendanceDto, SaveAttendanceDto } from "@/types/types"; // Adjust path

// Fetch attendance data for a specific month
export const getMonthlyAttendance = async (
  year: number,
  month: number
): Promise<MonthlyAttendanceDto> => {
  try {
    // Backend expects month 1-12
    const response = await apiClient.get<MonthlyAttendanceDto>(
      `/api/attendance/${year}/${month}`
    );
    // Ensure the response has the expected structure, provide default if not
    return response.data ?? { attendanceData: {} };
  } catch (error) {
    console.error(
      `Get Monthly Attendance (${year}-${month}) API error:`,
      error
    );
    throw error;
  }
};

// Save attendance data for a specific month
export const saveMonthlyAttendance = async (
  data: SaveAttendanceDto
): Promise<void> => {
  try {
    // Backend expects 200 OK or 204 No Content on success
    await apiClient.post("/api/attendance", data);
  } catch (error) {
    console.error(`Save Monthly Attendance (${data.Month}) API error:`, error);
    throw error;
  }
};
