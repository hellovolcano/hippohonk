import './forms.css'

const DropDown = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  required = false,
  disabled = false,
  helperText,
  className = "",
}) => {
  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      <select
        id={name}
        name={name}
        className={`drop-down ${className}`.trim()}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
      >
        {placeholder && (
          <option value="">
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option.value ?? option.id}
            value={option.value ?? option.id}
          >
            {option.label ?? option.name}
          </option>
        ))}
      </select>

      {helperText && (
        <small className="input-helper-text">
          {helperText}
        </small>
      )}
    </div>
  );
};

export default DropDown;
