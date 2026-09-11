package com.namrata.Repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.namrata.Model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
	Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

	/** Used to look up a booking's payment status/details for the invoice, the
	 *  confirmation email, and the booking list ("Payment status" column). */
	Optional<Payment> findByBookingConfirmationCode(String bookingConfirmationCode);
}
