// utils/validation.js
export function validateFormField(field, value) {
  const trimmedValue = typeof value === "string" ? value.trim() : value;

  // Required validation
  if (field.required) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return { success: false, error: `${field.label} is required` };
      }
      // For repeater fields, check if at least one entry has content
      const hasContent = value.some(item => {
        if (typeof item === 'string') return item.trim() !== '';
        if (typeof item === 'object' && item !== null) {
          return Object.values(item).some(val => val && String(val).trim() !== '');
        }
        return !!item;
      });
      if (!hasContent) {
        return { success: false, error: `${field.label} must have at least one entry` };
      }
    } else if (!trimmedValue || trimmedValue === "") {
      return {
        success: false,
        error: `${field.label} is required`,
      };
    }
  }

  // Min length validation
  if (
    field.minLength &&
    typeof trimmedValue === "string" &&
    trimmedValue.length < field.minLength
  ) {
    return {
      success: false,
      error: `${field.label} must be at least ${field.minLength} characters`,
    };
  }

  // Max length validation
  if (
    field.maxLength &&
    typeof trimmedValue === "string" &&
    trimmedValue.length > field.maxLength
  ) {
    return {
      success: false,
      error: `${field.label} must be no more than ${field.maxLength} characters`,
    };
  }

  // Pattern validation
  if (field.pattern && typeof trimmedValue === "string" && trimmedValue) {
    const regex = new RegExp(field.pattern);
    if (!regex.test(trimmedValue)) {
      return {
        success: false,
        error:
          field.patternErrorMessage || `${field.label} has an invalid format`,
      };
    }
  }

  // Email validation
  if (field.type === "email" && typeof trimmedValue === "string" && trimmedValue) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedValue)) {
      return {
        success: false,
        error: "Please enter a valid email address",
      };
    }
  }

  // Number validation
  if (field.type === "number" && trimmedValue !== "") {
    const numValue = Number(trimmedValue);
    if (isNaN(numValue)) {
      return {
        success: false,
        error: `${field.label} must be a number`,
      };
    }

    if (field.min !== undefined && numValue < field.min) {
      return {
        success: false,
        error: `${field.label} must be at least ${field.min}`,
      };
    }

    if (field.max !== undefined && numValue > field.max) {
      return {
        success: false,
        error: `${field.label} must be no more than ${field.max}`,
      };
    }
  }

  return { success: true };
}
