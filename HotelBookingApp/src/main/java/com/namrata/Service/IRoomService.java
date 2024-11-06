package com.namrata.Service;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

import com.namrata.Model.Room;

public interface IRoomService {

	Room addNewRoom(MultipartFile photo, String roomType, BigDecimal roomPrice);

	List<String> getAllRoomTypes();

	List<Room> getAllRooms();

	byte[] getRoomPhotoByRoomId(Long roomId) throws SQLException;

	void deleteRoom(Long roomId);

	Room updateRoom(Long roomId, String roomType, BigDecimal roomPrice, byte[] photoBytes);

	Optional<Room> getRoomById(Long roomId);

	List<Room> getAvailbleRooms(LocalDate checkInDate, LocalDate checkOutDate, String roomType);

}
