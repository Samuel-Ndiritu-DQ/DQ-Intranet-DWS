/**
 * Employee Onboarding Service
 * Handles saving onboarding form data and documents to Supabase (LMS Database)
 * Uses VITE_LMS_SUPABASE_URL and VITE_LMS_SUPABASE_ANON_KEY
 */

import { lmsSupabase as supabase } from '../lib/lmsSupabaseClient';

// Types
export interface OnboardingFormData {
    [key: string]: any;
}

export interface OnboardingDocument {
    id: string;
    employee_id: string;
    field_name: string;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    status: 'uploaded' | 'reviewed' | 'approved' | 'rejected' | 'expired';
    category: 'id' | 'certificate' | 'letter' | 'credential' | 'contract' | 'other';
    validation_comments?: string;
    expiry_date?: string;
    version: number;
    created_at: string;
    updated_at: string;
}

export interface SaveOnboardingResult {
    success: boolean;
    error?: string;
}

// ============================================
// EMPLOYEE FUNCTIONS
// ============================================

/**
 * Ensure an employee record exists in the employees table
 * This prevents foreign key violations when saving onboarding data
 */
export async function ensureEmployeeRecord(employee: {
    employee_id: string;
    email: string;
    name: string;
}): Promise<SaveOnboardingResult> {
    try {
        const { error } = await supabase
            .from('employees')
            .upsert({
                employee_id: employee.employee_id,
                email: employee.email,
                name: employee.name,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'employee_id'
            });

        if (error) {
            console.error('Error ensuring employee record:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        console.error('Error in ensureEmployeeRecord:', err);
        return { success: false, error: err.message };
    }
}

// ============================================
// FORM DATA FUNCTIONS
// ============================================

/**
 * Get existing onboarding data for an employee
 */
export async function getOnboardingData(employeeId: string): Promise<OnboardingFormData | null> {
    try {
        const { data, error } = await supabase
            .from('employee_onboarding_data')
            .select('*')
            .eq('employee_id', employeeId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching onboarding data:', error);
            return null;
        }

        return data?.onboarding_data || null;
    } catch (err) {
        console.error('Error in getOnboardingData:', err);
        return null;
    }
}

/**
 * Save/update onboarding form data (JSONB)
 */
export async function saveOnboardingData(
    employeeId: string,
    formData: OnboardingFormData,
    currentStep: number = 0,
    employeeInfo?: { name: string; email: string }
): Promise<SaveOnboardingResult> {
    try {
        // 1. Ensure employee record exists if info provided (prevents FKey errors)
        if (employeeInfo) {
            await ensureEmployeeRecord({
                employee_id: employeeId,
                name: employeeInfo.name,
                email: employeeInfo.email
            });
        }

        // 2. Upsert onboarding data
        const { error } = await supabase
            .from('employee_onboarding_data')
            .upsert({
                employee_id: employeeId,
                onboarding_data: formData,
                current_step: currentStep,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'employee_id'
            });

        if (error) {
            console.error('Error saving onboarding data:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        console.error('Error in saveOnboardingData:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Mark onboarding as complete in the employees table
 */
export async function completeOnboarding(employeeId: string): Promise<SaveOnboardingResult> {
    try {
        const { error } = await supabase
            .from('employees')
            .update({
                onboarding_completed: true,
                new_joiner: false,
                updated_at: new Date().toISOString(),
            })
            .eq('employee_id', employeeId);

        if (error) {
            console.error('Error completing onboarding:', error);
            return { success: false, error: error.message };
        }

        // Also update localStorage for immediate UI feedback
        localStorage.setItem('onboardingComplete', 'true');

        return { success: true };
    } catch (err: any) {
        console.error('Error in completeOnboarding:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Check if employee has completed onboarding
 */
export async function checkOnboardingComplete(employeeId: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('employees')
            .select('onboarding_completed')
            .eq('employee_id', employeeId)
            .single();

        if (error) {
            console.error('Error checking onboarding status:', error);
            return false;
        }

        return data?.onboarding_completed || false;
    } catch (err) {
        console.error('Error in checkOnboardingComplete:', err);
        return false;
    }
}

// ============================================
// DOCUMENT UPLOAD FUNCTIONS
// ============================================

const STORAGE_BUCKET = 'employee_files';

/**
 * Upload a document to storage and save metadata
 */
export async function uploadDocument(
    employeeId: string,
    fieldName: string,
    file: File,
    category: OnboardingDocument['category'] = 'other'
): Promise<SaveOnboardingResult & { filePath?: string }> {
    try {
        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${employeeId}/${fieldName}/${timestamp}_${safeName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false, // Don't overwrite, create new
            });

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            return { success: false, error: uploadError.message };
        }

        // Save metadata to database
        const { error: dbError } = await supabase
            .from('employee_onboarding_documents')
            .insert({
                employee_id: employeeId,
                field_name: fieldName,
                file_path: filePath,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
            });

        if (dbError) {
            console.error('Error saving document metadata:', dbError);
            // Try to clean up the uploaded file
            await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
            return { success: false, error: dbError.message };
        }

        return { success: true, filePath };
    } catch (err: any) {
        console.error('Error in uploadDocument:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Get all documents for an employee
 */
export async function getEmployeeDocuments(employeeId: string): Promise<OnboardingDocument[]> {
    try {
        const { data, error } = await supabase
            .from('employee_onboarding_documents')
            .select('*')
            .eq('employee_id', employeeId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching documents:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Error in getEmployeeDocuments:', err);
        return [];
    }
}

/**
 * Get documents for a specific field
 */
export async function getDocumentsByField(
    employeeId: string,
    fieldName: string
): Promise<OnboardingDocument[]> {
    try {
        const { data, error } = await supabase
            .from('employee_onboarding_documents')
            .select('*')
            .eq('employee_id', employeeId)
            .eq('field_name', fieldName)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching documents by field:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Error in getDocumentsByField:', err);
        return [];
    }
}

/**
 * Get a signed URL for downloading/viewing a document
 */
export async function getDocumentUrl(filePath: string): Promise<string | null> {
    try {
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (error) {
            console.error('Error creating signed URL:', error);
            return null;
        }

        return data?.signedUrl || null;
    } catch (err) {
        console.error('Error in getDocumentUrl:', err);
        return null;
    }
}

/**
 * Delete a document
 */
export async function deleteDocument(
    documentId: string,
    filePath: string
): Promise<SaveOnboardingResult> {
    try {
        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([filePath]);

        if (storageError) {
            console.error('Error deleting from storage:', storageError);
            // Continue to delete metadata anyway
        }

        // Delete metadata
        const { error: dbError } = await supabase
            .from('employee_onboarding_documents')
            .delete()
            .eq('id', documentId);

        if (dbError) {
            console.error('Error deleting document metadata:', dbError);
            return { success: false, error: dbError.message };
        }

        return { success: true };
    } catch (err: any) {
        console.error('Error in deleteDocument:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Update document status (HR/Support action)
 */
export async function updateDocumentStatus(
    documentId: string,
    status: OnboardingDocument['status'],
    comments?: string
): Promise<SaveOnboardingResult> {
    try {
        const { error } = await supabase
            .from('employee_onboarding_documents')
            .update({
                status,
                validation_comments: comments,
                updated_at: new Date().toISOString(),
            })
            .eq('id', documentId);

        if (error) {
            console.error('Error updating document status:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        console.error('Error in updateDocumentStatus:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Get documents by category
 */
export async function getDocumentsByCategory(
    employeeId: string,
    category: OnboardingDocument['category']
): Promise<OnboardingDocument[]> {
    try {
        const { data, error } = await supabase
            .from('employee_onboarding_documents')
            .select('*')
            .eq('employee_id', employeeId)
            .eq('category', category)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching documents by category:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Error in getDocumentsByCategory:', err);
        return [];
    }
}
