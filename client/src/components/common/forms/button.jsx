import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import './forms.css';

const Button = ({children, onClick, type = "button", disabled = false, className = ""}) => {

    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`button ${className}`.trim()}>
            {children} {type === "navigation" && <KeyboardDoubleArrowRightRoundedIcon sx={{marginTop: "0", marginBottom: "0"}} />}
        </button>
    )
}

export default Button