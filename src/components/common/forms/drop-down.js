const DropDown = ({options}) => {
    return(
        <select className="drop-down">
            {options.map((option) => (
                    <option>{option}</option>   
            ))}
        </select>
    )
}

export default DropDown