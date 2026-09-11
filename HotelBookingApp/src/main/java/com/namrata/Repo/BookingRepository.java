package com.namrata.Repo;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.namrata.Model.BookedRoom;
import com.namrata.Model.BookingStatus;

public interface BookingRepository extends JpaRepository<BookedRoom, Long> {

	Optional<BookedRoom> findByBookingConfirmationCode(String bookingConfirmationCode);

	List<BookedRoom> findByRoomId(Long roomId);

	List<BookedRoom> findByGuestEmail(String email);

	/**
	 * Sum of numberOfRooms across all bookings of this room that overlap the
	 * given [checkInDate, checkOutDate) window. Same-day check-in/check-out
	 * pairs count as overlapping too, so two bookings placed for the exact same
	 * dates are correctly added together here -- this is what makes the
	 * "same date" capacity check work.
	 *
	 * CANCELLED bookings are excluded so that cancelling a booking (My
	 * Bookings / Cancel Booking) immediately frees its rooms back into
	 * availability -- without ever touching Room#totalRooms.
	 */
	@Query("SELECT COALESCE(SUM(b.numberOfRooms), 0) FROM BookedRoom b " +
		   "WHERE b.room.id = :roomId " +
		   "AND b.bookingStatus <> :cancelledStatus " +
		   "AND b.checkInDate < :checkOutDate " +
		   "AND b.checkOutDate > :checkInDate")
	int sumBookedRoomsForDateRange(@Param("roomId") Long roomId,
									@Param("checkInDate") LocalDate checkInDate,
									@Param("checkOutDate") LocalDate checkOutDate,
									@Param("cancelledStatus") BookingStatus cancelledStatus);

	/**
	 * Sum of numberOfRooms across bookings of this room that are still
	 * "active" as of the given date (i.e. haven't checked out yet). Used to
	 * show a simple, date-independent "available now" count in room listings.
	 * CANCELLED bookings are excluded for the same reason as above.
	 */
	@Query("SELECT COALESCE(SUM(b.numberOfRooms), 0) FROM BookedRoom b " +
		   "WHERE b.room.id = :roomId " +
		   "AND b.bookingStatus <> :cancelledStatus " +
		   "AND b.checkOutDate >= :asOfDate")
	int sumActiveBookedRoomsAsOf(@Param("roomId") Long roomId,
								  @Param("asOfDate") LocalDate asOfDate,
								  @Param("cancelledStatus") BookingStatus cancelledStatus);
}