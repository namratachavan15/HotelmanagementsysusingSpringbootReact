package com.namrata.Controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Blob;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;

import java.util.List;
import java.util.Optional;

import javax.sql.rowset.serial.SerialBlob;

import org.apache.tomcat.util.codec.binary.Base64;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.namrata.Exception.PhotoRetrievalException;
import com.namrata.Exception.ResourceNotFoundException;
import com.namrata.Model.BookedRoom;
import com.namrata.Model.Room;
import com.namrata.Response.BookingResponse;
import com.namrata.Response.RoomResponse;
import com.namrata.Service.BookingService;
import com.namrata.Service.IRoomService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RequestMapping("/rooms")
@RestController
@CrossOrigin(origins = { "http://localhost:3000" })

public class RoomController {

	private final IRoomService roomService;
	private final BookingService bookingService;

	@PostMapping("/add/new-room")
	@PreAuthorize("hasRole('ROLE_ADMIN')")
	public ResponseEntity<RoomResponse> addNewRoom(@RequestParam("photo") MultipartFile photo,
			@RequestParam("roomType") String roomType, @RequestParam("roomPrice") BigDecimal roomPrice,
			@RequestParam(value = "totalRooms", required = false, defaultValue = "1") Integer totalRooms) {
		System.out.println("roomtype" + roomType);
		Room savedRoom = roomService.addNewRoom(photo, roomType, roomPrice, totalRooms);
		RoomResponse reponse = getRoomResponse(savedRoom);

		return new ResponseEntity<>(reponse, HttpStatus.CREATED);
	}

	@GetMapping("/room-types")
	public List<String> getRoomTypes() {
		return roomService.getAllRoomTypes();
	}

	@GetMapping("/all-rooms")
	public ResponseEntity<List<RoomResponse>> getAllRooms() throws SQLException {
		List<Room> rooms = roomService.getAllRooms();
		List<RoomResponse> roomResponses = new ArrayList<>();

		for (Room room : rooms) {
			byte[] photoBytes = roomService.getRoomPhotoByRoomId(room.getId());
			if (photoBytes != null && photoBytes.length > 0) {
				String base64Photo = Base64.encodeBase64String(photoBytes);
				RoomResponse roomResponse = getRoomResponse(room);
				roomResponse.setPhoto(base64Photo);
				roomResponses.add(roomResponse);
			}
		}
		return ResponseEntity.ok(roomResponses);
	}

