package com.namrata.Controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.namrata.Model.Payment;
import com.namrata.Service.PaymentService;
import com.namrata.request.CreateOrderRequest;
import com.namrata.request.VerifyPaymentRequest;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = { "http://localhost:3000" })
@RequiredArgsConstructor
@RestController
@RequestMapping("/payments")
public class PaymentController {

	private final PaymentService paymentService;

	/** Creates a Razorpay order and stores a CREATED payment record. */
	@PostMapping("/create-order")
	public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
		try {
			Map<String, Object> order = paymentService.createOrder(request);
			return ResponseEntity.ok(order);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("Unable to create payment order: " + e.getMessage());
		}
	}

	/** Verifies the Razorpay signature returned by the checkout widget. */
	@PostMapping("/verify")
	public ResponseEntity<?> verifyPayment(@RequestBody VerifyPaymentRequest request) {
		try {
			Payment payment = paymentService.verifyPayment(request);
			if (!"PAID".equals(payment.getStatus())) {
				return ResponseEntity.badRequest().body("Payment verification failed");
			}
			return ResponseEntity.ok(Map.of(
					"paymentId", payment.getId(),
					"status", payment.getStatus()));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("Payment verification error: " + e.getMessage());
		}
	}

	/** Links a verified payment to the booking confirmation code once the booking is saved. */
	@PutMapping("/{paymentId}/attach-booking")
	public ResponseEntity<?> attachBooking(@PathVariable Long paymentId, @RequestParam String confirmationCode) {
		try {
			paymentService.attachBookingConfirmation(paymentId, confirmationCode);
			return ResponseEntity.ok("Payment linked to booking");
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}
}
