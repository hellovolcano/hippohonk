import logo from '../hippohonk.png'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header>
            <div>
                <Link to="/"><img src={logo} className="logo-img" alt="Hippo Horn" /></Link>
            </div>
            <div>
                <MenuRoundedIcon fontSize='large' />
            </div>
        </header>
    )
}

export default Header