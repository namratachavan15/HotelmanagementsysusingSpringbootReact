package com.namrata.Service;

import java.time.format.DateTimeFormatter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.namrata.Model.BookedRoom;
import com.namrata.Model.Payment;

/**
 * Builds and sends the "Booking Confirmed" email. This is called from
 * PaymentService#attachBookingConfirmation, i.e. only once a payment has
 * been verified as PAID and the booking has been marked CONFIRMED - never
 * before that point, so a failed/abandoned payment never triggers this
 * email.
 */
@Service
public class BookingConfirmationEmailService {

	private static final Logger log = LoggerFactory.getLogger(BookingConfirmationEmailService.class);
	private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

	private final EmailService emailService;
	private final InvoiceService invoiceService;

	@Value("${hotel.name:Taj Hotel}")
	private String hotelName;

	@Value("${hotel.contact.phone:+91-22-1234-5678}")
	private String hotelPhone;

	@Value("${hotel.contact.email:reservations@tajhotel.example}")
	private String hotelEmail;

	public BookingConfirmationEmailService(EmailService emailService, InvoiceService invoiceService) {
		this.emailService = emailService;
		this.invoiceService = invoiceService;
	}

	/**
	 * Sends the confirmation email to booking.getGuestEmail(), with the
	 * generated invoice PDF attached. Never throws - a failure here must never
	 * roll back or otherwise affect a booking that has already been confirmed
	 * and paid for; the caller just logs and moves on.
	 */
	public void sendBookingConfirmationEmail(BookedRoom booking, Payment payment) {
		if (booking.getGuestEmail() == null || booking.getGuestEmail().isBlank()) {
			log.warn("Skipping confirmation email for booking {} - no guest email on file",
					booking.getBookingConfirmationCode());
			return;
		}

		InvoiceService.PriceBreakdown breakdown = invoiceService.computeBreakdown(booking);
		byte[] invoicePdf;
		try {
			invoicePdf = invoiceService.generateInvoicePdf(booking);
		} catch (Exception e) {
			// Still send the email without the attachment rather than lose the
			// confirmation entirely because PDF generation had a problem.
			log.error("Could not attach invoice to confirmation email for booking {}: {}",
					booking.getBookingConfirmationCode(), e.getMessage(), e);
			invoicePdf = null;
		}

		String html = buildHtml(booking, payment, breakdown);
		String subject = "Booking Confirmed - " + hotelName + " (" + booking.getBookingConfirmationCode() + ")";
		String attachmentName = invoicePdf != null
				? "Taj-Hotel-Invoice-" + booking.getBookingConfirmationCode() + ".pdf"
				: null;

		boolean sent = emailService.sendHtmlEmail(booking.getGuestEmail(), subject, html, invoicePdf, attachmentName);
		if (sent) {
			log.info("Booking confirmation email sent to {} for booking {}", booking.getGuestEmail(),
					booking.getBookingConfirmationCode());
		} else {
			log.error("Booking confirmation email FAILED to send to {} for booking {}", booking.getGuestEmail(),
					booking.getBookingConfirmationCode());
		}
	}

	private String buildHtml(BookedRoom booking, Payment payment, InvoiceService.PriceBreakdown breakdown) {
		String paymentStatus = payment != null ? payment.getStatus() : "PENDING";
		String maroon = "#7A2E2A";
		String teal = "#1F4B43";
		String cream = "#FBF6EE";
		String gold = "#E4C766";

		StringBuilder html = new StringBuilder();
		html.append("<div style=\"font-family:Georgia,'Times New Roman',serif;background:").append(cream)
				.append(";padding:32px;color:#2b2b2b;\">");
		html.append("<div style=\"max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4dcc8;border-radius:8px;overflow:hidden;\">");

		html.append("<div style=\"background:").append(maroon)
				.append(";padding:24px 32px;text-align:center;\">");
		html.append("<h1 style=\"color:").append(gold).append(";margin:0;font-size:24px;letter-spacing:1px;\">")
				.append(hotelName).append("</h1>");
		html.append("<p style=\"color:#f5ead0;margin:4px 0 0;font-size:13px;letter-spacing:2px;\">BOOKING CONFIRMATION</p>");
		html.append("</div>");

		html.append("<div style=\"padding:28px 32px;\">");
		html.append("<p>Dear ").append(escape(booking.getGuestFullName())).append(",</p>");
		html.append("<p>Your hotel reservation has been successfully confirmed.</p>");

		html.append("<h3 style=\"color:").append(teal).append(";border-bottom:1px solid #e4dcc8;padding-bottom:6px;\">Booking Details</h3>");
		html.append("<table style=\"width:100%;font-size:14px;border-collapse:collapse;\">");
		appendRow(html, "Confirmation Code", booking.getBookingConfirmationCode());
		appendRow(html, "Room", escape(booking.getRoom().getRoomType()));
		appendRow(html, "Check-in", booking.getCheckInDate().format(DATE_FMT));
		appendRow(html, "Check-out", booking.getCheckOutDate().format(DATE_FMT));
		appendRow(html, "Nights", String.valueOf(breakdown.nights));
		appendRow(html, "Rooms", String.valueOf(breakdown.rooms));
		appendRow(html, "Adults", String.valueOf(booking.getNumOfAdults()));
		appendRow(html, "Children", String.valueOf(booking.getNumOfChildren()));
		appendRow(html, "Total Guests", String.valueOf(booking.getTotalNumOfGuest()));
		html.append("</table>");

		html.append("<h3 style=\"color:").append(teal).append(";border-bottom:1px solid #e4dcc8;padding-bottom:6px;margin-top:22px;\">Price Details</h3>");
		html.append("<table style=\"width:100%;font-size:14px;border-collapse:collapse;\">");
		appendRow(html, "Room Price / Night", formatMoney(breakdown.pricePerNight));
		appendRow(html, "Rooms", String.valueOf(breakdown.rooms));
		appendRow(html, "Nights", String.valueOf(breakdown.nights));
		appendRow(html, "Subtotal", formatMoney(breakdown.subtotal));
		appendRow(html, "Discount", "- " + formatMoney(breakdown.discount));
		appendRow(html, "Tax / GST", formatMoney(breakdown.tax));
		html.append("</table>");
		html.append("<p style=\"font-size:18px;font-weight:bold;color:").append(maroon)
				.append(";margin-top:10px;\">Grand Total: ").append(formatMoney(breakdown.total)).append("</p>");

		html.append("<table style=\"width:100%;font-size:14px;border-collapse:collapse;margin-top:10px;\">");
		appendRow(html, "Booking Status", String.valueOf(booking.getBookingStatus()));
		appendRow(html, "Payment Status", paymentStatus);
		html.append("</table>");

		html.append("<p style=\"margin-top:24px;\">Thank you for choosing ").append(hotelName).append(".</p>");
		html.append("<p style=\"font-size:12px;color:#6b6b6b;\">").append(hotelName).append(" &middot; ")
				.append(hotelPhone).append(" &middot; ").append(hotelEmail).append("</p>");
		html.append("</div></div></div>");
		return html.toString();
	}

	private void appendRow(StringBuilder html, String label, String value) {
		html.append("<tr>")
				.append("<td style=\"padding:4px 0;color:#6b6b6b;\">").append(escape(label)).append("</td>")
				.append("<td style=\"padding:4px 0;text-align:right;font-weight:bold;\">").append(escape(value))
				.append("</td>").append("</tr>");
	}

	private String formatMoney(java.math.BigDecimal amount) {
		return "\u20B9" + amount.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString();
	}

	private String escape(String value) {
		if (value == null) {
			return "";
		}
		return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
	}
}
