import logo from './logo.svg';
import './App.css';
import AddRoom from "./components/room/AddRoom"
import ExistingRooms from './components/room/ExistingRooms';
import {BrowserRouter as  Router, Routes, Route} from 'react-router-dom';
import Home from './components/home/Home';
import EditRoom from './components/room/EditRoom';
import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';
import RoomListing from './components/room/RoomListing';
import Admin from './components/admin/Admin';
import BookingForm from './components/booking/BookingForm';
import BookingSuccess from './components/booking/BookingSuccess';
import CheckOut from './components/booking/CheckOut';
import Bookings from './components/booking/Bookings';
import FindBooking from './components/booking/FindBooking';
import Login from './components/auth/Login';
import Registration from './components/auth/Registration';
import Profile from './components/auth/Profile';
import Logout from './components/auth/Logout';
import {AuthProvider} from './components/auth/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <main>
        <Router>
          <NavBar/>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/edit-room/:roomId" element={<EditRoom/>}/>
            <Route path="/existing-room" element={<ExistingRooms/>}/>
             <Route path="/add-room" element={<AddRoom/>}/>
             <Route path="/book-room/:roomId" element={<CheckOut/>}/>
             <Route path="/browse-all-rooms" element={<RoomListing/>}/>
             <Route path="/admin" element={<Admin/>}/>
             <Route path="/booking-success" element={<BookingSuccess/>}></Route>
             <Route path="/existing-bookings" element={<Bookings/>}/>
             <Route path="/find-booking" element={<FindBooking/>}/>
             <Route path="/login" element={<Login/>}/>
             <Route path="/register" element={<Registration/>}/>
             <Route path="/profile" element={<Profile/>}/>
             <Route path="/logout" element={<Logout/>}/>
          </Routes>
        </Router>
        <Footer/>
      </main>
   
    </AuthProvider>
  );
}

export default App;
