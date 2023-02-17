const InputField = ({type, name, label}) => {
    return(
        <div className="input-wrapper">
            {label ? <label for={name} className="input-label">{label}</label> : ""}
            <input type={type} id={name}  className="input-field"></input>
        </div>
        
    )
}

export default InputField
