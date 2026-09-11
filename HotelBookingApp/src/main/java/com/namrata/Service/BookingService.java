package com.namrata.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.namrata.Exception.InvalidBookingRequestException;
import com.namrata.Exception.ResourceNotFoundException;
import com.namrata.Model.BookedRoom;
import com.namrata.Model.BookingStatus;
import com.namrata.Model.Room;
import com.namrata.Repo.BookingRepository;

@Service
public class BookingService implements IBookingService {

	private BookingRepository bookingRepository;
	private final IRoomService roomService;

	public BookingService(BookingRepository bookingRepository, IRoomService roomService) {
		this.bookingRepository = bookingRepository;
		this.roomService = roomService;
	}

	public List<BookedRoom> getAllBookingsByRoomId(Long roomId) {
		// TODO Auto-generated method stub
		return bookingRepository.findByRoomId(roomId);
	}

	// Soft-cancel: never deletes the booking row, so its invoice and history
	// stay intact. Ownership (is this the guest's own booking, or an admin?)
	// is checked by the caller (BookingController), which has access to the
	// authenticated user; this method only enforces the business rule that a
	// booking already CANCELLED or CHECKED_OUT (completed) can't be cancelled
	// again. Room#totalRooms is never touched here - availability frees up on
	// its own because BookingRepository's active-booking sums now exclude
	// CANCELLED bookings.
	@Override
	@Transactional
	public BookedRoom cancelBooking(Long bookingId) {

		BookedRoom booking = getBookingById(bookingId);

		if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
			throw new InvalidBookingRequestException("This booking has already been cancelled.");
		}
		if (booking.getBookingStatus() == BookingStatus.CHECKED_OUT) {
			throw new InvalidBookingRequestException("A completed booking cannot be cancelled.");
		}

		booking.setBookingStatus(BookingStatus.CANCELLED);
		return bookingRepository.save(booking);
	}

	// Transactional so the availability check and the save happen as one unit
	// -- this is what stops two near-simultaneous bookings for the same room
	// and dates from both passing the check and over-booking the room.
	@Override
	@Transactional
	public String saveBooking(Long roomId, BookedRoom bookingRequest) {
		if (bookingRequest.getCheckInDate() == null || bookingRequest.getCheckOutDate() == null) {
			throw new InvalidBookingRequestException("Please select both a check-in and a check-out date");
		}
		if (!bookingRequest.getCheckOutDate().isAfter(bookingRequest.getCheckInDate())) {
			throw new InvalidBookingRequestException("Check-out date must be after check-in date");
		}

		Room room = roomService.getRoomById(roomId)
				.orElseThrow(() -> new ResourceNotFoundException("Room not found"));

		// "2 rooms, 2 adults, 2 children" means 2 physical rooms holding a
		// combined 2 adults + 2 children -- numberOfRooms only ever affects
		// how many units of inventory this booking consumes, never the guest
		// counts, and never the price.
		int requestedRooms = bookingRequest.getNumberOfRooms() > 0 ? bookingRequest.getNumberOfRooms() : 1;
		bookingRequest.setNumberOfRooms(requestedRooms);

		int alreadyBookedForDates = roomService.getBookedRoomCountForDateRange(roomId,
				bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate());
		int remaining = room.getTotalRooms() - alreadyBookedForDates;

		// This same capacity check is what protects against overbooking when
		// two guests try to book the same room type for the same (or
		// overlapping) dates -- whoever books first claims the capacity, and
		// anyone after that only succeeds if rooms are still left.
		if (requestedRooms > remaining) {
			String message = remaining <= 0
					? "Sorry, no rooms of this type are available for the selected dates."
					: "Sorry, only " + remaining + " room" + (remaining == 1 ? "" : "s") + " of this type "
							+ (remaining == 1 ? "is" : "are") + " available for the selected dates.";
			throw new InvalidBookingRequestException(message);
		}

		// bookingStatus defaults to PENDING (see BookedRoom) and is only ever
		// flipped to CONFIRMED by PaymentService#attachBookingConfirmation once
		// the linked payment is verified PAID - never here.
		bookingRequest.setBookingDate(LocalDateTime.now());
		room.addBooking(bookingRequest);
		bookingRepository.save(bookingRequest);

		return bookingRequest.getBookingConfirmationCode();

	}

	@Override
	public BookedRoom findByBookingConfirmationCode(String confirmationCode) {
		// TODO Auto-generated method stub
		return bookingRepository.findByBookingConfirmationCode(confirmationCode).orElseThrow(
				() -> new ResourceNotFoundException("No Booking found with booking code:" + confirmationCode));
	}

	@Override
	public List<BookedRoom> getAllBookings() {
		// TODO Auto-generated method stub
		return bookingRepository.findAll();
	}

	@Override
	public List<BookedRoom> getBookingsByUserEmail(String email) {
		return bookingRepository.findByGuestEmail(email);
	}

	@Override
	public BookedRoom getBookingById(Long bookingId) {
		return bookingRepository.findById(bookingId)
				.orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
	}

}