	// Same room list as /all-rooms, but bookedRooms/availableRooms are computed
	// for the given check-in/check-out window instead of "as of today" -- this
	// is what Browse Rooms calls once the guest has picked dates, so every
	// card's availability is actually specific to those dates rather than a
	// generic "today" snapshot.
	@GetMapping("/all-rooms/availability")
	public ResponseEntity<List<RoomResponse>> getAllRoomsAvailability(
			@RequestParam("checkInDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
			@RequestParam("checkOutDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate)
			throws SQLException {
		List<Room> rooms = roomService.getAllRooms();
		List<RoomResponse> roomResponses = new ArrayList<>();

		for (Room room : rooms) {
			byte[] photoBytes = roomService.getRoomPhotoByRoomId(room.getId());
			if (photoBytes != null && photoBytes.length > 0) {
				String base64Photo = Base64.encodeBase64String(photoBytes);
				RoomResponse roomResponse = getRoomResponseForDateRange(room, checkInDate, checkOutDate);
				roomResponse.setPhoto(base64Photo);
				roomResponses.add(roomResponse);
			}
		}
		return ResponseEntity.ok(roomResponses);
	}

	@DeleteMapping("/delete/room/{roomId}")
	@PreAuthorize("hasRole('ROLE_ADMIN')")
	public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId) {
		roomService.deleteRoom(roomId);
		return new ResponseEntity<>(HttpStatus.NO_CONTENT);
	}

	@PutMapping("/update/{roomId}")
	@PreAuthorize("hasRole('ROLE_ADMIN')")
	public ResponseEntity<RoomResponse> updateRoom(@PathVariable Long roomId,
			@RequestParam(required = false) String roomType, @RequestParam(required = false) BigDecimal roomPrice,
			@RequestParam(required = false) Integer totalRooms,
			@RequestParam(required = false) MultipartFile photo) throws IOException, SQLException {

		byte[] photoBytes = photo != null && !photo.isEmpty() ? photo.getBytes()
				: roomService.getRoomPhotoByRoomId(roomId);

		Blob photoBlob = photoBytes != null && photoBytes.length > 0 ? new SerialBlob(photoBytes) : null;

		Room theRoom = roomService.updateRoom(roomId, roomType, roomPrice, totalRooms, photoBytes);
		theRoom.setPhoto(photoBlob);
		RoomResponse roomResponse = getRoomResponse(theRoom);
		return ResponseEntity.ok(roomResponse);

	}

	@GetMapping("/room/{roomId}")
	public ResponseEntity<Optional<RoomResponse>> getRoomById(@PathVariable Long roomId) {
		Optional<Room> theRoom = roomService.getRoomById(roomId);
		return theRoom.map(room -> {
			RoomResponse roomResponse = getRoomResponse(room);
			System.out.println(roomResponse);
			return ResponseEntity.ok(Optional.of(roomResponse));
		}).orElseThrow(() -> new ResourceNotFoundException("Room not found"));

	}

	private RoomResponse getRoomResponse(Room room) {

		List<BookedRoom> bookings = getAllBookingsByRoomId(room.getId());
		List<BookingResponse> bookingsInfo = new ArrayList<>();
		
		  if (bookings != null) { bookingsInfo = bookings.stream() .map(booking -> new
		  BookingResponse(booking.getBookingId(), booking.getCheckInDate(),
		  booking.getCheckOutDate(), booking.getBookingConfirmationCode())) .toList();
		 }
		 
		byte[] photoBytes = null;
		Blob photoBlob = room.getPhoto();
		if (photoBlob != null) {
			try {
				photoBytes = photoBlob.getBytes(1, (int) photoBlob.length());
			} catch (Exception e) {
				throw new PhotoRetrievalException("Error retrieving photo");
			}
		}
		RoomResponse roomResponse = new RoomResponse(room.getId(), room.getRoomType(), room.getRoomPrice(),
				room.isBooked(), photoBytes, bookingsInfo);

		int bookedCount = roomService.getBookedRoomCount(room.getId(), LocalDate.now());
		int totalRooms = room.getTotalRooms();
		roomResponse.setTotalRooms(totalRooms);
		roomResponse.setBookedRooms(bookedCount);
		roomResponse.setAvailableRooms(Math.max(totalRooms - bookedCount, 0));

		return roomResponse;
	}

	// Same as getRoomResponse, but bookedRooms/availableRooms are computed for
	// a specific check-in/check-out window instead of "as of today" -- this is
	// what dated availability (search results, the booking form's live
	// validation) must use, since "today's" snapshot does not reflect how many
	// rooms are actually free for a future date range.
	private RoomResponse getRoomResponseForDateRange(Room room, LocalDate checkInDate, LocalDate checkOutDate) {

		RoomResponse roomResponse = getRoomResponse(room);

		int bookedForRange = roomService.getBookedRoomCountForDateRange(room.getId(), checkInDate, checkOutDate);
		int totalRooms = room.getTotalRooms();
		roomResponse.setTotalRooms(totalRooms);
		roomResponse.setBookedRooms(bookedForRange);
		roomResponse.setAvailableRooms(Math.max(totalRooms - bookedForRange, 0));

		return roomResponse;
	}

	@GetMapping("/available-rooms")
	public ResponseEntity<List<RoomResponse>> getAvailableRooms(
			@RequestParam("checkInDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
			@RequestParam("checkOutDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
			@RequestParam("roomType") String roomType) throws SQLException {

		List<Room> availableRooms = roomService.getAvailbleRooms(checkInDate, checkOutDate, roomType);
		List<RoomResponse> roomResponses = new ArrayList<>();
		for (Room room : availableRooms) {

			byte[] photoBytes = roomService.getRoomPhotoByRoomId(room.getId());
			if (photoBytes != null && photoBytes.length > 0) {
				String photoBase64 = Base64.encodeBase64String(photoBytes);
				// Use the date-range-aware counts here -- these results are for a
				// specific checkIn/checkOut window, so "available" must reflect
				// bookings that overlap THOSE dates, not just "as of today".
				RoomResponse roomResponse = getRoomResponseForDateRange(room, checkInDate, checkOutDate);
				roomResponse.setPhoto(photoBase64);
				roomResponses.add(roomResponse);
			}
		}
		if (roomResponses.isEmpty()) {
			return ResponseEntity.noContent().build();
		} else {
			return ResponseEntity.ok(roomResponses);
		}
	}

	// Lightweight endpoint for the booking form's live "X rooms available for
	// your selected dates" check -- called whenever the guest changes the
	// check-in/check-out dates or the room quantity, so it needs to be cheap
	// and specific to one room, unlike /available-rooms which searches by type.
	@GetMapping("/room/{roomId}/availability")
	public ResponseEntity<RoomResponse> getRoomAvailability(@PathVariable Long roomId,
			@RequestParam("checkInDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
			@RequestParam("checkOutDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate) {

		Room room = roomService.getRoomById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room not found"));
		RoomResponse roomResponse = getRoomResponseForDateRange(room, checkInDate, checkOutDate);
		return ResponseEntity.ok(roomResponse);
	}

	private List<BookedRoom> getAllBookingsByRoomId(Long roomId) {
		// TODO Auto-generated method stub
		return bookingService.getAllBookingsByRoomId(roomId);
	}

}