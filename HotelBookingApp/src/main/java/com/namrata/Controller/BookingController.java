package com.namrata.Controller;

import java.util.ArrayList;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.namrata.Exception.InvalidBookingRequestException;
import com.namrata.Exception.ResourceNotFoundException;
import com.namrata.Model.BookedRoom;
import com.namrata.Model.Room;
import com.namrata.Response.BookingResponse;
import com.namrata.Response.RoomResponse;

import com.namrata.Service.IBookingService;
import com.namrata.Service.IRoomService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = { "http://localhost:3000" })
@RequiredArgsConstructor
@RestController
@RequestMapping("/bookings")
public class BookingController {

	private final IBookingService bookingService;
	private final IRoomService roomService;

	@GetMapping("/all-bookings")
	public ResponseEntity<List<BookingResponse>> getAllBookings() {
		List<BookedRoom> bookings = bookingService.getAllBookings();
		List<BookingResponse> bookingResponses = new ArrayList<>();

		for (BookedRoom booking : bookings) {
			BookingResponse bookingResponse = getBookingResponse(booking);
			bookingResponses.add(bookingResponse);
		}
		return ResponseEntity.ok(bookingResponses);
	}

	@GetMapping("/user/{email}/bookings")
	public ResponseEntity<List<BookingResponse>> getBookingsByUserEmail(@PathVariable String email) {
		List<BookedRoom> bookings = bookingService.getBookingsByUserEmail(email);
		List<BookingResponse> bookingResponses = new ArrayList<>();
		for (BookedRoom booking : bookings) {
			BookingResponse bookingResponse = getBookingResponse(booking);
			bookingResponses.add(bookingResponse);
		}
		return ResponseEntity.ok(bookingResponses);
	}

	@GetMapping("/confirmation/{confirmationCode}")
	public ResponseEntity<?> getBookingByConfirmationCode(@PathVariable String confirmationCode) {
		try {

			BookedRoom booking = bookingService.findByBookingConfirmationCode(confirmationCode);
			BookingResponse bookingResponse = getBookingResponse(booking);
			return ResponseEntity.ok(bookingResponse);

		} catch (ResourceNotFoundException e) {

			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
		}
	}

	private BookingResponse getBookingResponse(BookedRoom booking) {

		Room theRoom = roomService.getRoomById(booking.getRoom().getId()).get();
		RoomResponse room = new RoomResponse(theRoom.getId(), theRoom.getRoomType(), theRoom.getRoomPrice());
		return new BookingResponse(booking.getBookingId(), booking.getCheckInDate(), booking.getCheckOutDate(),
				booking.getGuestFullName(), booking.getGuestEmail(), booking.getNumOfAdults(),
				booking.getNumOfChildren(), booking.getTotalNumOfGuest(), booking.getBookingConfirmationCode(), room);
	}

	@PostMapping("/room/{roomId}/booking")
	public ResponseEntity<?> saveBooking(@PathVariable Long roomId, @RequestBody BookedRoom bookingRequest) {
		try {
			System.out.println("inside save booking");
			String confirmationCode = bookingService.saveBooking(roomId, bookingRequest);
			return ResponseEntity
					.ok("Room Booked successfully! Your booking confirmation code is: " + confirmationCode);
		} catch (InvalidBookingRequestException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	/*
	 * @PostMapping("/room/{roomId}/booking") public
	 * ResponseEntity<?>saveBooking(@PathVariable Long roomId, @RequestBody
	 * BookedRoom bookingRequest, Authentication authentication) { try { // Check if
	 * user i authenticated if (authentication == null
	 * ||!authentication.isAuthenticated()) { return
	 * ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated"
	 * ); }
	 * 
	 * // Check if user is authorized to book the room (optional, if needed) // //
	 * Perform authorization logic here
	 * 
	 * System.out.println("inside save booking"); String confirmationCode =
	 * bookingService.saveBooking(roomId, bookingRequest); return ResponseEntity.
	 * ok("Room Booked successfully! Your booking confirmation code is: " +
	 * confirmationCode); } catch (InvalidBookingRequestException e) { return
	 * ResponseEntity.badRequest().body(e.getMessage()); } }
	 */

	@DeleteMapping("/booking/{bookingId}/delete")
	public void cancelBooking(@PathVariable Long bookingId) {
		bookingService.cancelBooking(bookingId);

	}
}
