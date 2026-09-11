package com.namrata.Controller;

import java.util.ArrayList;
import java.util.Comparator;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
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
import com.namrata.Model.Payment;
import com.namrata.Model.PaymentStatus;
import com.namrata.Model.Room;
import com.namrata.Repo.PaymentRepository;
import com.namrata.Response.BookingResponse;
import com.namrata.Response.RoomResponse;

import com.namrata.Service.IBookingService;
import com.namrata.Service.IRoomService;
import com.namrata.Service.InvoiceService;
import com.namrata.Service.InvoiceService.PriceBreakdown;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = { "http://localhost:3000" })
@RequiredArgsConstructor
@RestController
@RequestMapping("/bookings")
public class BookingController {

	private final IBookingService bookingService;
	private final IRoomService roomService;
	private final PaymentRepository paymentRepository;
	private final InvoiceService invoiceService;

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

	/**
	 * Legacy path-variable lookup, kept for backward compatibility (Profile
	 * page). Ownership is now enforced server-side: a logged-in guest may only
	 * request their own email's bookings, and an admin may request anyone's -
	 * the frontend can no longer get another guest's bookings just by passing
	 * a different email in the URL.
	 */
	@GetMapping("/user/{email}/bookings")
	public ResponseEntity<List<BookingResponse>> getBookingsByUserEmail(@PathVariable String email,
			Authentication authentication) {

		assertSelfOrAdmin(authentication, email);

		List<BookedRoom> bookings = bookingService.getBookingsByUserEmail(email);
		List<BookingResponse> bookingResponses = buildSortedResponses(bookings);
		return ResponseEntity.ok(bookingResponses);
	}

	/**
	 * The "My Bookings" endpoint: the guest's email is read straight from
	 * their JWT (Authentication), never from a query/path parameter supplied
	 * by the frontend - so there's no way to pass someone else's email and
	 * see their bookings.
	 */
	@GetMapping("/my-bookings")
	public ResponseEntity<List<BookingResponse>> getMyBookings(Authentication authentication) {
		if (authentication == null || authentication.getName() == null) {
			throw new AccessDeniedException("You must be logged in to view your bookings");
		}
		List<BookedRoom> bookings = bookingService.getBookingsByUserEmail(authentication.getName());
		List<BookingResponse> bookingResponses = buildSortedResponses(bookings);
		return ResponseEntity.ok(bookingResponses);
	}

