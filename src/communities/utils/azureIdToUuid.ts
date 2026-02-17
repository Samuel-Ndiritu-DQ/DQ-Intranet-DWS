/**
 * Utility to convert Azure AD localAccountId to deterministic UUID v5
 * This ensures consistent user IDs across the system
 */

import { v5 as uuidv5 } from "uuid";

// Fixed namespace UUID for generating deterministic UUIDs from Azure AD localAccountId
// This ensures the same Azure AD ID always generates the same UUID
const AZURE_AD_NAMESPACE = "550e8400-e29b-41d4-a716-446655440000";

/**
 * Converts an Azure AD localAccountId to a deterministic UUID v5
 * This ensures the same Azure AD ID always generates the same UUID,
 * matching what's stored in the users_local table
 * 
 * @param azureId - The Azure AD localAccountId
 * @returns The generated UUID v5 string
 */
export function azureIdToUuid(azureId: string): string {
  if (!azureId) {
    throw new Error("Azure ID is required");
  }
  return uuidv5(azureId, AZURE_AD_NAMESPACE);
}

