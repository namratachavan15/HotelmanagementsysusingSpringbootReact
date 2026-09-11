package com.namrata.request;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateOrderRequest {
	private Double amount;
	private String currency = "INR";
	private Long roomId;
	private String guestEmail;
	private String guestFullName;
	private LocalDate checkInDate;
	private LocalDate checkOutDate;
}
