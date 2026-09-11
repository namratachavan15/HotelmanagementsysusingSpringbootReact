import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import {
	FaClipboardList,
	FaDownload,
	FaEye,
	FaBan,
	FaBed,
	FaCalendarCheck,
	FaCalendarTimes,
	FaUsers,
	FaHashtag,
	FaHotel
} from 'react-icons/fa'
import { getMyBookings, cancelBooking, downloadInvoice } from '../utils/ApiFunctions'
import {
	statusBadge,
	paymentBadge,
	formatMoney,
	deriveBucket,
	canCancel,
	canDownloadInvoice
} from './bookingDisplay'
import BookingDetailsModal from './BookingDetailsModal'

const TABS = [
	{ key: 'ALL', label: 'All' },
	{ key: 'UPCOMING', label: 'Upcoming' },
	{ key: 'COMPLETED', label: 'Completed' },
	{ key: 'CANCELLED', label: 'Cancelled' },
	{ key: 'CONFIRMED', label: 'Confirmed' },
	{ key: 'PENDING', label: 'Pending' }
]

const matchesTab = (booking, tabKey) => {
	if (tabKey === 'ALL') return true
	if (tabKey === 'CONFIRMED') return booking.bookingStatus === 'CONFIRMED'
	if (tabKey === 'PENDING') return booking.bookingStatus === 'PENDING'
	return deriveBucket(booking) === tabKey
}

