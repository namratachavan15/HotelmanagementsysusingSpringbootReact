package com.namrata.Model;

/**
 * Mirrors the values already stored (as plain strings) in Payment#status.
 * Kept as an enum here purely so email/invoice code and any future DTOs have
 * a typed, compile-time-checked way to reason about payment state instead of
 * comparing raw strings everywhere. Payment#status itself is left as a
 * String (see Payment.java) so no existing Razorpay integration code or
 * column has to change.
 */
public enum PaymentStatus {
	PENDING,
	PAID,
	FAILED,
	REFUNDED;

	/** Maps Payment#status ("CREATED"/"PAID"/"FAILED"/...) to this enum. */
	public static PaymentStatus fromRaw(String raw) {
		if (raw == null) {
			return PENDING;
		}
		switch (raw.toUpperCase()) {
			case "PAID":
				return PAID;
			case "FAILED":
				return FAILED;
			case "REFUNDED":
				return REFUNDED;
			case "CREATED":
			default:
				return PENDING;
		}
	}
}
