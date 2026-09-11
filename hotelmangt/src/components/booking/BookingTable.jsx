import { parseISO } from 'date-fns'
import React, { useState } from 'react'
import { useEffect } from 'react'
import DateSlider from '../common/DateSlider'
import { statusBadge, canCancel } from './bookingDisplay'

const BookingTable = ({bookingInfo,handleBookingCancellation}) => {
    const[filteredBookings,setFilteredBookings]=useState(bookingInfo)

    const filterBookings=(startDate,endDate)=>{
        let filtered=bookingInfo
        if(startDate && endDate){
            filtered=bookingInfo.filter((booking)=>{
                const bookingStartDate=parseISO(booking.checkInDate)
                const bookingEndDate=parseISO(booking.checkOutDate)
                return  bookingStartDate >= startDate && bookingEndDate <= endDate && bookingEndDate>startDate
            })
        }
        setFilteredBookings(filtered)
    }

    useEffect(()=>{
        setFilteredBookings(bookingInfo)
    },[bookingInfo])

    const rowNumberBadge = (n) => (
        <span className='count-badge count-badge--index'>{n}</span>
    );

  return (
    <section className='mt-4'>
        <style>{`
            .booking-table-card {
                background: var(--color-white);
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-soft);
                border: 1px solid var(--color-line);
                overflow: hidden;
                margin-top: 1rem;
            }
            .booking-table-card table.table-hotel thead th {
                background: var(--color-ink);
                color: var(--color-cream);
                font-family: var(--font-display);
                letter-spacing: 0.04em;
                text-transform: uppercase;
                font-size: 0.74rem;
                border: none;
                padding: 0.85rem 0.6rem;
                white-space: nowrap;
            }
            .booking-table-card table.table-hotel tbody tr:nth-child(even) {
                background-color: var(--color-cream);
            }
            .booking-table-card table.table-hotel tbody tr:hover {
                background-color: var(--color-sage);
            }
            .booking-table-card table.table-hotel td {
                padding: 0.75rem 0.6rem;
                border-color: var(--color-line);
                color: var(--color-text);
                vertical-align: middle;
            }
            .count-badge--index {
                display: inline-block;
                min-width: 1.8rem;
                padding: 0.15rem 0.5rem;
                border-radius: 999px;
                background: var(--color-cream-deep);
                color: var(--color-ink);
                font-weight: 600;
                font-size: 0.8rem;
            }
            .confirmation-code {
                font-family: monospace;
                background: var(--color-sage);
                padding: 0.2rem 0.5rem;
                border-radius: 6px;
                font-size: 0.82rem;
                color: var(--color-ink-soft);
            }
            .guest-email-muted {
                color: var(--color-text-muted);
                font-size: 0.85rem;
            }
        `}</style>
        <DateSlider onDateChange={filterBookings} onFilterChange={filterBookings}/>
        <div className='booking-table-card'>
        <div className='table-responsive mb-0'>
        <table className='table table-hotel table-hover align-middle mb-0'>
            <thead>
                <tr>
                    <th>S/N</th>
                    <th>Booking ID</th>
                    <th>Room ID</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Rooms</th>
                    <th>Guest name</th>
                    <th>Guest email</th>
                    <th>Adults</th>
                    <th>Children</th>
                    <th>Total guests</th>
                    <th>Confirmation code</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody className='text-center'>
            {filteredBookings.map((booking,index)=>(
                <tr key={booking.bookingId}>
                    <td>{rowNumberBadge(index+1)}</td>
                    <td style={{fontWeight:600, color:'var(--color-maroon)'}}>{booking.bookingId}</td>
                    <td>{booking.room.id}</td>
                    <td>{booking.checkInDate}</td>
                    <td>{booking.checkOutDate}</td>
                    <td>{booking.numberOfRooms}</td>
                    <td className='text-start'>{booking.guestFullName}</td>
                    <td className='text-start guest-email-muted'>{booking.guestEmail}</td>
                    <td>{booking.numOfAdults}</td>
                    <td>{booking.numOfChildren}</td>
                    <td>{booking.totalNumOfGuest}</td>
                    <td><span className='confirmation-code'>{booking.bookingConfirmationCode}</span></td>
                    <td>{statusBadge(booking.bookingStatus)}</td>
                    <td>
                        {canCancel(booking) ? (
                            <button className='btn btn-outline-danger btn-sm' onClick={()=>handleBookingCancellation(booking.bookingId)}>
                                Cancel
                            </button>
                        ) : (
                            <button className='btn btn-outline-secondary btn-sm' disabled>
                                Cancel
                            </button>
                        )}
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
        </div>
        {filteredBookings.length===0 && <p className='text-muted text-center mt-3'>No booking found for selected dates</p>}
    </section>
  )
}

export default BookingTable
