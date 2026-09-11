import React, { useState } from 'react'
import { useEffect } from 'react'
import { cancelBooking, getAllBookings } from '../utils/ApiFunctions'
import BookingTable from './BookingTable'
import { FaClipboardList } from 'react-icons/fa'

const Bookings = () => {
  const[bookingInfo,setBookingInfo]=useState([])
  const[isLoading,setIsLoading]=useState(true)
  const[error,setError]=useState("")

  useEffect(()=>{
    setTimeout(()=>{
      getAllBookings().then((data)=>{
        setBookingInfo(data)
        setIsLoading(false)
      }).catch((error)=>{
        setError(error.message)
        setIsLoading(false)
      })
    },500)
  },[])

  const handleBookingCancellation=async(bookingId)=>{
    try{
        await cancelBooking(bookingId)
        const data=await getAllBookings()
        setBookingInfo(data)
    }
    catch(error)
    {
      setError(error.message)
    }
  }

  return (
    <section className='container page-section--tight'>
      <div className='admin-hero d-flex align-items-center gap-3'>
        <FaClipboardList size={30} style={{color:'#E4C766'}}/>
        <div>
          <h2 className='mb-1' style={{fontFamily:'var(--font-display)', color:'whitesmoke'}}>Existing bookings</h2>
          <p className='mb-0' style={{color:'var(--color-text-muted)'}}>View, filter by date, and cancel reservations.</p>
        </div>
      </div>
      {error && (<div className='alert alert-danger mt-3'>{error}</div>)}
      {isLoading ? (<p className='text-muted mt-3'>Loading existing bookings…</p>):(
        <BookingTable  bookingInfo={bookingInfo} handleBookingCancellation={handleBookingCancellation}/>
      )}
    </section>
  )
}

export default Bookings
