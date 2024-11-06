import React, { useState,useEffect } from 'react'
import BookingForm from './BookingForm'
import { getRoomById } from '../utils/ApiFunctions'
import { useParams} from 'react-router-dom';
import { FaParking, FaUtensils, FaWifi,FaCar,FaTshirt,FaTv, FaWineGlassAlt } from 'react-icons/fa';
import RoomCarousel from '../common/RoomCarousel';

const CheckOut = () => {
 
  const [error,setError]=useState("")
  const[isLoading,setIsLoaading]=useState(true)
  const[roomInfo,setRoomInfo]=useState({photo:"",roomType:"",roomPrice:""})

  const {roomId}=useParams()

   useEffect(() => {
    setTimeout(()=>{
      getRoomById(roomId).then((response)=>{
        setRoomInfo(response)
        setIsLoaading(false)
      }).catch((error)=>{
        setError(error)
        setIsLoaading(false)
      })
    },2000)

   },[roomId])

  return (

    <div>
      <section className='container'>
      <div className='row d-flex align-items-center'>
      <div className='col-md-3 mt-5 mb-5'>
        {isLoading?(
          <p>Loading room information</p>
        ):error?(
          <p>{error}</p>
        ):(
          <div className='room-info'>
            <img 
            src={`data:image/png;base64,${roomInfo.photo}`}
            alt="Room Photo"
            style={{width:"100%",height:"200%"}}
            >
            </img>
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <th>Room Type:</th>
                  <th>{roomInfo.roomType}</th>
                </tr>
                <tr>
                  <th>Room Price:</th>
                  <th>{roomInfo.roomPrice}</th>
                </tr>
                <tr>
                  <th>Room Service:</th>
                  
                  <td>
                    <ul className='list-unstyled'>
                      <li><FaWifi/> WiFi</li>
                      <li><FaTv/>Netfilx Premium</li>
                      <li><FaUtensils/>Breakfast</li>
                      <li><FaWineGlassAlt/>Mini bar refreshment</li>
                      <li><FaCar/>Car Service</li>
                      <li><FaParking/>Parking Space</li>

                      <li><FaTshirt/>Laundry</li>
                    </ul>
                  </td>
                  
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className='col-md-9'>
      <BookingForm/>
      </div> 
      </div>
      </section>
      <div className='container'>
        <RoomCarousel/>
      </div>
    </div>
  )
}

export default CheckOut
