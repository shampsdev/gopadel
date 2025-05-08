import React, { useState } from "react"
import InputField from "./InputField"

const DateExample: React.FC = () => {
  const [birthDate, setBirthDate] = useState("")

  // Custom validation for dates (optional - component already has built-in validation)
  const validateDate = (value: string): boolean => {
    // You can add additional custom validations here
    const datePattern = /^(\d{2})\.(\d{2})\.(\d{4})$/

    if (!datePattern.test(value)) {
      return false
    }

    const [, day, month, year] = value.match(datePattern) || []
    const dayNum = parseInt(day, 10)
    const monthNum = parseInt(month, 10)
    const yearNum = parseInt(year, 10)

    // Check if it's a valid date in the past
    const now = new Date()
    const birthDate = new Date(yearNum, monthNum - 1, dayNum)

    return birthDate < now
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Date Input Example</h2>

      <div className="mb-4">
        <InputField
          title="Birth Date"
          value={birthDate}
          onChangeFunction={setBirthDate}
          maxLength={10}
          type="date"
          placeholder="дд.мм.гггг"
          validation={validateDate}
        />
        <p className="mt-2 text-sm text-gray-600">
          Please enter your birth date in ДД.ММ.ГГГГ format
        </p>
      </div>

      <div className="mt-4">
        {birthDate && (
          <p className="text-sm">
            Date entered: <span className="font-semibold">{birthDate}</span>
            {validateDate(birthDate) ? (
              <span className="ml-2 text-green-600">✓ Valid date</span>
            ) : (
              <span className="ml-2 text-red-600">✗ Invalid date</span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}

export default DateExample
