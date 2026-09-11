package com.namrata.Service;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

import com.namrata.Model.Room;

public interface IRoomService {

	Room addNewRoom(MultipartFile photo, String roomType, BigDecimal roomPrice, Integer totalRooms);

	List<String> getAllRoomTypes();

	List<Room> getAllRooms();

	byte[] getRoomPhotoByRoomId(Long roomId) throws SQLException;

	void deleteRoom(Long roomId);

	Room updateRoom(Long roomId, String roomType, BigDecimal roomPrice, Integer totalRooms, byte[] photoBytes);

	Optional<Room> getRoomById(Long roomId);

	List<Room> getAvailbleRooms(LocalDate checkInDate, LocalDate checkOutDate, String roomType);

	// Rooms of this type still booked/occupied as of asOfDate (default "today"
	// snapshot used in room listings).
	int getBookedRoomCount(Long roomId, LocalDate asOfDate);

	// totalRooms - getBookedRoomCount(roomId, today). What the UI shows as
	// "X rooms available" and what goes down right after a booking is made.
	int getAvailableRoomCount(Long roomId);

	// Rooms of this type already booked for a specific check-in/check-out
	// window -- used to validate a new booking request (including two
	// bookings placed for the exact same dates).
	int getBookedRoomCountForDateRange(Long roomId, LocalDate checkInDate, LocalDate checkOutDate);

}