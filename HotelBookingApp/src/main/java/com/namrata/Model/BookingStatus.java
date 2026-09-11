package com.namrata.Model;

/**
 * Lifecycle of a single booking record. A brand new booking starts as
 * PENDING and only becomes CONFIRMED once its linked payment is verified as
 * PAID (see PaymentService#attachBookingConfirmation) - this is what stops a
 * failed/abandoned payment from ever looking like a confirmed reservation.
 */
public enum BookingStatus {
	PENDING,
	CONFIRMED,
	CHECKED_IN,
	CHECKED_OUT,
	CANCELLED
}
