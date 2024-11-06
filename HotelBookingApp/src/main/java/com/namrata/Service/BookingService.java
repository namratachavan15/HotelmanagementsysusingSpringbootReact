package com.namrata.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.namrata.Exception.InvalidBookingRequestException;
import com.namrata.Exception.ResourceNotFoundException;
import com.namrata.Model.BookedRoom;
import com.namrata.Model.Room;
import com.namrata.Repo.BookingRepository;

@Service
public class BookingService implements IBookingService {

	private BookingRepository bookingRepository;
	private final IRoomService roomService;

	public BookingService(BookingRepository bookingRepository, IRoomService roomService) {
		this.bookingRepository = bookingRepository;
		this.roomService = roomService;
	}

	public List<BookedRoom> getAllBookingsByRoomId(Long roomId) {
		// TODO Auto-generated method stub
		return bookingRepository.findByRoomId(roomId);
	}

	@Override
	public void cancelBooking(Long bookingId) {

		bookingRepository.deleteById(bookingId);

	}

	@Override
	public String saveBooking(Long roomId, BookedRoom bookingRequest) {
		// TODO Auto-generated method stub
		if (bookingRequest.getCheckOutDate().isBefore(bookingRequest.getCheckInDate())) {
			throw new InvalidBookingRequestException("Check-in date must come before check-out date");
		}

		Room room = roomService.getRoomById(roomId).get();

		List<BookedRoom> existingBookings = room.getBookings();
		System.out.println("hiiiiii");
		boolean roomIsAvailable = roomIsAvailable(bookingRequest, existingBookings);
		if (roomIsAvailable) {
			room.addBooking(bookingRequest);

			bookingRepository.save(bookingRequest);
		} else {
			throw new InvalidBookingRequestException("Sorry,This room is not available  for the selected dates:");
		}
		System.out.println("confirmation code=" + bookingRequest.getBookingConfirmationCode());
		return bookingRequest.getBookingConfirmationCode();

	}

	private boolean roomIsAvailable(BookedRoom bookingRequest, List<BookedRoom> existingBookings) {
		// TODO Auto-generated method stub
		return existingBookings.stream()
				.noneMatch(existingBooking -> bookingRequest.getCheckInDate().equals(existingBooking.getCheckInDate())
						|| bookingRequest.getCheckOutDate().isBefore(existingBooking.getCheckInDate())
						|| (bookingRequest.getCheckInDate().isAfter(existingBooking.getCheckInDate())
								&& bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckOutDate()))
						|| (bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckInDate())
								&& bookingRequest.getCheckOutDate().equals(existingBooking.getCheckOutDate()))
						|| (bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckInDate())

								&& bookingRequest.getCheckOutDate().isAfter(existingBooking.getCheckOutDate()))

						|| (bookingRequest.getCheckInDate().equals(existingBooking.getCheckOutDate())
								&& bookingRequest.getCheckOutDate().equals(existingBooking.getCheckInDate()))

						|| (bookingRequest.getCheckInDate().equals(existingBooking.getCheckOutDate())
								&& bookingRequest.getCheckOutDate().equals(bookingRequest.getCheckInDate()))

				);
	}

	@Override
	public BookedRoom findByBookingConfirmationCode(String confirmationCode) {
		// TODO Auto-generated method stub
		return bookingRepository.findByBookingConfirmationCode(confirmationCode).orElseThrow(
				() -> new ResourceNotFoundException("No Booking found with booking code:" + confirmationCode));
	}

	@Override
	public List<BookedRoom> getAllBookings() {
		// TODO Auto-generated method stub
		return bookingRepository.findAll();
	}

	@Override
	public List<BookedRoom> getBookingsByUserEmail(String email) {
		return bookingRepository.findByGuestEmail(email);
	}

}
