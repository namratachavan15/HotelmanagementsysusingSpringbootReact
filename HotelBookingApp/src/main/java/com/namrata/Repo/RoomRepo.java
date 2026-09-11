package com.namrata.Repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.namrata.Model.Room;

@Repository
@EnableJpaRepositories
public interface RoomRepo extends JpaRepository<Room, Long> {

	@Query("SELECT  DISTINCT  r.roomType from Room r")
	List<String> findDistinctRoomTypes();

	// Just filters by room type. Whether a room of this type actually has a
	// free unit for the requested dates is worked out separately (see
	// RoomService#getAvailbleRooms), by comparing totalRooms against how many
	// are already booked for those dates -- not by excluding a room the
	// moment it has any booking at all, which is wrong once a room type can
	// have more than one physical room.
	@Query("SELECT r FROM Room r WHERE r.roomType LIKE %:roomType%")
	List<Room> findByRoomTypeLike(@Param("roomType") String roomType);

}