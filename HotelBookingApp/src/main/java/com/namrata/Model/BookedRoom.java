package com.namrata.Model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
//@Getter
//@Setter
//@AllArgsConstructor
//@NoArgsConstructor
public class BookedRoom {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long bookingId;

	@Column(name = "check_In")
	private LocalDate checkInDate;

	@Column(name = "check_Out")
	private LocalDate checkOutDate;

	@Column(name = "guest_FullName")
	private String guestFullName;

	@Column(name = "guest_Email")
	private String guestEmail;

	@Column(name = "adults")
	private int NumOfAdults;

	@Column(name = "children")
	private int NumOfChildren;

	@Column(name = "total_guest")
	private int totalNumOfGuest;

	// Total guests above (adults + children) is the TOTAL across this booking,
	// not per room -- e.g. "2 rooms, 2 adults, 2 children" means 4 guests
	// spread across 2 rooms, never 2 adults + 2 children counted per room.
	@Column(name = "number_of_rooms")
	private int numberOfRooms = 1;

	@Column(name = "confirmation_code")
	private String bookingConfirmationCode;

	/**
	 * PENDING until the linked payment is verified as PAID, at which point
	 * PaymentService#attachBookingConfirmation flips this to CONFIRMED. Never
	 * set directly from user/frontend input.
	 */
	@Enumerated(EnumType.STRING)
	@Column(name = "booking_status")
	private BookingStatus bookingStatus = BookingStatus.PENDING;

	/**
	 * When this booking record was created. Nullable so existing rows created
	 * before this column existed simply show no booking date instead of
	 * breaking - set once, at creation time, in BookingService#saveBooking.
	 */
	@Column(name = "booking_date")
	private LocalDateTime bookingDate;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "room_id")
	private Room room;

	public void calculateTotalNumberOfGuests() {
		this.totalNumOfGuest = NumOfAdults + NumOfChildren;
	}

	public void setNumOfAdults(int numOfAdults) {
		NumOfAdults = numOfAdults;
		calculateTotalNumberOfGuests();
	}

	public void setNumOfChildren(int numOfChildren) {
		NumOfChildren = numOfChildren;
		calculateTotalNumberOfGuests();
	}

	public BookedRoom() {
		super();
		// TODO Auto-generated constructor stub
	}

	public BookedRoom(Long bookingId, LocalDate checkInDate, LocalDate checkOutDate, String guestFullName,
			String guestEmail, int numOfAdults, int numOfChildren, int totalNumOfGuest, String bookingConfirmationCode,
			Room room) {
		super();
		this.bookingId = bookingId;
		this.checkInDate = checkInDate;
		this.checkOutDate = checkOutDate;
		this.guestFullName = guestFullName;
		this.guestEmail = guestEmail;
		NumOfAdults = numOfAdults;
		NumOfChildren = numOfChildren;
		this.totalNumOfGuest = totalNumOfGuest;
		this.bookingConfirmationCode = bookingConfirmationCode;
		this.room = room;
	}

	@Override
	public String toString() {
		return "BookedRoom [bookingId=" + bookingId + ", checkInDate=" + checkInDate + ", checkOutDate=" + checkOutDate
				+ ", guestFullName=" + guestFullName + ", guestEmail=" + guestEmail + ", NumOfAdults=" + NumOfAdults
				+ ", NumOfChildren=" + NumOfChildren + ", totalNumOfGuest=" + totalNumOfGuest
				+ ", numberOfRooms=" + numberOfRooms + ", bookingStatus=" + bookingStatus
				+ ", bookingConfirmationCode=" + bookingConfirmationCode + ", room=" + room + "]";
	}

	public void setBookingId(Long bookingId) {
		this.bookingId = bookingId;
	}

	public void setCheckInDate(LocalDate checkInDate) {
		this.checkInDate = checkInDate;
	}

	public void setCheckOutDate(LocalDate checkOutDate) {
		this.checkOutDate = checkOutDate;
	}

	public void setGuestFullName(String guestFullName) {
		this.guestFullName = guestFullName;
	}

	public void setGuestEmail(String guestEmail) {
		this.guestEmail = guestEmail;
	}

	public void setTotalNumOfGuest(int totalNumOfGuest) {
		this.totalNumOfGuest = totalNumOfGuest;
	}

	public void setNumberOfRooms(int numberOfRooms) {
		this.numberOfRooms = numberOfRooms;
	}

	public void setBookingConfirmationCode(String bookingConfirmationCode) {
		this.bookingConfirmationCode = bookingConfirmationCode;
	}

	public void setBookingStatus(BookingStatus bookingStatus) {
		this.bookingStatus = bookingStatus;
	}

	public LocalDateTime getBookingDate() {
		return bookingDate;
	}

	public void setBookingDate(LocalDateTime bookingDate) {
		this.bookingDate = bookingDate;
	}

	public void setRoom(Room room) {
		this.room = room;
	}

	public Long getBookingId() {
		return bookingId;
	}

	public LocalDate getCheckInDate() {
		return checkInDate;
	}

	public LocalDate getCheckOutDate() {
		return checkOutDate;
	}

	public String getGuestFullName() {
		return guestFullName;
	}

	public String getGuestEmail() {
		return guestEmail;
	}

	public int getNumOfAdults() {
		return NumOfAdults;
	}

	public int getNumOfChildren() {
		return NumOfChildren;
	}

	public int getTotalNumOfGuest() {
		return totalNumOfGuest;
	}

	public int getNumberOfRooms() {
		return numberOfRooms;
	}

	public String getBookingConfirmationCode() {
		return bookingConfirmationCode;
	}

	public BookingStatus getBookingStatus() {
		return bookingStatus;
	}

	public Room getRoom() {
		return room;
	}

//	public BookedRoom(String bookingConfirmationCode) {
//	
//		this.bookingConfirmationCode = bookingConfirmationCode;
//	}

}
