package com.namrata.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Blob;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import javax.sql.rowset.serial.SerialBlob;

import org.springframework.boot.context.config.ConfigDataResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.namrata.Exception.InternalServerException;
import com.namrata.Exception.ResourceNotFoundException;
import com.namrata.Model.Room;
import com.namrata.Repo.RoomRepo;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class RoomService implements IRoomService {

	private final RoomRepo roomRepo;

	@Override
	public Room addNewRoom(MultipartFile file, String roomType, BigDecimal roomPrice) {
		// TODO Auto-generated method stub

		Room room = new Room();
		room.setRoomType(roomType);
		room.setRoomPrice(roomPrice);
		byte[] photoBytes = null;
		Blob photoBlob = null;
		if (!file.isEmpty()) {

			try {
				
				photoBytes = file.getBytes();
				
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			try {
				photoBlob = new SerialBlob(photoBytes);
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			room.setPhoto(photoBlob);
		}
		return roomRepo.save(room);
	}

	@Override
	public List<String> getAllRoomTypes() {

		return roomRepo.findDistinctRoomTypes();
	}

	@Override
	public List<Room> getAllRooms() {

		return roomRepo.findAll();
	}

	@Override
	public byte[] getRoomPhotoByRoomId(Long roomId) throws SQLException {

		Optional<Room> theRoom = roomRepo.findById(roomId);

		if (theRoom.isEmpty()) {
			throw new ResourceNotFoundException("Sorry,Room not found!");
		}
		Blob photoBlob = theRoom.get().getPhoto();
		if (photoBlob != null) {
			return photoBlob.getBytes(1, (int) photoBlob.length());
		}
		return null;
	}

	@Override
	public void deleteRoom(Long roomId) {

		Optional<Room> theRoom = roomRepo.findById(roomId);
		if (theRoom.isPresent()) {
			roomRepo.deleteById(roomId);
		}
	}

	@Override
	public Room updateRoom(Long roomId, String roomType, BigDecimal roomPrice, byte[] photoBytes) {

		Room room = roomRepo.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room not found"));

		if (roomType != null) {
			room.setRoomType(roomType);
		}
		if (roomPrice != null) {
			room.setRoomPrice(roomPrice);
		}
		if (photoBytes != null && photoBytes.length > 0) {
			try {

				room.setPhoto(new SerialBlob(photoBytes));

			} catch (SQLException e) {
				throw new InternalServerException("Error updating room");
			}
		}
		return roomRepo.save(room);
	}

	@Override
	public Optional<Room> getRoomById(Long roomId) {
		// TODO Auto-generated method stub
		System.out.println("romm id=" + roomId);
		return Optional.of(roomRepo.findById(roomId).get());
	}

	@Override
	public List<Room> getAvailbleRooms(LocalDate checkInDate, LocalDate checkOutDate, String roomType) {
		// TODO Auto-generated method stub
		return roomRepo.findAvailableRoomsByDateAndType(checkInDate, checkOutDate, roomType);
	}
}
