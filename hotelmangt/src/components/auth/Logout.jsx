import React, { useContext } from "react"
import { AuthContext } from './AuthProvider'
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';

const Logout = () => {
  
    const auth=useContext(AuthContext)
    const navigate=useNavigate()

    const handleLogout=()=>{
        auth.handleLogout()
      //  window.location.reload()
        navigate("/",{state:{message:"You have been logged out"}})

    }

    return (
        <>
        <li>
            <Link className="dropdown-item" to={"/profile"}>
                <FaUser size={13}/> Profile
            </Link>
        </li>
        <li>
            <Link className="dropdown-item" to={"/my-bookings"}>
                <FaClipboardList size={13}/> My Bookings
            </Link>
        </li>
        <li>
            <hr className="dropdown-divider" />
        </li>
        <button className="dropdown-item" onClick={handleLogout}>
            <FaSignOutAlt size={13}/> Logout
        </button>
    </>
)
}

export default Logout