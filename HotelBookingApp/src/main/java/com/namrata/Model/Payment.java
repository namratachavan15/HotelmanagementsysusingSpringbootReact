package com.namrata.Model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Stores every payment gateway (Razorpay) transaction attempt so payment
 * details are persisted in the database independently of the existing
 * BookedRoom table. This is a purely additive entity — it does not touch
 * any existing table or relationship.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "razorpay_order_id", unique = true)
	private String razorpayOrderId;

	@Column(name = "razorpay_payment_id")
	private String razorpayPaymentId;

	@Column(name = "razorpay_signature")
	private String razorpaySignature;

	@Column(name = "amount")
	private Double amount;

	@Column(name = "currency")
	private String currency;

	/** CREATED, PAID, FAILED */
	@Column(name = "status")
	private String status;

	@Column(name = "room_id")
	private Long roomId;

	@Column(name = "guest_email")
	private String guestEmail;

	@Column(name = "guest_full_name")
	private String guestFullName;

	@Column(name = "check_in")
	private LocalDate checkInDate;

	@Column(name = "check_out")
	private LocalDate checkOutDate;

	@Column(name = "booking_confirmation_code")
	private String bookingConfirmationCode;

	@Column(name = "created_at")
	private LocalDateTime createdAt;
}
