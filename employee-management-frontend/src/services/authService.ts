// src/services/authService.ts
import apiClient from "../lib/axios";
import {
  UserLoginDto,
  LoginResponseDto,
  UserRegisterDto,
  UserInfoDto,
} from "@/types/types"

// Adjust types based on your actual DTOs defined in src/types/api.ts or similar
// Example src/types/api.ts:
// export type { UserLoginDto, LoginResponseDto, UserRegisterDto, UserInfoDto } from '../../employee-management-backend/Models/DTOs/UserDtos'; // Or define manually

// Login function
export const loginUser = async (
  credentials: UserLoginDto
): Promise<LoginResponseDto> => {
  try {
    const response = await apiClient.post<LoginResponseDto>(
      "/api/auth/login",
      credentials
    );
    return response.data; // Contains the token { token: "..." }
  } catch (error) {
    console.error("Login API error:", error);
    // Rethrow or handle specific error messages based on backend response
    throw error;
  }
};

// Register function (optional for now)
export const registerUser = async (
  userData: UserRegisterDto
): Promise<void> => {
  try {
    await apiClient.post("/api/auth/register", userData);
    // No content expected on success (201 Created)
  } catch (error) {
    console.error("Register API error:", error);
    throw error;
  }
};

// Function to get current user info (using token stored by axios interceptor)
export const getCurrentUser = async (): Promise<UserInfoDto> => {
  try {
    const response = await apiClient.get<UserInfoDto>("/api/users/me");
    return response.data;
  } catch (error) {
    console.error("Get current user API error:", error);
    throw error;
  }
};
