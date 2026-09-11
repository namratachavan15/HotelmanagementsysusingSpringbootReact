package com.namrata.Response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor

public class BookingResponse {

	private Long bookingId;

	private LocalDate checkInDate;

	private LocalDate checkOutDate;

	private String guestFullName;

	private String guestEmail;

	private int NumOfAdults;

	private int NumOfChildren;

	private int totalNumOfGuest;

	private String bookingConfirmationCode;

	/** How many rooms of the room-type inventory this booking reserves. */
	private int numberOfRooms;

	/** PENDING / CONFIRMED / CHECKED_IN / CHECKED_OUT / CANCELLED */
	private String bookingStatus;

	/** PENDING / PAID / FAILED / REFUNDED - looked up from the linked Payment, if any. */
	private String paymentStatus;

	/** When the booking was created. Null for bookings made before this field existed. */
	private LocalDateTime bookingDate;

	/** Number of nights between check-in and check-out (min 1). */
	private long numberOfNights;

	/** Room price per night, as stored on the room at invoice-computation time. */
	private BigDecimal roomPricePerNight;

	/** roomPricePerNight x numberOfRooms x numberOfNights. */
	private BigDecimal subtotal;

	/** Discount applied to the subtotal, if any (0 if none configured). */
	private BigDecimal discount;

	/** Tax/GST applied after discount. */
	private BigDecimal tax;

	/**
	 * The authoritative, backend-computed grand total for this booking -
	 * always use this instead of recalculating on the frontend, so the figure
	 * shown here always matches the invoice PDF and confirmation email.
	 */
	private BigDecimal finalTotal;

	private RoomResponse room;

	public BookingResponse(Long bookingId, LocalDate checkInDate, LocalDate checkOutDate,
			String bookingConfirmationCode) {
		super();
		this.bookingId = bookingId;
		this.checkInDate = checkInDate;
		this.checkOutDate = checkOutDate;
		this.bookingConfirmationCode = bookingConfirmationCode;
	}

	public BookingResponse(Long bookingId, LocalDate checkInDate, LocalDate checkOutDate, String guestFullName,
			String guestEmail, int numOfAdults, int numOfChildren, int totalNumOfGuest,
			String bookingConfirmationCode, int numberOfRooms, String bookingStatus, String paymentStatus,
			RoomResponse room) {
		super();
		this.bookingId = bookingId;
		this.checkInDate = checkInDate;
		this.checkOutDate = checkOutDate;
		this.guestFullName = guestFullName;
		this.guestEmail = guestEmail;
		this.NumOfAdults = numOfAdults;
		this.NumOfChildren = numOfChildren;
		this.totalNumOfGuest = totalNumOfGuest;
		this.bookingConfirmationCode = bookingConfirmationCode;
		this.numberOfRooms = numberOfRooms;
		this.bookingStatus = bookingStatus;
		this.paymentStatus = paymentStatus;
		this.room = room;
	}

	/**
	 * Full constructor used by BookingController#getBookingResponse, which also
	 * fills in the price breakdown (reusing InvoiceService#computeBreakdown) and
	 * the booking date so My Bookings / booking details never have to
	 * recompute pricing on the frontend.
	 */
	public BookingResponse(Long bookingId, LocalDate checkInDate, LocalDate checkOutDate, String guestFullName,
			String guestEmail, int numOfAdults, int numOfChildren, int totalNumOfGuest,
			String bookingConfirmationCode, int numberOfRooms, String bookingStatus, String paymentStatus,
			LocalDateTime bookingDate, BigDecimal roomPricePerNight, long numberOfNights, BigDecimal subtotal,
			BigDecimal discount, BigDecimal tax, BigDecimal finalTotal, RoomResponse room) {
		super();
		this.bookingId = bookingId;
		this.checkInDate = checkInDate;
		this.checkOutDate = checkOutDate;
		this.guestFullName = guestFullName;
		this.guestEmail = guestEmail;
		this.NumOfAdults = numOfAdults;
		this.NumOfChildren = numOfChildren;
		this.totalNumOfGuest = totalNumOfGuest;
		this.bookingConfirmationCode = bookingConfirmationCode;
		this.numberOfRooms = numberOfRooms;
		this.bookingStatus = bookingStatus;
		this.paymentStatus = paymentStatus;
		this.bookingDate = bookingDate;
		this.roomPricePerNight = roomPricePerNight;
		this.numberOfNights = numberOfNights;
		this.subtotal = subtotal;
		this.discount = discount;
		this.tax = tax;
		this.finalTotal = finalTotal;
		this.room = room;
	}

}