	private List<BookingResponse> buildSortedResponses(List<BookedRoom> bookings) {
		List<BookedRoom> sorted = new ArrayList<>(bookings);
		// Most recent booking first; bookings made before the bookingDate
		// column existed (null) sort last instead of blowing up.
		sorted.sort(Comparator.comparing(BookedRoom::getBookingDate,
				Comparator.nullsLast(Comparator.reverseOrder())));

		List<BookingResponse> bookingResponses = new ArrayList<>();
		for (BookedRoom booking : sorted) {
			bookingResponses.add(getBookingResponse(booking));
		}
		return bookingResponses;
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

	/**
	 * Booking details for the "View Details" screen in My Bookings. Same
	 * ownership rule as the invoice download below: only the guest who made
	 * the booking, or an admin, may view it.
	 */
	@GetMapping("/{bookingId}")
	public ResponseEntity<BookingResponse> getBookingDetails(@PathVariable Long bookingId,
			Authentication authentication) {
		BookedRoom booking = bookingService.getBookingById(bookingId);
		assertOwnerOrAdmin(authentication, booking);
		return ResponseEntity.ok(getBookingResponse(booking));
	}

	private BookingResponse getBookingResponse(BookedRoom booking) {

		Room theRoom = roomService.getRoomById(booking.getRoom().getId()).get();
		RoomResponse room = new RoomResponse(theRoom.getId(), theRoom.getRoomType(), theRoom.getRoomPrice());

		// Payment status is looked up separately (Payment is a standalone table,
		// linked only by the booking confirmation code) rather than assumed --
		// a booking with no linked payment yet is reported as PENDING, not PAID.
		// Normalised through PaymentStatus so the frontend only ever sees one
		// of PENDING/PAID/FAILED/REFUNDED (never the raw Razorpay "CREATED").
		String rawPaymentStatus = paymentRepository.findByBookingConfirmationCode(booking.getBookingConfirmationCode())
				.map(Payment::getStatus).orElse(null);
		String paymentStatus = PaymentStatus.fromRaw(rawPaymentStatus).name();

		// Same formula/service used by the invoice PDF and confirmation email,
		// so the amount shown in My Bookings always matches the downloadable
		// invoice - nothing is recalculated differently here.
		PriceBreakdown breakdown = invoiceService.computeBreakdown(booking);

		return new BookingResponse(booking.getBookingId(), booking.getCheckInDate(), booking.getCheckOutDate(),
				booking.getGuestFullName(), booking.getGuestEmail(), booking.getNumOfAdults(),
				booking.getNumOfChildren(), booking.getTotalNumOfGuest(), booking.getBookingConfirmationCode(),
				booking.getNumberOfRooms(), String.valueOf(booking.getBookingStatus()), paymentStatus,
				booking.getBookingDate(), breakdown.pricePerNight, breakdown.nights, breakdown.subtotal,
				breakdown.discount, breakdown.tax, breakdown.total, room);
	}

	@PostMapping("/room/{roomId}/booking")
	public ResponseEntity<?> saveBooking(@PathVariable Long roomId, @RequestBody BookedRoom bookingRequest) {
	    try {
	        System.out.println("inside save booking");
	        String confirmationCode = bookingService.saveBooking(roomId, bookingRequest);
	        return ResponseEntity.ok("Room Booked successfully! Your booking confirmation code is: " + confirmationCode);
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

	/**
	 * Cancels a booking (soft-cancel: status -> CANCELLED, the row and its
	 * invoice/history stay intact). Only the guest who owns the booking, or an
	 * admin, may cancel it - matches the same ownership rule as invoice
	 * download and booking details. Returns 400 if the booking is already
	 * CANCELLED or CHECKED_OUT (completed).
	 *
	 * Kept as DELETE on the same path for backward compatibility with the
	 * existing Find My Booking / Admin bookings pages that already call this
	 * endpoint - only the behaviour underneath (soft-cancel + ownership check)
	 * has changed, not the URL or HTTP method.
	 */
	@DeleteMapping("/booking/{bookingId}/delete")
	public ResponseEntity<String> cancelBooking(@PathVariable Long bookingId, Authentication authentication) {
		BookedRoom booking = bookingService.getBookingById(bookingId);
		assertOwnerOrAdmin(authentication, booking);

		bookingService.cancelBooking(bookingId);
		return ResponseEntity.ok("Booking cancelled successfully");
	}

	/**
	 * Streams the booking's invoice PDF. Only the guest who made the booking
	 * (matched by authenticated email == booking.guestEmail) or an admin may
	 * download it - a bookingId belonging to someone else always gets a 403,
	 * regardless of what the frontend sends.
	 */
	@GetMapping("/{bookingId}/invoice")
	public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long bookingId, Authentication authentication) {

		BookedRoom booking = bookingService.getBookingById(bookingId);
		assertOwnerOrAdmin(authentication, booking);

		byte[] pdf = invoiceService.generateInvoicePdf(booking);
		String filename = "Taj-Hotel-Invoice-" + booking.getBookingConfirmationCode() + ".pdf";

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
				.contentType(MediaType.APPLICATION_PDF)
				.body(pdf);
	}

	/** True if the authenticated user is an admin (ROLE_ADMIN authority). */
	private boolean isAdmin(Authentication authentication) {
		return authentication != null && authentication.getAuthorities().stream()
				.anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
	}

	/**
	 * Throws AccessDeniedException (-> 403, see GlobalExceptionHandler) unless
	 * the authenticated user is the guest on this booking or an admin.
	 */
	private void assertOwnerOrAdmin(Authentication authentication, BookedRoom booking) {
		boolean isOwner = authentication != null && authentication.getName() != null
				&& authentication.getName().equalsIgnoreCase(booking.getGuestEmail());

		if (!isOwner && !isAdmin(authentication)) {
			throw new AccessDeniedException("You are not authorized to access this booking");
		}
	}

	/**
	 * Throws AccessDeniedException (-> 403) unless the authenticated user's own
	 * email matches the requested email, or the user is an admin. Used by the
	 * legacy /user/{email}/bookings lookup so a logged-in guest can't fetch
	 * another guest's bookings just by editing the URL.
	 */
	private void assertSelfOrAdmin(Authentication authentication, String requestedEmail) {
		boolean isSelf = authentication != null && authentication.getName() != null
				&& authentication.getName().equalsIgnoreCase(requestedEmail);

		if (!isSelf && !isAdmin(authentication)) {
			throw new AccessDeniedException("You are not authorized to access these bookings");
		}
	}
}
