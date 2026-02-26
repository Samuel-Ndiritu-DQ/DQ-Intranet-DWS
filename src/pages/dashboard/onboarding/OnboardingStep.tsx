import { AlertCircleIcon, InfoIcon, Plus, Trash2 } from 'lucide-react';

export function OnboardingStep({
    stepData,
    formData,
    errors,
    touchedFields,
    onChange,
    validateField,
}) {
    const renderTooltip = (tooltipText) => {
        return (
            <div className="group relative inline-block ml-1">
                <InfoIcon size={14} className="text-gray-400 cursor-help" />
                <div className="absolute z-10 w-64 p-2 text-xs text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-full left-1/2 transform -translate-x-1/2 mb-1 pointer-events-none">
                    {tooltipText}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                </div>
            </div>
        );
    };

    const handleRepeaterChange = (fieldName, index, subFieldName, value) => {
        const currentList = Array.isArray(formData[fieldName]) ? [...formData[fieldName]] : [{}];
        if (subFieldName) {
            currentList[index] = { ...currentList[index], [subFieldName]: value };
        } else {
            currentList[index] = value;
        }
        onChange(fieldName, currentList);
    };

    const addRepeaterItem = (fieldName, defaultValue = '') => {
        const currentList = Array.isArray(formData[fieldName]) ? [...formData[fieldName]] : [];
        onChange(fieldName, [...currentList, defaultValue]);
    };

    const removeRepeaterItem = (fieldName, index) => {
        const currentList = Array.isArray(formData[fieldName]) ? [...formData[fieldName]] : [];
        if (currentList.length > 1) {
            currentList.splice(index, 1);
            onChange(fieldName, currentList);
        }
    };

    const renderField = (field) => {
        const fieldValue = formData[field.fieldName] || '';
        const hasError = !!errors[field.fieldName];
        const isTouched = !!touchedFields[field.fieldName];

        if (field.type === 'repeater') {
            const list = Array.isArray(fieldValue) ? fieldValue : (field.itemTemplate ? [{}] : ['']);

            return (
                <div key={field.id} className="space-y-4 mb-8">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center justify-between">
                        <span className="flex items-center">
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </span>
                        <button
                            type="button"
                            onClick={() => addRepeaterItem(field.fieldName, field.itemTemplate ? {} : '')}
                            className="text-blue-600 hover:text-blue-700 text-xs flex items-center bg-blue-50 px-2 py-1 rounded"
                        >
                            <Plus size={14} className="mr-1" /> Add More
                        </button>
                    </label>

                    <div className="space-y-3">
                        {list.map((item, index) => (
                            <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-100 relative group">
                                <div className="flex-1 space-y-3">
                                    {field.itemTemplate ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {field.itemTemplate.map((subField, subIndex) => (
                                                <div key={subField.fieldName} className="space-y-1">
                                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{subField.label}</label>
                                                    <input
                                                        type={subField.type || 'text'}
                                                        value={item[subField.fieldName] || ''}
                                                        autoFocus={index > 0 && index === list.length - 1 && subIndex === 0}
                                                        onChange={(e) => handleRepeaterChange(field.fieldName, index, subField.fieldName, e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                addRepeaterItem(field.fieldName, field.itemTemplate ? {} : '');
                                                            }
                                                        }}
                                                        placeholder={subField.placeholder || ''}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={item || ''}
                                            autoFocus={index > 0 && index === list.length - 1}
                                            onChange={(e) => handleRepeaterChange(field.fieldName, index, null, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addRepeaterItem(field.fieldName, field.itemTemplate ? {} : '');
                                                }
                                            }}
                                            placeholder={field.placeholder || ''}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    )}
                                </div>
                                {list.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeRepeaterItem(field.fieldName, index)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div key={field.id} className="space-y-2 mb-6">
                <label
                    htmlFor={field.fieldName}
                    className="block text-sm font-medium text-gray-700 flex items-center"
                >
                    {field.label}
                    {field.required && <span className="ml-1 text-red-500">*</span>}
                    {field.tooltip && renderTooltip(field.tooltip)}
                </label>
                {field.type === 'textarea' ? (
                    <textarea
                        id={field.fieldName}
                        name={field.fieldName}
                        value={fieldValue}
                        onChange={(e) => onChange(field.fieldName, e.target.value)}
                        onBlur={() => validateField(field.fieldName, fieldValue)}
                        rows={4}
                        placeholder={field.placeholder || ''}
                        className={`w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    />
                ) : field.type === 'select' ? (
                    <select
                        id={field.fieldName}
                        name={field.fieldName}
                        value={fieldValue}
                        onChange={(e) => onChange(field.fieldName, e.target.value)}
                        onBlur={() => validateField(field.fieldName, fieldValue)}
                        className={`w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    >
                        {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={field.type || 'text'}
                        id={field.fieldName}
                        name={field.fieldName}
                        value={fieldValue}
                        onChange={(e) => onChange(field.fieldName, e.target.value)}
                        onBlur={() => validateField(field.fieldName, fieldValue)}
                        placeholder={field.placeholder || ''}
                        min={field.min}
                        max={field.max}
                        className={`w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    />
                )}
                {field.formatHint && !hasError && (
                    <p className="text-xs text-gray-500 mt-1">{field.formatHint}</p>
                )}
                {hasError && isTouched && (
                    <div className="text-red-500 text-sm mt-1 flex items-start">
                        <AlertCircleIcon
                            size={14}
                            className="mr-1.5 flex-shrink-0 mt-0.5"
                        />
                        <span>{errors[field.fieldName]}</span>
                    </div>
                )}
                {field.helpText && !hasError && (
                    <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
                )}
            </div>
        );
    };
    const isFieldVisible = (field) => {
        if (!field.applicableStudio) return true;
        return field.applicableStudio === formData.studio;
    };

    const isSectionVisible = (section) => {
        if (!section.applicableStudio) {
            // Check if section fields are all hidden
            if (section.fields) {
                return section.fields.some(isFieldVisible);
            }
            return true;
        }
        return section.applicableStudio === formData.studio;
    };

    const visibleSections = stepData.sections?.filter(isSectionVisible) || [];
    const visibleFields = stepData.fields?.filter(isFieldVisible) || [];

    return (
        <div className="space-y-8">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    {stepData.title}
                </h2>
                <p className="text-gray-600">
                    Please provide the following essential details
                </p>
            </div>
            {stepData.sections ? (
                <div className="space-y-10">
                    {visibleSections.map((section, index) => (
                        <div key={index} className="space-y-6">
                            <div className="border-b border-gray-200 pb-2">
                                <h3 className="text-lg font-medium text-gray-800">
                                    {section.title}
                                </h3>
                                {section.description && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {section.description}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {section.fields.filter(isFieldVisible).map((field) => renderField(field))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {visibleFields.map((field) => renderField(field))}
                </div>
            )}
        </div>
    );
}
