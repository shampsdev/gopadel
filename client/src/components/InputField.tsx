import React, { useState, useEffect } from "react"

export interface InputFieldComponentProps {
  onChangeFunction: (value: string) => void
  title: string
  value: string
  maxLength: number
  onFocus?: () => void
  onBlur?: () => void
  validation?: (value: string) => boolean
  type?: "text" | "date"
  placeholder?: string
  optional?: boolean
  multiline?: boolean
  rows?: number
}

const InputField = (props: InputFieldComponentProps) => {
  const isEmpty = props.value.trim() === ""
  const [isValid, setIsValid] = useState<boolean>(true)

  useEffect(() => {
    if (props.type === "date" && props.value) {
      setIsValid(validateDateFormat(props.value))
    } else if (props.validation && props.value) {
      setIsValid(props.validation(props.value))
    } else {
      setIsValid(true)
    }
  }, [props.value, props.validation, props.type])

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d.]/g, "")

    // Format as дд.мм.
    if (value.length > 0) {
      value = value.replace(/^(\d{2})(\d)/g, "$1.$2")
      value = value.replace(/^(\d{2})\.(\d{2})(\d)/g, "$1.$2.$3")

      // Limit to 10 characters (дд.мм.)
      if (value.length > 10) {
        value = value.slice(0, 10)
      }
    }

    props.onChangeFunction(value)
  }

  const validateDateFormat = (value: string): boolean => {
    // Basic дд.мм. validation
    const datePattern = /^(\d{2})\.(\d{2})\.(\d{4})$/

    if (!datePattern.test(value)) {
      return false
    }

    const [, day, month, year] = value.match(datePattern) || []
    const dayNum = parseInt(day, 10)
    const monthNum = parseInt(month, 10)
    const yearNum = parseInt(year, 10)

    // Basic date validation
    if (monthNum < 1 || monthNum > 12) return false
    if (dayNum < 1 || dayNum > 31) return false
    if (yearNum < 1900 || yearNum > 2100) return false

    // Check days in month
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate()
    if (dayNum > daysInMonth) return false

    return true
  }

  const getInputBorderColor = () => {
    // Don't show empty as error for optional fields
    if (isEmpty && props.optional) {
      return "border-gray-300 text-gray-400 focus-within:border-[#20C86E] focus-within:text-[#20C86E]"
    }

    if (isEmpty) return "border-[#E53935] text-[#E53935]"
    if (props.type === "date" && props.value && !isValid)
      return "border-[#E53935] text-[#E53935]"
    return "border-gray-300 text-gray-400 focus-within:border-[#20C86E] focus-within:text-[#20C86E]"
  }

  return (
    <section>
      <fieldset
        className={`border-2 rounded-xl px-3 relative transition-all duration-100 
          ${getInputBorderColor()} 
          `}
      >
        <legend className="px-2 text-[15px] font-semibold transition-all duration-100">
          {props.title}
        </legend>
        {props.type === "date" ? (
          <input
            onBlur={props.onBlur}
            onFocus={props.onFocus}
            onInput={handleDateInput}
            type="text"
            value={props.value}
            maxLength={10}
            placeholder={props.placeholder || "дд.мм.гггг"}
            className="w-full text-main outline-none pb-[12px] py-[3px] px-[16px] bg-transparent"
          />
        ) : props.multiline ? (
          <textarea
            onBlur={props.onBlur}
            onFocus={props.onFocus}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
              props.onChangeFunction(event.target.value)
            }
            value={props.value}
            maxLength={props.maxLength}
            placeholder={props.placeholder}
            rows={props.rows || 4}
            className="w-full text-main outline-none pb-[12px] py-[3px] px-[16px] bg-transparent resize-none"
          />
        ) : (
          <input
            onBlur={props.onBlur}
            onFocus={props.onFocus}
            onInput={(event: React.ChangeEvent<HTMLInputElement>) =>
              props.onChangeFunction(event.target.value)
            }
            type="text"
            value={props.value}
            maxLength={props.maxLength}
            placeholder={props.placeholder}
            className="w-full text-main outline-none pb-[12px] py-[3px] px-[16px] bg-transparent"
          />
        )}
      </fieldset>
    </section>
  )
}

export default InputField
