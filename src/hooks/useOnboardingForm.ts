// hooks/useOnboardingForm.ts
import { useState, useEffect, useRef } from "react";
import { useMsal } from "@azure/msal-react";
import { validateFormField } from "../utils/validation";
import {
  getOnboardingData,
  saveOnboardingData,
  completeOnboarding,
  ensureEmployeeRecord,
} from "../services/employeeOnboardingService";

export function useOnboardingForm(steps, onComplete) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [touchedFields, setTouchedFields] = useState<any>({});
  const [editedFields, setEditedFields] = useState<any>({});
  const [isEditingWelcome, setIsEditingWelcome] = useState(false);
  const [showStepsDropdown, setShowStepsDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const stepsDropdownRef: any = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        stepsDropdownRef.current &&
        !stepsDropdownRef.current.contains(event.target)
      ) {
        setShowStepsDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Use MSAL to get the logged-in user's info
  const { accounts } = useMsal();

  // Get employee ID from MSAL account (using localAccountId or email as fallback)
  const getEmployeeId = (): string => {
    const account = accounts[0];
    // Use localAccountId if available, otherwise use email
    return account?.localAccountId || account?.username || "";
  };

  // Load initial data from Supabase
  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      const account = accounts[0];
      const employeeId = getEmployeeId();

      // Default data from MSAL
      const defaultData = {
        tradeName: account?.name || "",
        role: "",
        email: account?.username || "",
        phone: "",
        industry: "",
        companyStage: "",
        contactName: account?.name || "",
      };

      if (employeeId) {
        try {
          // 1. Ensure employee record exists first (to avoid foreign key violations)
          await ensureEmployeeRecord({
            employee_id: employeeId,
            email: account?.username || "",
            name: account?.name || "",
          });

          // 2. Try to load existing data from Supabase
          const existingData = await getOnboardingData(employeeId);
          if (existingData) {
            // Merge existing data with defaults (existing takes precedence)
            setFormData({ ...defaultData, ...existingData });
            console.log("✅ Loaded existing onboarding data from Supabase");
          } else {
            setFormData(defaultData);
            console.log("ℹ️ No existing onboarding data, using defaults");
          }
        } catch (error) {
          console.error("Error loading onboarding data:", error);
          setFormData(defaultData);
        }
      } else {
        setFormData(defaultData);
      }

      setInitialLoading(false);
    };

    if (accounts.length > 0) {
      loadData();
    } else {
      setInitialLoading(false);
    }
  }, [accounts]);

  const handleInputChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    setTouchedFields((prev) => ({
      ...prev,
      [fieldName]: true,
    }));

    // Clear error if field becomes valid
    if (errors[fieldName]) {
      validateField(fieldName, value);
    }

    // Track edited fields for Welcome step
    if (currentStep === 0 && isEditingWelcome) {
      setEditedFields((prev) => ({
        ...prev,
        [fieldName]: true,
      }));
    }
  };

  const validateField = (fieldName, value) => {
    const field = findFieldDefinition(fieldName);
    if (!field) return true;

    const isValid = validateFormField(field, value);

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (isValid.success) {
        delete newErrors[fieldName];
      } else {
        newErrors[fieldName] = isValid.error;
      }
      return newErrors;
    });

    return isValid.success;
  };

  const findFieldDefinition = (fieldName) => {
    // Search through all steps to find field definition
    for (const step of steps) {
      if (step.sections) {
        for (const section of step.sections) {
          const field = section.fields?.find((f) => f.fieldName === fieldName);
          if (field) return field;
        }
      } else if (step.fields) {
        const field = step.fields.find((f) => f.fieldName === fieldName);
        if (field) return field;
      }
    }

    // Handle welcome step fields
    if (currentStep === 0) {
      const welcomeFields = getWelcomeFields();
      return welcomeFields.find((f) => f.fieldName === fieldName);
    }

    return null;
  };

  const getWelcomeFields = () => [
    {
      fieldName: "tradeName",
      label: "Name",
      required: true,
      minLength: 2,
    },
    { fieldName: "department", label: "Department", required: true },
    { fieldName: "role", label: "Role", required: true },
    { fieldName: "studio", label: "Studio", required: true },
    { fieldName: "email", label: "Email", required: true, type: "email" },
    { fieldName: "phone", label: "Phone", required: true, type: "tel" },
  ];

  const validateCurrentStep = () => {
    if (currentStep === steps.length - 1) return true;

    const step = steps[currentStep];
    let isValid = true;
    const touchedStepFields = {};

    const fieldsToValidate =
      currentStep === 0 ? getWelcomeFields() : getStepFields(step);

    fieldsToValidate.forEach((field) => {
      touchedStepFields[field.fieldName] = true;
      const fieldIsValid = validateField(
        field.fieldName,
        formData[field.fieldName]
      );
      if (!fieldIsValid) isValid = false;
    });

    setTouchedFields((prev) => ({ ...prev, ...touchedStepFields }));
    return isValid;
  };

  const getStepFields = (step) => {
    const fields: any = [];

    const isVisible = (item: any) => {
      if (!item.applicableStudio) return true;
      return item.applicableStudio === formData.studio;
    };

    if (step.sections) {
      step.sections.forEach((section) => {
        if (isVisible(section) && section.fields) {
          fields.push(...section.fields.filter(isVisible));
        }
      });
    } else if (step.fields) {
      fields.push(...step.fields.filter(isVisible));
    }
    return fields;
  };

  const handleSubmit = async () => {
    // Validate all fields
    const allFields: any = [];
    steps.forEach((step) => {
      allFields.push(...getStepFields(step));
    });

    const allTouchedFields = {};
    allFields.forEach((field) => {
      allTouchedFields[field.fieldName] = true;
    });
    setTouchedFields(allTouchedFields);

    // Validate required fields
    const requiredFields = allFields.filter((field) => field.required);
    let isValid = true;

    requiredFields.forEach((field) => {
      const fieldIsValid = validateField(
        field.fieldName,
        formData[field.fieldName]
      );
      if (!fieldIsValid) isValid = false;
    });

    if (isValid) {
      setLoading(true);
      const employeeId = getEmployeeId();

      try {
        if (employeeId) {
          const account = accounts[0];
          // Save form data to Supabase
          const saveResult = await saveOnboardingData(employeeId, formData, currentStep, {
            name: account?.name || "",
            email: account?.username || ""
          });

          if (!saveResult.success) {
            console.error("Failed to save onboarding data:", saveResult.error);
            // Still try to complete if save partially worked
          }

          // Mark onboarding as complete
          const completeResult = await completeOnboarding(employeeId);

          if (!completeResult.success) {
            console.error("Failed to mark onboarding complete:", completeResult.error);
          } else {
            console.log("✅ Onboarding completed successfully!");
          }
        }

        onComplete();
      } catch (error) {
        console.error("Error saving onboarding data:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // Navigate to first step with errors
      const errorStep = findFirstStepWithErrors();
      if (errorStep !== -1) {
        setCurrentStep(errorStep);
      }
    }
  };

  const findFirstStepWithErrors = () => {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const fields = getStepFields(step);
      if (fields.some((field) => errors[field.fieldName])) {
        return i;
      }
    }
    return -1;
  };

  const toggleWelcomeEdit = () => {
    setIsEditingWelcome(!isEditingWelcome);
  };

  const handleJumpToStep = (stepIndex) => {
    if (stepIndex !== currentStep) {
      setCurrentStep(stepIndex);
      window.scrollTo(0, 0);
      setShowStepsDropdown(false);
    }
  };

  const getStepCompletionStatus = (stepIndex) => {
    if (stepIndex === steps.length - 1) return true;

    const fields = stepIndex === 0 ? getWelcomeFields() : getStepFields(steps[stepIndex]);

    return fields.every((field) => {
      if (!field.required) return true;
      const value = formData[field.fieldName];
      return value && (typeof value !== "string" || value.trim() !== "");
    });
  };

  return {
    currentStep,
    formData,
    errors,
    touchedFields,
    editedFields,
    isEditingWelcome,
    showStepsDropdown,
    loading,
    initialLoading,
    stepsDropdownRef,
    setCurrentStep,
    setShowStepsDropdown,
    setIsEditingWelcome,
    handleInputChange,
    validateCurrentStep,
    validateField,
    toggleWelcomeEdit,
    handleSubmit,
    handleJumpToStep,
    getStepCompletionStatus,
    getEmployeeId,
  };
}
