package com.namrata.Service;

import java.util.List;

import com.namrata.Model.BookedRoom;

public interface IBookingService {

	/**
	 * Soft-cancels a booking: flips its status to CANCELLED (never deletes the
	 * row, so invoice/history stays intact) and returns the updated booking.
	 * Throws InvalidBookingRequestException if the booking is already
	 * CANCELLED or CHECKED_OUT (completed) - those can't be cancelled.
	 * Room#totalRooms is never touched; availability frees up automatically
	 * because cancelled bookings are excluded from the active-booking sums.
	 */
	BookedRoom cancelBooking(Long bookingId);

	/**
	 * Books numberOfRooms rooms of the given room-type inventory for the dates
	 * on bookingRequest. Throws InvalidBookingRequestException if the dates are
	 * invalid, numberOfRooms < 1, or there isn't enough availability.
	 */
	String saveBooking(Long roomId, BookedRoom bookingRequest);

	BookedRoom findByBookingConfirmationCode(String confirmationCode);

	List<BookedRoom> getAllBookings();

	List<BookedRoom> getBookingsByUserEmail(String email);

	/** Throws ResourceNotFoundException if no booking with this id exists.
	 *  Used by the invoice download endpoint. */
	BookedRoom getBookingById(Long bookingId);

}
