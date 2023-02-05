import logo from '../hippohonk.png'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

const Header = () => {
    return (
        <header>
            <div>
                <img src={logo} className="logo-img" alt="Hippo Horn" />
            </div>
            <div>
                <MenuRoundedIcon fontSize='large' />
            </div>
        </header>
    )
}

export default Header