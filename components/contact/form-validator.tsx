export type ValidationRule = {
  test: (value: string) => boolean
  message: string
}

export type FieldValidation = {
  [key: string]: ValidationRule[]
}

export const validateForm = (
  formData: FormData,
  validationRules: FieldValidation,
): { isValid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {}

  Object.keys(validationRules).forEach((fieldName) => {
    const value = (formData.get(fieldName) as string) || ""

    for (const rule of validationRules[fieldName]) {
      if (!rule.test(value)) {
        errors[fieldName] = rule.message
        break
      }
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Common validation rules
export const required = (message = "This field is required"): ValidationRule => ({
  test: (value) => value.trim() !== "",
  message,
})

export const email = (message = "Please enter a valid email address"): ValidationRule => ({
  test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  message,
})

export const phone = (message = "Please enter a valid phone number"): ValidationRule => ({
  test: (value) => value === "" || /^[\d\s+\-$$$$]{7,20}$/.test(value),
  message,
})

export const minLength = (length: number, message = `Must be at least ${length} characters`): ValidationRule => ({
  test: (value) => value.length >= length,
  message,
})

export const maxLength = (length: number, message = `Must be no more than ${length} characters`): ValidationRule => ({
  test: (value) => value.length <= length,
  message,
})
