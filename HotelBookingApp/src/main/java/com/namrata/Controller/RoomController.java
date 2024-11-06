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
			@RequestParam("roomType") String roomType, @RequestParam("roomPrice") BigDecimal roomPrice) {
		System.out.println("roomtype" + roomType);
		Room savedRoom = roomService.addNewRoom(photo, roomType, roomPrice);
		RoomResponse reponse = new RoomResponse(savedRoom.getId(), savedRoom.getRoomType(), savedRoom.getRoomPrice());

		return ResponseEntity.ok(reponse);
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
			@RequestParam(required = false) MultipartFile photo) throws IOException, SQLException {

		byte[] photoBytes = photo != null && !photo.isEmpty() ? photo.getBytes()
				: roomService.getRoomPhotoByRoomId(roomId);

		Blob photoBlob = photoBytes != null && photoBytes.length > 0 ? new SerialBlob(photoBytes) : null;

		Room theRoom = roomService.updateRoom(roomId, roomType, roomPrice, photoBytes);
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

		if (bookings != null) {
			bookingsInfo = bookings.stream().map(booking -> new BookingResponse(booking.getBookingId(),
					booking.getCheckInDate(), booking.getCheckOutDate(), booking.getBookingConfirmationCode()))
					.toList();
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
		return new RoomResponse(room.getId(), room.getRoomType(), room.getRoomPrice(), room.isBooked(), photoBytes,
				bookingsInfo);
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
				RoomResponse roomResponse = getRoomResponse(room);
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

	private List<BookedRoom> getAllBookingsByRoomId(Long roomId) {
		// TODO Auto-generated method stub
		return bookingService.getAllBookingsByRoomId(roomId);
	}

}
