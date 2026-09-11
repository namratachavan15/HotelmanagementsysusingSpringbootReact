package com.namrata.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyPaymentRequest {
	private String razorpayOrderId;
	private String razorpayPaymentId;
	private String razorpaySignature;
}
