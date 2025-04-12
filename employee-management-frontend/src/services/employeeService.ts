// src/services/employeeService.ts
import apiClient from "../lib/axios";
import {
  EmployeeDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "../types/types";
import { EmployeeSelectItemDto } from '../types/types';


// Get all employees
export const getAllEmployees = async (): Promise<EmployeeDto[]> => {
  try {
    const response = await apiClient.get<EmployeeDto[]>("/api/employees");
    return response.data;
  } catch (error) {
    console.error("Get All Employees API error:", error);
    throw error; // Re-throw for component-level handling
  }
};

// Get a single employee by ID
export const getEmployeeById = async (id: number): Promise<EmployeeDto> => {
  try {
    const response = await apiClient.get<EmployeeDto>(`/api/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Get Employee By ID (${id}) API error:`, error);
    throw error;
  }
};

// Create a new employee
export const createEmployee = async (
  employeeData: CreateEmployeeDto
): Promise<EmployeeDto> => {
  try {
    // Backend returns 201 Created with the new employee object in the body
    const response = await apiClient.post<EmployeeDto>(
      "/api/employees",
      employeeData
    );
    return response.data;
  } catch (error) {
    console.error("Create Employee API error:", error);
    throw error;
  }
};

// Update an existing employee
export const updateEmployee = async (
  id: number,
  employeeData: UpdateEmployeeDto
): Promise<EmployeeDto> => {
  try {
    // Backend returns 200 OK with the updated employee object
    const response = await apiClient.put<EmployeeDto>(
      `/api/employees/${id}`,
      employeeData
    );
    return response.data;
  } catch (error) {
    console.error(`Update Employee (${id}) API error:`, error);
    throw error;
  }
};

// Delete an employee
export const deleteEmployee = async (id: number): Promise<void> => {
  try {
    // Backend returns 204 No Content on success
    await apiClient.delete(`/api/employees/${id}`);
  } catch (error) {
    console.error(`Delete Employee (${id}) API error:`, error);
    throw error;
  }
};

// Get employee list simplified for dropdowns
export const getEmployeeSelectList = async (): Promise<EmployeeSelectItemDto[]> => {
  try {
    const response = await apiClient.get<EmployeeSelectItemDto[]>('/api/employees/selectlist');
    return response.data;
  } catch (error) {
    console.error('Get Employee Select List API error:', error);
    throw error;
  }
};