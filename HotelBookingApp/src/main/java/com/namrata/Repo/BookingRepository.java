package com.namrata.Repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.namrata.Model.BookedRoom;
import java.util.List;
import java.util.Optional;



public interface BookingRepository extends JpaRepository<BookedRoom, Long> {

Optional<BookedRoom>  findByBookingConfirmationCode(String bookingConfirmationCode);
	
	List<BookedRoom> findByRoomId(Long roomId);

	List<BookedRoom> findByGuestEmail(String email);
}
