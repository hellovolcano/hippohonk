import './App.css';
import { Routes, Route } from 'react-router-dom'
import Band from './pages/Band/Band'
import Home from './pages/Home/Home'
import Header from './components/header'
import Footer from './components/footer'
import AllBands from './pages/AllBands/AllBands';
import theme from './themes/material-ui-theme'
import { ThemeProvider } from '@mui/material/styles';
import SingleLineup from './pages/Lineup/Lineup';
import Festivals from './pages/Festivals/Festivals';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import EditProfile from './pages/EditProfile/EditProfile';
import Profile from './pages/Profile/Profile';
import ManageUsers from './pages/ManageUsers/ManageUsers';
import ManageFestivals from './pages/ManageFestivals/ManageFestivals';
import AddBand from './pages/AddBand/AddBand';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>
        <Header/>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/band/:id" element={<Band/>} />
          <Route path="/bands" element={<AllBands/>} />
          <Route path="/festivals" element={<Festivals />} />
          <Route path="/festivals/:slug" element={<SingleLineup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/bands/add" element={<AddBand />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/festivals" element={<ManageFestivals />} />
        </Routes>
        <Footer/>
      </div>
    </ThemeProvider>

    
  );
}

export default App;
