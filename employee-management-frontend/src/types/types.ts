import React, { LazyExoticComponent } from "react";

// Routes Types

export interface IRoute {
  id: string;
  path: string;
  name: string;
  component:
    | LazyExoticComponent<() => React.JSX.Element>
    | (() => React.JSX.Element);
  authenticated?: boolean;
  layout?: React.ComponentType<{ children: React.ReactNode }>;
  children?: IRoute[];
  icon?: string;
}

// Employee Types

export interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: boolean;
}

// Attendance Type

export type MonthlyAttendance = Record<number, Record<number, boolean>>;

// Employee info needed for display
export interface AttendanceEmployeeInfo {
  id: number; // Or string
  name: string;
}

// Items Type

export interface ItemDetail {
  name: string;
  quantity: number;
}

// Represents a full item usage record
export interface ItemUsageRecord {
  id: number; // Or string if UUID
  employeeId: number; // Or string
  employeeName: string; // Good for display on the list page
  date: string; // Store as ISO string (e.g., "YYYY-MM-DD")
  items: ItemDetail[];
}

// Simplified employee data needed for the dropdown
export interface EmployeeSelectItem {
  id: number; // Or string
  name: string;
}

export interface EmployeeDto {
  id: number;
  name: string;
  email: string;
  phone?: string | null; // Allow null from backend
  status: boolean;
}

// Matches backend CreateEmployeeDto (status defaults to true if omitted)
export interface CreateEmployeeDto {
  name: string;
  email: string;
  phone?: string | null;
  status?: boolean;
}

// Matches backend UpdateEmployeeDto
export interface UpdateEmployeeDto {
  name: string;
  email: string;
  phone?: string | null;
  status: boolean;
}

// Add other API types if needed in this file
export interface LoginResponseDto {
  token: string;
}
export interface UserInfoDto {
  id: number;
  email: string;
}
export interface UserLoginDto {
  email: string;
  password: string;
}

export interface UserRegisterDto {
  email: string;
  password: string; // Frontend needs to send the plain password
}

// Matches backend ItemDetailDto
export interface ItemDetailDto {
  itemName: string; // Ensure names match backend DTO
  quantity: number;
}

// Matches backend EmployeeSelectItemDto
export interface EmployeeSelectItemDto {
  id: number;
  name: string;
}

// Matches backend ItemUsageRecordDto
export interface ItemUsageRecordDto {
  id: number;
  employeeId: number;
  employeeName: string;
  transactionDate: string; // "YYYY-MM-DD"
  items: ItemDetailDto[];
}

// Matches backend CreateItemUsageDto
export interface CreateItemUsageDto {
  employeeId: number | string; // Allow string from select initially
  transactionDate: string; // "YYYY-MM-DD"
  items: ItemDetailDto[];
}

// Matches backend UpdateItemUsageDto
export interface UpdateItemUsageDto {
  employeeId: number | string; // Allow string from select initially
  transactionDate: string; // "YYYY-MM-DD"
  items: ItemDetailDto[];
}

// Matches the backend DTO for GET /api/attendance/{year}/{month} response
export interface MonthlyAttendanceDto {
  attendanceData: MonthlyAttendance;
}

// Matches the backend DTO for POST /api/attendance request body
export interface SaveAttendanceDto {
  Month: string; // Format "YYYY-MM"
  AttendanceData: MonthlyAttendance;
}

export interface SaveAttendanceDto {
  Month: string; // Format "YYYY-MM"
  AttendanceData: MonthlyAttendance;
}

// Simplified Employee info needed for the attendance page rows
// Could potentially re-use EmployeeSelectItemDto if structure matches
export interface AttendanceEmployeeInfo {
  id: number; // Or string if using UUIDs
  name: string;
}

// Optional: If using the backend's AttendanceRecord model directly
// (less common for API responses but useful for consistency)
export interface AttendanceRecordModel {
  id?: number; // Optional as it's not always needed/selected
  employeeId: number;
  attendanceDate: string; // Expecting "YYYY-MM-DD" or Date object depending on processing
  status: boolean;
  dayOfMonth?: number; // Optional calculated value
  createdAt?: string; // Optional
  updatedAt?: string; // Optional
}
