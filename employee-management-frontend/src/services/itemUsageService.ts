// src/services/itemUsageService.ts
import apiClient from "../lib/axios";
import {
  ItemUsageRecordDto,
  CreateItemUsageDto,
  UpdateItemUsageDto,
} from "../types/types";

// Get all item usage records
export const getAllItemUsageRecords = async (): Promise<
  ItemUsageRecordDto[]
> => {
  try {
    const response = await apiClient.get<ItemUsageRecordDto[]>(
      "/api/item-usage"
    );
    return response.data;
  } catch (error) {
    console.error("Get All Item Usage Records API error:", error);
    throw error;
  }
};

// Get a single item usage record by ID
export const getItemUsageRecordById = async (
  id: number
): Promise<ItemUsageRecordDto> => {
  try {
    const response = await apiClient.get<ItemUsageRecordDto>(
      `/api/item-usage/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Get Item Usage Record By ID (${id}) API error:`, error);
    throw error;
  }
};

// Create a new item usage record
export const createItemUsageRecord = async (
  data: CreateItemUsageDto
): Promise<ItemUsageRecordDto> => {
  // Ensure employeeId is a number before sending
  const payload = {
    ...data,
    employeeId: Number(data.employeeId),
  };
  try {
    const response = await apiClient.post<ItemUsageRecordDto>(
      "/api/item-usage",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Create Item Usage Record API error:", error);
    throw error;
  }
};

// Update an existing item usage record
export const updateItemUsageRecord = async (
  id: number,
  data: UpdateItemUsageDto
): Promise<ItemUsageRecordDto> => {
  // Ensure employeeId is a number before sending
  const payload = {
    ...data,
    employeeId: Number(data.employeeId),
  };
  try {
    const response = await apiClient.put<ItemUsageRecordDto>(
      `/api/item-usage/${id}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error(`Update Item Usage Record (${id}) API error:`, error);
    throw error;
  }
};

// Delete an item usage record
export const deleteItemUsageRecord = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/item-usage/${id}`);
  } catch (error) {
    console.error(`Delete Item Usage Record (${id}) API error:`, error);
    throw error;
  }
};