const MyBookings = () => {
	const [bookings, setBookings] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [loadError, setLoadError] = useState('')

	const [activeTab, setActiveTab] = useState('ALL')

	const [cancelTarget, setCancelTarget] = useState(null)
	const [isCancelling, setIsCancelling] = useState(false)
	const [cancelError, setCancelError] = useState('')
	const [successMessage, setSuccessMessage] = useState('')

	const [downloadingId, setDownloadingId] = useState(null)
	const [downloadError, setDownloadError] = useState('')

	const [detailsBookingId, setDetailsBookingId] = useState(null)

	const fetchBookings = useCallback(() => {
		setIsLoading(true)
		setLoadError('')
		return getMyBookings()
			.then((data) => setBookings(data))
			.catch((err) => setLoadError(err.message))
			.finally(() => setIsLoading(false))
	}, [])

	useEffect(() => {
		fetchBookings()
	}, [fetchBookings])

	const summary = useMemo(() => {
		const counts = { total: bookings.length, upcoming: 0, completed: 0, cancelled: 0 }
		bookings.forEach((b) => {
			const bucket = deriveBucket(b)
			if (bucket === 'UPCOMING') counts.upcoming += 1
			else if (bucket === 'COMPLETED') counts.completed += 1
			else if (bucket === 'CANCELLED') counts.cancelled += 1
		})
		return counts
	}, [bookings])

	const filteredBookings = useMemo(
		() => bookings.filter((b) => matchesTab(b, activeTab)),
		[bookings, activeTab]
	)

	const handleDownloadInvoice = async (booking) => {
		setDownloadError('')
		setDownloadingId(booking.bookingId)
		try {
			await downloadInvoice(booking.bookingId, booking.bookingConfirmationCode)
		} catch (err) {
			setDownloadError(err.message)
		}
		setDownloadingId(null)
	}

	const openCancelConfirm = (booking) => {
		setCancelError('')
		setCancelTarget(booking)
	}

	const closeCancelConfirm = () => {
		if (isCancelling) return
		setCancelTarget(null)
	}

	const confirmCancel = async () => {
		if (!cancelTarget) return
		setIsCancelling(true)
		setCancelError('')
		try {
			await cancelBooking(cancelTarget.bookingId)
			setSuccessMessage(`Booking ${cancelTarget.bookingConfirmationCode} has been cancelled.`)
			setCancelTarget(null)
			await fetchBookings()
		} catch (err) {
			setCancelError(err.message)
		}
		setIsCancelling(false)
	}

	return (
		<div className='container page-section--tight mb-page'>
			<style>{`
				.mb-page .mb-hero {
					display: flex;
					align-items: center;
					gap: 1rem;
					margin-bottom: 2rem;
				}
				.mb-page .mb-hero h2 { margin-bottom: 0.2rem; }
				.mb-summary-grid {
					display: grid;
					grid-template-columns: repeat(4, 1fr);
					gap: 1rem;
					margin-bottom: 1.75rem;
				}
				@media (max-width: 768px) {
					.mb-summary-grid { grid-template-columns: repeat(2, 1fr); }
				}
				.mb-summary-card {
					background: var(--color-white);
					border: 1px solid var(--color-line);
					border-radius: var(--radius-md);
					padding: 1.1rem 1.3rem;
					text-align: center;
					transition: transform .25s var(--ease), box-shadow .25s var(--ease);
				}
				.mb-summary-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-soft); }
				.mb-summary-card .mb-summary-value {
					font-family: var(--font-display);
					font-size: 1.9rem;
					font-weight: 600;
					color: var(--color-maroon);
					line-height: 1.1;
				}
				.mb-summary-card .mb-summary-label {
					font-size: 0.8rem;
					color: var(--color-text-muted);
					margin-top: 0.25rem;
				}
				.mb-tabs {
					display: flex;
					flex-wrap: wrap;
					gap: 0.5rem;
					margin-bottom: 1.5rem;
				}
				.mb-tab {
					border: 1.5px solid var(--color-line);
					background: var(--color-white);
					color: var(--color-ink);
					padding: 0.42rem 1.1rem;
					border-radius: 999px;
					font-size: 0.85rem;
					font-weight: 500;
					transition: all .2s var(--ease);
				}
				.mb-tab:hover { border-color: var(--color-gold); }
				.mb-tab--active {
					background: var(--color-maroon);
					border-color: var(--color-maroon);
					color: var(--color-white);
				}
				.mb-cards-grid {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
					gap: 1.25rem;
				}
				.mb-card {
					background: var(--color-white);
					border: 1px solid var(--color-line);
					border-radius: var(--radius-md);
					padding: 1.2rem 1.3rem;
					display: flex;
					flex-direction: column;
					gap: 0.7rem;
					transition: transform .3s var(--ease), box-shadow .3s var(--ease);
				}
				.mb-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
				.mb-card-top {
					display: flex;
					justify-content: space-between;
					align-items: flex-start;
					gap: 0.5rem;
				}
				.mb-card-room {
					font-family: var(--font-display);
					font-size: 1.15rem;
					color: var(--color-ink);
					margin: 0;
				}
				.mb-card-code {
					font-family: monospace;
					font-size: 0.78rem;
					color: var(--color-ink-soft);
					background: var(--color-sage);
					padding: 0.15rem 0.5rem;
					border-radius: 6px;
					display: inline-block;
					margin-top: 0.3rem;
				}
				.mb-card-badges { display: flex; flex-direction: column; gap: 0.35rem; align-items: flex-end; }
				.mb-card-grid {
					display: grid;
					grid-template-columns: repeat(2, 1fr);
					gap: 0.5rem 1rem;
					font-size: 0.85rem;
					padding: 0.6rem 0;
					border-top: 1px dashed var(--color-line);
					border-bottom: 1px dashed var(--color-line);
				}
				.mb-card-grid .mb-field-label {
					display: flex;
					align-items: center;
					gap: 0.35rem;
					color: var(--color-text-muted);
					font-size: 0.72rem;
					text-transform: uppercase;
					letter-spacing: 0.03em;
				}
				.mb-card-grid .mb-field-value { font-weight: 600; color: var(--color-text); }
				.mb-card-price-row {
					display: flex;
					justify-content: space-between;
					align-items: baseline;
				}
				.mb-card-price-row .mb-price-label { font-size: 0.8rem; color: var(--color-text-muted); }
				.mb-card-price-row .mb-price-value {
					font-family: var(--font-display);
					font-weight: 600;
					font-size: 1.25rem;
					color: var(--color-maroon);
				}
				.mb-card-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.2rem; }
				.mb-empty {
					text-align: center;
					padding: 3.5rem 1rem;
					background: var(--color-white);
					border: 1px dashed var(--color-line);
					border-radius: var(--radius-md);
				}
				.mb-confirm-backdrop {
					position: fixed;
					inset: 0;
					background: rgba(20,40,42,0.55);
					z-index: 1060;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 1rem;
				}
				.mb-confirm-box {
					background: var(--color-white);
					border-radius: var(--radius-md);
					box-shadow: var(--shadow-lift);
					padding: 1.6rem;
					max-width: 420px;
					width: 100%;
					text-align: center;
				}
			`}</style>

			<div className='mb-hero'>
				<FaClipboardList size={32} className='hotel-color' />
				<div>
					<h2>My Bookings</h2>
					<p className='text-muted mb-0'>Manage your stays in one place</p>
				</div>
			</div>

			{successMessage && (
				<div className='alert alert-success' role='alert'>
					{successMessage}
				</div>
			)}
			{downloadError && (
				<div className='alert alert-danger' role='alert'>
					{downloadError}
				</div>
			)}

			<div className='mb-summary-grid'>
				<div className='mb-summary-card'>
					<div className='mb-summary-value'>{summary.total}</div>
					<div className='mb-summary-label'>Total bookings</div>
				</div>
				<div className='mb-summary-card'>
					<div className='mb-summary-value'>{summary.upcoming}</div>
					<div className='mb-summary-label'>Upcoming</div>
				</div>
				<div className='mb-summary-card'>
					<div className='mb-summary-value'>{summary.completed}</div>
					<div className='mb-summary-label'>Completed</div>
				</div>
				<div className='mb-summary-card'>
					<div className='mb-summary-value'>{summary.cancelled}</div>
					<div className='mb-summary-label'>Cancelled</div>
				</div>
			</div>

			<div className='mb-tabs'>
				{TABS.map((tab) => (
					<button
						key={tab.key}
						className={`mb-tab ${activeTab === tab.key ? 'mb-tab--active' : ''}`}
						onClick={() => setActiveTab(tab.key)}
					>
						{tab.label}
					</button>
				))}
			</div>

			{isLoading ? (
				<p className='text-muted text-center py-5'>Loading your bookings…</p>
			) : loadError ? (
				<p className='text-danger text-center py-5'>{loadError}</p>
			) : bookings.length === 0 ? (
				<div className='mb-empty'>
					<FaHotel size={40} className='hotel-color mb-3' />
					<h4>No bookings yet</h4>
					<p className='text-muted'>You haven't made any reservations with us yet.</p>
					<Link to='/browse-all-rooms' className='btn btn-hotel mt-2'>Browse Rooms</Link>
				</div>
			) : filteredBookings.length === 0 ? (
				<p className='text-muted text-center py-5'>No bookings in this category.</p>
			) : (
				<div className='mb-cards-grid'>
					{filteredBookings.map((booking) => (
						<div className='mb-card' key={booking.bookingId}>
							<div className='mb-card-top'>
								<div>
									<h5 className='mb-card-room'>{booking.room?.roomType}</h5>
									<span className='mb-card-code'>{booking.bookingConfirmationCode}</span>
								</div>
								<div className='mb-card-badges'>
									{statusBadge(booking.bookingStatus)}
									{paymentBadge(booking.paymentStatus)}
								</div>
							</div>

							<div className='mb-card-grid'>
								<div>
									<div className='mb-field-label'><FaCalendarCheck size={11} /> Check-in</div>
									<div className='mb-field-value'>{moment(booking.checkInDate).format('DD MMM YYYY')}</div>
								</div>
								<div>
									<div className='mb-field-label'><FaCalendarTimes size={11} /> Check-out</div>
									<div className='mb-field-value'>{moment(booking.checkOutDate).format('DD MMM YYYY')}</div>
								</div>
								<div>
									<div className='mb-field-label'><FaBed size={11} /> Rooms / Nights</div>
									<div className='mb-field-value'>{booking.numberOfRooms} room{booking.numberOfRooms > 1 ? 's' : ''} · {booking.numberOfNights} night{booking.numberOfNights > 1 ? 's' : ''}</div>
								</div>
								<div>
									<div className='mb-field-label'><FaUsers size={11} /> Guests</div>
									<div className='mb-field-value'>{booking.totalNumOfGuest} ({booking.numOfAdults}A, {booking.numOfChildren}C)</div>
								</div>
								{booking.bookingDate && (
									<div>
										<div className='mb-field-label'><FaHashtag size={11} /> Booked on</div>
										<div className='mb-field-value'>{moment(booking.bookingDate).format('DD MMM YYYY')}</div>
									</div>
								)}
							</div>

							<div className='mb-card-price-row'>
								<div>
									<div className='mb-price-label'>{formatMoney(booking.roomPricePerNight)} / night</div>
								</div>
								<div className='mb-price-value'>{formatMoney(booking.finalTotal)}</div>
							</div>

							<div className='mb-card-actions'>
								<button className='btn btn-hotel-outline btn-sm d-flex align-items-center gap-2' onClick={() => setDetailsBookingId(booking.bookingId)}>
									<FaEye size={12} /> View details
								</button>

								{canDownloadInvoice(booking) && (
									<button
										className='btn btn-hotel-outline btn-sm d-flex align-items-center gap-2'
										disabled={downloadingId === booking.bookingId}
										onClick={() => handleDownloadInvoice(booking)}
									>
										<FaDownload size={12} /> {downloadingId === booking.bookingId ? 'Preparing…' : 'Download invoice'}
									</button>
								)}

								{canCancel(booking) && (
									<button className='btn btn-outline-danger btn-sm d-flex align-items-center gap-2' onClick={() => openCancelConfirm(booking)}>
										<FaBan size={12} /> Cancel booking
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{cancelTarget && (
				<div className='mb-confirm-backdrop' onClick={closeCancelConfirm}>
					<div className='mb-confirm-box' onClick={(e) => e.stopPropagation()}>
						<FaBan size={30} className='text-danger mb-2' />
						<h5>Cancel this booking?</h5>
						<p className='text-muted'>
							Are you sure you want to cancel booking <strong>{cancelTarget.bookingConfirmationCode}</strong>?
							This cannot be undone.
						</p>
						{cancelError && <p className='text-danger small'>{cancelError}</p>}
						<div className='d-flex justify-content-center gap-2 mt-3'>
							<button className='btn btn-hotel-outline' disabled={isCancelling} onClick={closeCancelConfirm}>
								Keep booking
							</button>
							<button className='btn btn-danger' disabled={isCancelling} onClick={confirmCancel}>
								{isCancelling ? 'Cancelling…' : 'Yes, cancel it'}
							</button>
						</div>
					</div>
				</div>
			)}

			{detailsBookingId && (
				<BookingDetailsModal bookingId={detailsBookingId} onClose={() => setDetailsBookingId(null)} />
			)}
		</div>
	)
}

export default MyBookings
