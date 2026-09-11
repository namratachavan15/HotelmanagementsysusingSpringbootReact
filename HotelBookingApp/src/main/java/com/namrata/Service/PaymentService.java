package com.namrata.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.namrata.Exception.InvalidBookingRequestException;
import com.namrata.Model.BookedRoom;
import com.namrata.Model.BookingStatus;
import com.namrata.Model.Payment;
import com.namrata.Repo.BookingRepository;
import com.namrata.Repo.PaymentRepository;
import com.namrata.request.CreateOrderRequest;
import com.namrata.request.VerifyPaymentRequest;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

import lombok.RequiredArgsConstructor;

/**
 * Handles Razorpay order creation and payment verification. Every attempt is
 * persisted to the payment table so payment details always live in the
 * database, whether the payment succeeds or fails.
 */
@Service
@RequiredArgsConstructor
public class PaymentService {

	private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

	private final PaymentRepository paymentRepository;
	private final BookingRepository bookingRepository;
	private final BookingConfirmationEmailService bookingConfirmationEmailService;

	@Value("${razorpay.key.id}")
	private String razorpayKeyId;

	@Value("${razorpay.key.secret}")
	private String razorpayKeySecret;

	public Map<String, Object> createOrder(CreateOrderRequest request) throws Exception {
		if (request.getAmount() == null || request.getAmount() <= 0) {
			throw new InvalidBookingRequestException("Payment amount must be greater than zero");
		}

		RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

		long amountInSmallestUnit = Math.round(request.getAmount() * 100);
		String currency = request.getCurrency() != null ? request.getCurrency() : "INR";

		JSONObject orderRequest = new JSONObject();
		orderRequest.put("amount", amountInSmallestUnit);
		orderRequest.put("currency", currency);
		orderRequest.put("receipt", "receipt_room_" + request.getRoomId() + "_" + System.currentTimeMillis());
		orderRequest.put("payment_capture", 1);

		Order order = razorpayClient.orders.create(orderRequest);

		Payment payment = new Payment();
		payment.setRazorpayOrderId(order.get("id"));
		payment.setAmount(request.getAmount());
		payment.setCurrency(currency);
		payment.setStatus("CREATED");
		payment.setRoomId(request.getRoomId());
		payment.setGuestEmail(request.getGuestEmail());
		payment.setGuestFullName(request.getGuestFullName());
		payment.setCheckInDate(request.getCheckInDate());
		payment.setCheckOutDate(request.getCheckOutDate());
		payment.setCreatedAt(LocalDateTime.now());
		paymentRepository.save(payment);

		Map<String, Object> response = new HashMap<>();
		response.put("orderId", order.get("id").toString());
		response.put("amount", amountInSmallestUnit);
		response.put("currency", currency);
		response.put("keyId", razorpayKeyId);
		response.put("paymentRecordId", payment.getId());
		System.out.println("guest emaail"+request.getGuestEmail());
		return response;
	}

	public Payment verifyPayment(VerifyPaymentRequest request) throws Exception {
		Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
				.orElseThrow(() -> new InvalidBookingRequestException("Payment order not found"));

		JSONObject options = new JSONObject();
		options.put("razorpay_order_id", request.getRazorpayOrderId());
		options.put("razorpay_payment_id", request.getRazorpayPaymentId());
		options.put("razorpay_signature", request.getRazorpaySignature());

		boolean isValidSignature = Utils.verifyPaymentSignature(options, razorpayKeySecret);

		if (isValidSignature) {
			payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
			payment.setRazorpaySignature(request.getRazorpaySignature());
			payment.setStatus("PAID");
		} else {
			// An invalid signature must never be able to confirm a booking - it
			// is recorded as FAILED and attachBookingConfirmation() below will
			// not mark any booking CONFIRMED or send an email for it.
			payment.setStatus("FAILED");
		}
		return paymentRepository.save(payment);
	}

	/**
	 * Links a verified payment to the booking confirmation code once the
	 * booking itself has been saved (see BookingController#saveBooking /
	 * ApiFunctions.js bookRoom, called right after this from the frontend).
	 *
	 * This is also the single point where, once payment.status is PAID, the
	 * booking is flipped from PENDING to CONFIRMED and the confirmation email
	 * (with the invoice PDF attached) is sent - never earlier, and never for a
	 * payment that isn't PAID.
	 */
	public Payment attachBookingConfirmation(Long paymentId, String confirmationCode) {
		Payment payment = paymentRepository.findById(paymentId)
				.orElseThrow(() -> new InvalidBookingRequestException("Payment not found"));
		payment.setBookingConfirmationCode(confirmationCode);
		final Payment savedPayment = paymentRepository.save(payment);

		if (!"PAID".equals(savedPayment.getStatus())) {
			log.info("attachBookingConfirmation: payment {} is not PAID (status={}), booking {} left as-is",
					paymentId, savedPayment.getStatus(), confirmationCode);
			return savedPayment;
		}

		bookingRepository.findByBookingConfirmationCode(confirmationCode).ifPresentOrElse(booking -> {
			booking.setBookingStatus(BookingStatus.CONFIRMED);
			bookingRepository.save(booking);

			try {
				bookingConfirmationEmailService.sendBookingConfirmationEmail(booking, savedPayment);
			} catch (Exception e) {
				// Email failures must never roll back or otherwise affect a
				// booking that is already confirmed and paid for.
				log.error("Unexpected error sending confirmation email for booking {}: {}", confirmationCode,
						e.getMessage(), e);
			}
		}, () -> log.warn("attachBookingConfirmation: no booking found for confirmation code {} (payment {})",
				confirmationCode, paymentId));

		return savedPayment;
	}
}
