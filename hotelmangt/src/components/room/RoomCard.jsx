import React from 'react'
import { Col } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'
import moment from 'moment'
import { goToBookRoom } from '../utils/authGuard'

const RoomCard = ({room, checkInDate, checkOutDate}) => {
  const navigate = useNavigate()

  // Availability only means something relative to a date range -- with no
  // dates chosen yet, "available" for TODAY would be misleading (it could
  // read very differently for other date ranges), so show the fixed
  // inventory count instead and ask the guest to pick dates.
  const hasDates = Boolean(checkInDate && checkOutDate)

  return (
    <Col key={room.id} md={6} lg={4}>
      <div className='tj-card h-100 d-flex flex-column'>
        <Link to={`/book-room/${room.id}`} onClick={(e) => goToBookRoom(e, navigate, room.id)} className='room-img-wrap' style={{height:'190px'}}>
          <img src={`data:image/png;base64,${room.photo}`} alt={room.roomType || 'Room photo'} />
        </Link>
        <div className='p-3 d-flex flex-column flex-grow-1'>
          <div className='d-flex justify-content-between align-items-start mb-1'>
            <h5 className='hotel-color mb-0'>{room.roomType}</h5>
            <p className='room-price mb-0'>${room.roomPrice}<small>/night</small></p>
          </div>
          <p className='text-muted small mb-3'>Comfortable, well-appointed room with everything you need for a relaxed stay.</p>
          {hasDates ? (
            typeof room.availableRooms === "number" && (
              <p className='text-muted small mb-3' style={{marginTop:'-0.5rem'}}>
                {room.availableRooms > 0
                  ? `${room.availableRooms} room${room.availableRooms===1?"":"s"} available`
                  : "No rooms available"}
                <span className='d-block' style={{fontSize:'0.75rem'}}>
                  For {moment(checkInDate).format('MMM D')} – {moment(checkOutDate).format('MMM D')}
                </span>
              </p>
            )
          ) : (
            typeof room.totalRooms === "number" && (
              <p className='text-muted small mb-3' style={{marginTop:'-0.5rem'}}>
                {room.totalRooms} total room{room.totalRooms===1?"":"s"}
                <span className='d-block' style={{fontSize:'0.75rem'}}>Select dates to check availability</span>
              </p>
            )
          )}
          <Link to={`/book-room/${room.id}`} onClick={(e) => goToBookRoom(e, navigate, room.id)} className='btn btn-hotel btn-sm mt-auto align-self-start d-flex align-items-center gap-2'>
            Book now <FaArrowRight size={12}/>
          </Link>
        </div>
      </div>
    </Col>
  )
}

export default RoomCard

