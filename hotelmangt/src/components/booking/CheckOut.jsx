import React, { useState, useEffect } from 'react'
import BookingForm from './BookingForm'
import { getRoomById } from '../utils/ApiFunctions'
import { useParams } from 'react-router-dom';
import { FaParking, FaUtensils, FaWifi, FaCar, FaTshirt, FaTv, FaWineGlassAlt } from 'react-icons/fa';
import RoomCarousel from '../common/RoomCarousel';

const CheckOut = () => {

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [roomInfo, setRoomInfo] = useState({ photo: "", roomType: "", roomPrice: "" })

  const { roomId } = useParams()

  useEffect(() => {
    setTimeout(() => {
      getRoomById(roomId).then((response) => {
        setRoomInfo(response)
        setIsLoading(false)
      }).catch((error) => {
        setError(error)
        setIsLoading(false)
      })
    }, 500)

  }, [roomId])

  return (
    <div>
      <section className='container page-section--tight'>
        <div className='row g-4 align-items-start'>
          <div className='col-md-4'>
            {isLoading ? (
              <p className='text-muted'>Loading room information…</p>
            ) : error ? (
              <p className='text-danger'>{String(error)}</p>
            ) : (
              <div className='room-info-card'>
                <img
                  src={`data:image/png;base64,${roomInfo.photo}`}
                  alt={roomInfo.roomType || 'Room photo'}
                  className='room-info-img'
                />
                <div className='room-info-body'>
                  <h4 className='hotel-color mb-1'>{roomInfo.roomType}</h4>
                  <p className='room-price mb-3'>${roomInfo.roomPrice}<small>/night</small></p>
                  <h6 className='text-muted mb-2' style={{fontSize:'0.85rem', letterSpacing:'0.02em'}}>Included with this room</h6>
                  <ul className='service-list'>
                    <li><FaWifi/> WiFi</li>
                    <li><FaTv/> Streaming</li>
                    <li><FaUtensils/> Breakfast</li>
                    <li><FaWineGlassAlt/> Mini bar</li>
                    <li><FaCar/> Car service</li>
                    <li><FaParking/> Parking</li>
                    <li><FaTshirt/> Laundry</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className='col-md-8'>
            <BookingForm/>
          </div>
        </div>
      </section>
      <section className='page-section page-section--sage'>
        <RoomCarousel/>
      </section>
    </div>
  )
}

export default CheckOut
