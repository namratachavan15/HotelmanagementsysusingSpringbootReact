package com.namrata.Response;

import java.math.BigDecimal;
import java.sql.Blob;

import java.util.List;

import org.apache.tomcat.util.codec.binary.Base64;

import com.namrata.Model.BookedRoom;


import jakarta.persistence.Lob;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RoomResponse {
	
private Long id;
	
	private String roomType;
	
	private BigDecimal roomPrice;
	
	private boolean isBooked;
	
	private String photo;
	
	private List<BookingResponse> bookings;

	// How many physical rooms of this type exist in inventory.
	private int totalRooms;

	// totalRooms minus however many are currently booked -- what the UI
	// shows as "X rooms available" and what goes down after a booking.
	private int availableRooms;

	// How many of totalRooms are currently booked.
	private int bookedRooms;

	public RoomResponse(Long id, String roomType, BigDecimal roomPrice) {
		super();
		this.id = id;
		this.roomType = roomType;
		this.roomPrice = roomPrice;
	}

	public RoomResponse(Long id, String roomType, BigDecimal roomPrice, boolean isBooked, byte[] photoBytes,
			List<BookingResponse> bookings) {
		super();
		this.id = id;
		this.roomType = roomType;
		this.roomPrice = roomPrice;
		this.isBooked = isBooked;
		this.photo = (photoBytes != null) ? Base64.encodeBase64String(photoBytes):null;
		//this.bookings = bookings;
	}
	
	

}