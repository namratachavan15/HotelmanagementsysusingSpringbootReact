import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { FaTimes, FaDownload } from 'react-icons/fa'
import { getBookingDetails, downloadInvoice } from '../utils/ApiFunctions'
import { statusBadge, paymentBadge, formatMoney } from './bookingDisplay'

/**
 * Full booking-details view, opened from the "View Details" button on a
 * My Bookings card. Fetches the single booking fresh from the backend
 * (GET /bookings/{bookingId}) so the figures shown are always the
 * authoritative, backend-computed ones - never recalculated here.
 */
const BookingDetailsModal = ({ bookingId, onClose }) => {
	const [booking, setBooking] = useState(null)
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [isDownloading, setIsDownloading] = useState(false)
	const [downloadError, setDownloadError] = useState('')

	useEffect(() => {
		let isMounted = true
		setIsLoading(true)
		setError('')
		getBookingDetails(bookingId)
			.then((data) => {
				if (isMounted) setBooking(data)
			})
			.catch((err) => {
				if (isMounted) setError(err.message)
			})
			.finally(() => {
				if (isMounted) setIsLoading(false)
			})
		return () => {
			isMounted = false
		}
	}, [bookingId])

	const handleDownload = async () => {
		if (!booking) return
		setIsDownloading(true)
		setDownloadError('')
		try {
			await downloadInvoice(booking.bookingId, booking.bookingConfirmationCode)
		} catch (err) {
			setDownloadError(err.message)
		}
		setIsDownloading(false)
	}

	return (
		<div className='mb-modal-backdrop' onClick={onClose}>
			<div className='mb-modal' onClick={(e) => e.stopPropagation()} role='dialog' aria-modal='true'>
				<div className='mb-modal-header'>
					<h4 className='mb-0'>Booking details</h4>
					<button className='mb-modal-close' onClick={onClose} aria-label='Close'>
						<FaTimes />
					</button>
				</div>

				<div className='mb-modal-body'>
					{isLoading ? (
						<p className='text-muted text-center py-4'>Loading booking details…</p>
					) : error ? (
						<p className='text-danger text-center py-4'>{error}</p>
					) : booking ? (
						<>
							<div className='mb-detail-top'>
								<div>
									<span className='mb-detail-code'>{booking.bookingConfirmationCode}</span>
									<div className='d-flex gap-2 mt-2'>
										{statusBadge(booking.bookingStatus)}
										{paymentBadge(booking.paymentStatus)}
									</div>
								</div>
								<div className='text-end'>
									<div className='text-muted small'>Final total</div>
									<div className='mb-detail-total'>{formatMoney(booking.finalTotal)}</div>
								</div>
							</div>

							<div className='mb-detail-section'>
								<h6>Guest</h6>
								<div className='mb-detail-row'><span>Full name</span><strong>{booking.guestFullName}</strong></div>
								<div className='mb-detail-row'><span>Email</span><strong>{booking.guestEmail}</strong></div>
							</div>

							<div className='mb-detail-section'>
								<h6>Stay</h6>
								<div className='mb-detail-row'><span>Room type</span><strong>{booking.room?.roomType}</strong></div>
								<div className='mb-detail-row'><span>Check-in</span><strong>{moment(booking.checkInDate).format('DD MMM YYYY')}</strong></div>
								<div className='mb-detail-row'><span>Check-out</span><strong>{moment(booking.checkOutDate).format('DD MMM YYYY')}</strong></div>
								<div className='mb-detail-row'><span>Nights</span><strong>{booking.numberOfNights}</strong></div>
								<div className='mb-detail-row'><span>Rooms</span><strong>{booking.numberOfRooms}</strong></div>
								<div className='mb-detail-row'><span>Adults</span><strong>{booking.numOfAdults}</strong></div>
								<div className='mb-detail-row'><span>Children</span><strong>{booking.numOfChildren}</strong></div>
								<div className='mb-detail-row'><span>Total guests</span><strong>{booking.totalNumOfGuest}</strong></div>
							</div>

							<div className='mb-detail-section'>
								<h6>Price</h6>
								<div className='mb-detail-row'><span>Room price / night</span><strong>{formatMoney(booking.roomPricePerNight)}</strong></div>
								<div className='mb-detail-row'><span>Rooms × nights</span><strong>{booking.numberOfRooms} × {booking.numberOfNights}</strong></div>
								<div className='mb-detail-row'><span>Subtotal</span><strong>{formatMoney(booking.subtotal)}</strong></div>
								{Number(booking.discount) > 0 && (
									<div className='mb-detail-row'><span>Discount</span><strong>- {formatMoney(booking.discount)}</strong></div>
								)}
								<div className='mb-detail-row'><span>Tax</span><strong>{formatMoney(booking.tax)}</strong></div>
								<div className='mb-detail-row mb-detail-row--total'><span>Final total</span><strong>{formatMoney(booking.finalTotal)}</strong></div>
							</div>

							<div className='mb-detail-section'>
								<h6>Booking</h6>
								<div className='mb-detail-row'><span>Confirmation code</span><strong>{booking.bookingConfirmationCode}</strong></div>
								<div className='mb-detail-row'><span>Booking status</span><strong>{booking.bookingStatus}</strong></div>
								<div className='mb-detail-row'><span>Payment status</span><strong>{booking.paymentStatus}</strong></div>
								<div className='mb-detail-row'>
									<span>Booking date</span>
									<strong>{booking.bookingDate ? moment(booking.bookingDate).format('DD MMM YYYY, h:mm A') : '—'}</strong>
								</div>
							</div>

							{downloadError && <p className='text-danger small mt-2'>{downloadError}</p>}

							<div className='d-flex justify-content-end mt-3'>
								<button className='btn btn-hotel d-flex align-items-center gap-2' disabled={isDownloading} onClick={handleDownload}>
									<FaDownload size={13} /> {isDownloading ? 'Preparing…' : 'Download invoice'}
								</button>
							</div>
						</>
					) : null}
				</div>
			</div>

			<style>{`
				.mb-modal-backdrop {
					position: fixed;
					inset: 0;
					background: rgba(20, 40, 42, 0.55);
					backdrop-filter: blur(2px);
					z-index: 1050;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 1rem;
				}
				.mb-modal {
					background: var(--color-white);
					border-radius: var(--radius-md);
					box-shadow: var(--shadow-lift);
					width: 100%;
					max-width: 560px;
					max-height: 88vh;
					overflow-y: auto;
				}
				.mb-modal-header {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 1.1rem 1.4rem;
					border-bottom: 1px solid var(--color-line);
					position: sticky;
					top: 0;
					background: var(--color-white);
					z-index: 1;
				}
				.mb-modal-header h4 { font-family: var(--font-display); color: var(--color-ink); }
				.mb-modal-close {
					background: var(--color-cream-deep);
					border: none;
					width: 32px;
					height: 32px;
					border-radius: 50%;
					color: var(--color-ink);
					display: flex;
					align-items: center;
					justify-content: center;
					transition: background .2s ease;
				}
				.mb-modal-close:hover { background: var(--color-line); }
				.mb-modal-body { padding: 1.4rem; }
				.mb-detail-top {
					display: flex;
					justify-content: space-between;
					align-items: flex-start;
					margin-bottom: 1.2rem;
				}
				.mb-detail-code {
					font-family: monospace;
					background: var(--color-sage);
					padding: 0.25rem 0.6rem;
					border-radius: 6px;
					color: var(--color-ink-soft);
					font-size: 0.9rem;
				}
				.mb-detail-total {
					font-family: var(--font-display);
					font-weight: 600;
					font-size: 1.3rem;
					color: var(--color-maroon);
				}
				.mb-detail-section { margin-bottom: 1.1rem; }
				.mb-detail-section h6 {
					text-transform: uppercase;
					letter-spacing: 0.05em;
					font-size: 0.75rem;
					color: var(--color-text-muted);
					font-family: var(--font-body);
					font-weight: 600;
					margin-bottom: 0.5rem;
					border-bottom: 1px solid var(--color-line);
					padding-bottom: 0.35rem;
				}
				.mb-detail-row {
					display: flex;
					justify-content: space-between;
					padding: 0.3rem 0;
					font-size: 0.92rem;
					color: var(--color-text);
				}
				.mb-detail-row span { color: var(--color-text-muted); }
				.mb-detail-row--total {
					border-top: 1px dashed var(--color-line);
					margin-top: 0.3rem;
					padding-top: 0.5rem;
					font-size: 1rem;
				}
				.mb-detail-row--total strong { color: var(--color-maroon); }
			`}</style>
		</div>
	)
}

export default BookingDetailsModal
