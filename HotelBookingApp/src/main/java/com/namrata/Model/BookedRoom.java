package com.namrata.Model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

	@Column(name = "confirmation_code")
	private String bookingConfirmationCode;

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

	public void setBookingConfirmationCode(String bookingConfirmationCode) {
		this.bookingConfirmationCode = bookingConfirmationCode;
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

	public String getBookingConfirmationCode() {
		return bookingConfirmationCode;
	}

	public Room getRoom() {
		return room;
	}

//	public BookedRoom(String bookingConfirmationCode) {
//	
//		this.bookingConfirmationCode = bookingConfirmationCode;
//	}

}
