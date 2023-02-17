import logo from '../hippohonk.png'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Link } from 'react-router-dom';
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const Header = () => {
    const [state, setState] = useState(false)

    const buttonStyle = {
        background: 'none',
        border: 'none',
        color: 'white',
        marginTop: 20,
        marginRight: 10,
        cursor: 'pointer'
    }

    return (
        <header>
            <div>
                <Link to="/"><img src={logo} className="logo-img" alt="Hippo Horn" /></Link>
            </div>
            <div>
                <button style={buttonStyle} onClick={() => setState(true)}><MenuRoundedIcon fontSize='large' /></button>

                <Drawer open={state} anchor={"right"} onClose={() => setState(false)}>
                    <Box 
                        sx={{
                            backgroundColor:'#C0311D',
                            height: '100%'
                        }}
                        role="presentation" 
                        onClick={() => setState(false)}
                        onKeyDown={() => setState(false)}>
                        <div clasName="menu-internal-wrapper">
                            <div className="menu-close">
                                <button style={buttonStyle} onClick={() =>setState(false)}><CloseRoundedIcon fontSize='large' /></button>
                            </div>
                            <ul className="main-menu">
                                {/* <li>About</li> */}
                                <li><NavLink to="/bands">Bands</NavLink> </li>
                                <li className="ul-category">Festivals
                                <ul className="main-menu">
                                    <li><NavLink to="/festivals/sxsw-2023">SXSW 2023</NavLink></li>
                                    <li><NavLink to="/festivals/sxsw-2020">SXSW 2020</NavLink></li>
                                    <li><NavLink to="/festivals/sxsw-2019">SXSW 2019</NavLink></li>
                                    <li><NavLink to="/festivals/sxsw-2018">SXSW 2018</NavLink></li>
                                </ul></li>
                            </ul>
                        </div>
                    </Box>
                </Drawer>
            </div>
        </header>
    )
}

export default Header