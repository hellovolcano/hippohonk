import './forms.css'

const InputField = (props) => {
  const {
    label,
    name,
    id,
    type = "text",
    value,
    onChange,
    required = false,
    placeholder,
    multiline = false,
    rows = 3,
    className = "",
    ...rest
  } = props;

  const inputId = id || name;

  return (
    <div className="input-wrapper">
      {label ? (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      ) : null}

      {multiline ? (
        <textarea
          id={inputId}
          name={name}
          className={`input-field ${className}`.trim()}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          {...rest}
        />
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          className={`input-field ${className}`.trim()}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          {...rest}
        />
      )}
    </div>
  );
};

export default InputField;
