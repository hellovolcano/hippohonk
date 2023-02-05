import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded';

const Button = ({type, children}) => {

    // let navIcon
    // if type == "navigation" {
        
    // }

    return (
        <button className="button">         
            {children} {type === "navigation" && <KeyboardDoubleArrowRightRoundedIcon sx={{marginTop: "0", marginBottom: "0"}} />}
        </button>
    )
}

export default Button