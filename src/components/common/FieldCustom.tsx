import type { ReactElement } from 'react'
import { 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Switch, 
  Checkbox, 
  Radio,
  Upload,
} from 'antd'
import type { InputProps, SelectProps, DatePickerProps, InputNumberProps, UploadProps } from 'antd'
import type { TextAreaProps } from 'antd/es/input'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { Controller as FormController } from 'react-hook-form'
import { AlertCircle, Eye, EyeOff, Upload as UploadIcon } from 'lucide-react'
import { useState } from 'react'

interface BaseFieldProps {
  label?: string
  error?: string
  required?: boolean
  helpText?: string
  className?: string
}

interface InputFieldProps extends BaseFieldProps, Omit<InputProps, 'status'> {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url'
}

export const InputField = ({
  label,
  error,
  required,
  helpText,
  className = '',
  type = 'text',
  ...props
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false)

  const renderInput = () => {
    if (type === 'password') {
      return (
        <Input
          {...props}
          type={showPassword ? 'text' : 'password'}
          status={error ? 'error' : ''}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
      )
    }
    return <Input {...props} type={type} status={error ? 'error' : ''} />
  }

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

interface TextAreaFieldProps extends BaseFieldProps, Omit<TextAreaProps, 'status'> {}

export const TextAreaField = ({
  label,
  error,
  required,
  helpText,
  className = '',
  ...props
}: TextAreaFieldProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Input.TextArea {...props} status={error ? 'error' : ''} />
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

interface SelectFieldProps extends BaseFieldProps, Omit<SelectProps, 'status'> {
  options: { value: string | number; label: string; disabled?: boolean }[]
}

export const SelectField = ({
  label,
  error,
  required,
  helpText,
  className = '',
  options,
  ...props
}: SelectFieldProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Select
        {...props}
        status={error ? 'error' : ''}
        options={options}
        className="w-full"
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

interface DateFieldProps extends BaseFieldProps, Omit<DatePickerProps, 'status'> {}

export const DateField = ({
  label,
  error,
  required,
  helpText,
  className = '',
  ...props
}: DateFieldProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <DatePicker {...props} status={error ? 'error' : ''} className="w-full" />
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

interface NumberFieldProps extends BaseFieldProps, Omit<InputNumberProps, 'status'> {}

export const NumberField = ({
  label,
  error,
  required,
  helpText,
  className = '',
  ...props
}: NumberFieldProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <InputNumber {...props} status={error ? 'error' : ''} className="w-full" />
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

interface SwitchFieldProps extends BaseFieldProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
}

export const SwitchField = ({
  label,
  error,
  helpText,
  className = '',
  checked,
  onChange,
  disabled,
}: SwitchFieldProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Switch checked={checked} onChange={onChange} disabled={disabled} />
        {label && <span className="text-sm text-gray-700">{label}</span>}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

interface CheckboxFieldProps extends BaseFieldProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
}

export const CheckboxField = ({
  label,
  error,
  helpText,
  className = '',
  checked,
  onChange,
  disabled,
}: CheckboxFieldProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      <Checkbox
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
      >
        {label}
      </Checkbox>
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

// Radio Group Field
interface RadioFieldProps extends BaseFieldProps {
  options: { value: string | number; label: string; disabled?: boolean }[]
  value?: string | number
  onChange?: (value: string | number) => void
  direction?: 'horizontal' | 'vertical'
}

export const RadioField = ({
  label,
  error,
  required,
  helpText,
  className = '',
  options,
  value,
  onChange,
  direction = 'horizontal',
}: RadioFieldProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Radio.Group
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={direction === 'vertical' ? 'flex flex-col gap-2' : ''}
      >
        {options.map((option) => (
          <Radio key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

// Upload Field
interface UploadFieldProps extends BaseFieldProps, Omit<UploadProps, 'children'> {
  buttonText?: string
}

export const UploadField = ({
  label,
  error,
  required,
  helpText,
  className = '',
  buttonText = 'Upload',
  ...props
}: UploadFieldProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Upload {...props}>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <UploadIcon className="w-4 h-4" />
          {buttonText}
        </button>
      </Upload>
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

// React Hook Form Controller Wrapper
interface ControlledFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  render: (props: {
    value: unknown
    onChange: (...event: unknown[]) => void
    onBlur: () => void
    error?: string
  }) => ReactElement
}

export const ControlledField = <TFieldValues extends FieldValues>({
  name,
  control,
  render,
}: ControlledFieldProps<TFieldValues>) => {
  return (
    <FormController
      name={name}
      control={control}
      render={({ field, fieldState }) =>
        render({
          value: field.value,
          onChange: field.onChange,
          onBlur: field.onBlur,
          error: fieldState.error?.message,
        })
      }
    />
  )
}

// Export all components
export default {
  Input: InputField,
  TextArea: TextAreaField,
  Select: SelectField,
  Date: DateField,
  Number: NumberField,
  Switch: SwitchField,
  Checkbox: CheckboxField,
  Radio: RadioField,
  Upload: UploadField,
  Controlled: ControlledField,
}
