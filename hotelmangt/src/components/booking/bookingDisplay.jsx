import React from 'react'
import moment from 'moment'

/**
 * Shared helpers for anything that displays a BookingResponse (My Bookings,
 * the booking details modal, and the admin bookings table) so status badge
 * colours/labels and the money format stay identical everywhere instead of
 * being reimplemented per component.
 */

export const BOOKING_STATUS_LABELS = {
	PENDING: 'Pending',
	CONFIRMED: 'Confirmed',
	CHECKED_IN: 'Checked-in',
	CHECKED_OUT: 'Completed',
	CANCELLED: 'Cancelled'
}

export const PAYMENT_STATUS_LABELS = {
	PENDING: 'Pending',
	PAID: 'Paid',
	FAILED: 'Failed',
	REFUNDED: 'Refunded'
}

export function formatMoney(amount) {
	const value = Number(amount)
	if (Number.isNaN(value)) return '—'
	return '\u20B9' + value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Which of the "My Bookings" tabs a booking belongs to, derived purely from
 * data the backend already sends - CANCELLED/CHECKED_OUT map directly, and
 * anything else is Upcoming unless its checkout date has already passed
 * (in which case it reads as Completed even though no admin ever flipped it
 * to CHECKED_OUT). A cancelled booking always stays in the Cancelled bucket,
 * regardless of its dates.
 */
export function deriveBucket(booking) {
	if (booking.bookingStatus === 'CANCELLED') return 'CANCELLED'
	if (booking.bookingStatus === 'CHECKED_OUT') return 'COMPLETED'
	const today = moment().startOf('day')
	const checkOut = moment(booking.checkOutDate)
	if (checkOut.isBefore(today)) return 'COMPLETED'
	return 'UPCOMING'
}

export function canCancel(booking) {
	return booking.bookingStatus !== 'CANCELLED' && booking.bookingStatus !== 'CHECKED_OUT'
}

/* An invoice is meaningful once a payment has actually gone through - shown
   for PAID and REFUNDED bookings (a refunded booking's invoice/receipt is
   still worth keeping), hidden while a booking is still PENDING/FAILED. */
export function canDownloadInvoice(booking) {
	return booking.paymentStatus === 'PAID' || booking.paymentStatus === 'REFUNDED'
}

const STATUS_BADGE_STYLE = {
	PENDING: { bg: '#FCF3D9', color: '#8A6D1D', border: '#E4C766' },
	CONFIRMED: { bg: '#E4EEE7', color: '#1F4B43', border: '#8FB9A8' },
	CHECKED_IN: { bg: '#E4EEE7', color: '#1F4B43', border: '#8FB9A8' },
	CHECKED_OUT: { bg: '#EAF0FF', color: '#33477A', border: '#AFC0EE' },
	CANCELLED: { bg: '#F6E7E6', color: '#7A2E2A', border: '#D9AEAC' }
}

const PAYMENT_BADGE_STYLE = {
	PENDING: { bg: '#FCF3D9', color: '#8A6D1D', border: '#E4C766' },
	PAID: { bg: '#E4EEE7', color: '#1F4B43', border: '#8FB9A8' },
	FAILED: { bg: '#F6E7E6', color: '#7A2E2A', border: '#D9AEAC' },
	REFUNDED: { bg: '#EEE9F6', color: '#4B3A7A', border: '#C6B7E8' }
}

function badge(label, style) {
	return (
		<span
			className='tj-status-badge'
			style={{
				backgroundColor: style.bg,
				color: style.color,
				borderColor: style.border
			}}
		>
			{label}
		</span>
	)
}

export function statusBadge(bookingStatus) {
	const style = STATUS_BADGE_STYLE[bookingStatus] || STATUS_BADGE_STYLE.PENDING
	return badge(BOOKING_STATUS_LABELS[bookingStatus] || bookingStatus, style)
}

export function paymentBadge(paymentStatus) {
	const style = PAYMENT_BADGE_STYLE[paymentStatus] || PAYMENT_BADGE_STYLE.PENDING
	return badge(PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus, style)
}
