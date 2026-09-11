import React, { useEffect, useState } from 'react'
import {useLocation, Link} from 'react-router-dom'
import { FaCheckCircle, FaTimesCircle, FaDownload, FaClipboardList, FaHome } from 'react-icons/fa'
import moment from 'moment'
import { getBookingByConfirmationCode, downloadInvoice } from '../utils/ApiFunctions'

const BookingSuccess = () => {
    const location = useLocation()
    const message = location.state?.message
    const error = location.state?.error

    const [booking, setBooking] = useState(null)
    const [loadError, setLoadError] = useState("")
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadError, setDownloadError] = useState("")

    useEffect(() => {
        if (!message) return
        getBookingByConfirmationCode(message)
            .then((data) => setBooking(data))
            .catch((err) => setLoadError(err.message))
    }, [message])

    const nights = booking
        ? moment(booking.checkOutDate).diff(moment(booking.checkInDate), 'days')
        : 0
    // Same formula the backend uses (roomPrice x nights x rooms) -- shown here
    // purely for the guest's convenience; the authoritative total lives on
    // the invoice PDF, which is generated and priced entirely server-side.
    const estimatedTotal = booking
        ? nights * (booking.room?.roomPrice || 0) * (booking.numberOfRooms || 1)
        : 0

    const handleDownloadInvoice = async () => {
        if (!booking) return
        setIsDownloading(true)
        setDownloadError("")
        try {
            await downloadInvoice(booking.bookingId, booking.bookingConfirmationCode)
        } catch (err) {
            setDownloadError(err.message)
        }
        setIsDownloading(false)
    }

  return (
    <div className='container page-section text-center'>
        <div className='mx-auto' style={{maxWidth:'560px'}}>
            {message ? (
                <div className='tj-card p-5'>
                    <FaCheckCircle size={48} className='hotel-color mb-3'/>
                    <h3>Booking confirmed!</h3>
                    <p className='text-muted mb-1'>Thank you for choosing Taj Hotel.</p>
                    <p className='text-muted'>Booking confirmation</p>
                    <p className='room-price' style={{fontSize:'1.4rem'}}>{message}</p>

                    {loadError && <p className='text-danger small'>{loadError}</p>}

                    {booking && (
                        <div className='text-start mt-4' style={{fontSize:'0.95rem'}}>
                            <hr/>
                            <div className='d-flex justify-content-between py-1'>
                                <span className='text-muted'>Room</span>
                                <strong>{booking.room?.roomType}</strong>
                            </div>
                            <div className='d-flex justify-content-between py-1'>
                                <span className='text-muted'>Dates</span>
                                <strong>{moment(booking.checkInDate).format('DD MMM YYYY')} – {moment(booking.checkOutDate).format('DD MMM YYYY')}</strong>
                            </div>
                            <div className='d-flex justify-content-between py-1'>
                                <span className='text-muted'>Rooms</span>
                                <strong>{booking.numberOfRooms}</strong>
                            </div>
                            <div className='d-flex justify-content-between py-1'>
                                <span className='text-muted'>Guests</span>
                                <strong>{booking.totalNumOfGuest}</strong>
                            </div>
                            <div className='d-flex justify-content-between py-1'>
                                <span className='text-muted'>Total</span>
                                <strong>₹{estimatedTotal}</strong>
                            </div>
                            <div className='d-flex justify-content-between py-1'>
                                <span className='text-muted'>Status</span>
                                <strong>{booking.bookingStatus} · {booking.paymentStatus}</strong>
                            </div>
                            <hr/>
                        </div>
                    )}

                    {downloadError && <p className='text-danger small'>{downloadError}</p>}

                    <div className='d-flex flex-wrap justify-content-center gap-2 mt-3'>
                        {booking && (
                            <button className='btn btn-hotel d-flex align-items-center gap-2' onClick={handleDownloadInvoice} disabled={isDownloading}>
                                <FaDownload size={13}/> {isDownloading ? "Preparing…" : "Download invoice"}
                            </button>
                        )}
                        <Link to={"/my-bookings"} className='btn btn-hotel-outline d-flex align-items-center gap-2'>
                            <FaClipboardList size={13}/> View my bookings
                        </Link>
                        <Link to={"/"} className='btn btn-hotel-outline d-flex align-items-center gap-2'>
                            <FaHome size={13}/> Back to home
                        </Link>
                    </div>
                </div>
            ) : (
                <div className='tj-card p-5'>
                    <FaTimesCircle size={48} className='text-danger mb-3'/>
                    <h3 className='text-danger'>Error booking room</h3>
                    <p className='text-muted'>{error}</p>
                    <Link to={"/"} className='btn btn-hotel-outline mt-3'>Back to home</Link>
                </div>
            )}
        </div>
    </div>
  )
}

export default BookingSuccess
