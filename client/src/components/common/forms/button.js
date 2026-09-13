import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded';

const Button = ({children, onClick, type = "button"}) => {

    return (
        <button type={type} onClick={onClick} className="button">         
            {children} {type === "navigation" && <KeyboardDoubleArrowRightRoundedIcon sx={{marginTop: "0", marginBottom: "0"}} />}
        </button>
    )
}

export default Button