package com.namrata.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.namrata.Exception.InternalServerException;
import com.namrata.Model.BookedRoom;
import com.namrata.Model.Payment;
import com.namrata.Repo.PaymentRepository;

/**
 * Generates the booking invoice as a PDF, using only real data pulled from
 * the database (the BookedRoom/Room/Payment entities) - nothing here is
 * static/fake, and the amounts are computed the exact same way for every
 * caller (email attachment, direct download) so the figure a guest sees in
 * their inbox always matches the one they can download later.
 */
@Service
public class InvoiceService {

	private static final Logger log = LoggerFactory.getLogger(InvoiceService.class);
	private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

	private final PaymentRepository paymentRepository;

	@Value("${hotel.name:Taj Hotel}")
	private String hotelName;

	@Value("${hotel.address:123 Marine Drive, Mumbai, Maharashtra, India}")
	private String hotelAddress;

	@Value("${hotel.contact.phone:+91-22-1234-5678}")
	private String hotelPhone;

	@Value("${hotel.contact.email:reservations@tajhotel.example}")
	private String hotelEmail;

	@Value("${invoice.tax.percent:12}")
	private BigDecimal taxPercent;

	@Value("${invoice.discount.percent:0}")
	private BigDecimal discountPercent;

	public InvoiceService(PaymentRepository paymentRepository) {
		this.paymentRepository = paymentRepository;
	}

	/** Deterministic, unique per booking - one invoice number per booking. */
	public String buildInvoiceNumber(BookedRoom booking) {
		return "TAJ-INV-" + String.format("%06d", booking.getBookingId());
	}

	/**
	 * Room price x nights x rooms, then discount, then tax - this is the single
	 * place that formula lives, so the email and the PDF (and, if reused
	 * later, any API response) always agree on the total.
	 */
	public PriceBreakdown computeBreakdown(BookedRoom booking) {
		long nights = Math.max(1, ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate()));
		BigDecimal pricePerNight = booking.getRoom().getRoomPrice() != null ? booking.getRoom().getRoomPrice()
				: BigDecimal.ZERO;
		int rooms = Math.max(1, booking.getNumberOfRooms());

		BigDecimal subtotal = pricePerNight.multiply(BigDecimal.valueOf(nights)).multiply(BigDecimal.valueOf(rooms));
		BigDecimal discount = subtotal.multiply(discountPercent).divide(BigDecimal.valueOf(100), 2,
				RoundingMode.HALF_UP);
		BigDecimal taxableAmount = subtotal.subtract(discount);
		BigDecimal tax = taxableAmount.multiply(taxPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
		BigDecimal total = taxableAmount.add(tax);

		return new PriceBreakdown(nights, pricePerNight, rooms, subtotal.setScale(2, RoundingMode.HALF_UP), discount,
				tax, total.setScale(2, RoundingMode.HALF_UP));
	}

	public byte[] generateInvoicePdf(BookedRoom booking) {
		PriceBreakdown breakdown = computeBreakdown(booking);
		Optional<Payment> payment = paymentRepository.findByBookingConfirmationCode(booking.getBookingConfirmationCode());

		Document document = new Document(PageSize.A4, 42, 42, 60, 60);
		try {
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			PdfWriter.getInstance(document, out);
			document.open();

			Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new BaseColor(0x7A, 0x2E, 0x2A));
			Font h2Font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new BaseColor(0x1F, 0x4B, 0x43));
			Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.DARK_GRAY);
			Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.BLACK);
			Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new BaseColor(0x7A, 0x2E, 0x2A));

			Paragraph brand = new Paragraph(hotelName, brandFont);
			document.add(brand);
			document.add(new Paragraph(hotelAddress, normalFont));
			document.add(new Paragraph("Phone: " + hotelPhone + "  |  Email: " + hotelEmail, normalFont));
			document.add(new Paragraph(" "));

			Paragraph invoiceTitle = new Paragraph("INVOICE", h2Font);
			document.add(invoiceTitle);
			document.add(new Paragraph(" "));

			PdfPTable metaTable = new PdfPTable(2);
			metaTable.setWidthPercentage(100);
			addKeyValueRow(metaTable, "Invoice Number", buildInvoiceNumber(booking), boldFont, normalFont);
			addKeyValueRow(metaTable, "Booking Confirmation Number", booking.getBookingConfirmationCode(), boldFont,
					normalFont);
			addKeyValueRow(metaTable, "Invoice Date", java.time.LocalDate.now().format(DATE_FMT), boldFont, normalFont);
			document.add(metaTable);
			document.add(new Paragraph(" "));

			document.add(new Paragraph("Guest Information", h2Font));
			PdfPTable guestTable = new PdfPTable(2);
			guestTable.setWidthPercentage(100);
			addKeyValueRow(guestTable, "Guest Name", booking.getGuestFullName(), boldFont, normalFont);
			addKeyValueRow(guestTable, "Email", booking.getGuestEmail(), boldFont, normalFont);
			document.add(guestTable);
			document.add(new Paragraph(" "));

			document.add(new Paragraph("Booking Information", h2Font));
			PdfPTable bookingTable = new PdfPTable(2);
			bookingTable.setWidthPercentage(100);
			addKeyValueRow(bookingTable, "Room Type", booking.getRoom().getRoomType(), boldFont, normalFont);
			addKeyValueRow(bookingTable, "Check-in Date", booking.getCheckInDate().format(DATE_FMT), boldFont, normalFont);
			addKeyValueRow(bookingTable, "Check-out Date", booking.getCheckOutDate().format(DATE_FMT), boldFont, normalFont);
			addKeyValueRow(bookingTable, "Number of Nights", String.valueOf(breakdown.nights), boldFont, normalFont);
			addKeyValueRow(bookingTable, "Number of Rooms", String.valueOf(breakdown.rooms), boldFont, normalFont);
			addKeyValueRow(bookingTable, "Adults", String.valueOf(booking.getNumOfAdults()), boldFont, normalFont);
			addKeyValueRow(bookingTable, "Children", String.valueOf(booking.getNumOfChildren()), boldFont, normalFont);
			addKeyValueRow(bookingTable, "Total Guests", String.valueOf(booking.getTotalNumOfGuest()), boldFont, normalFont);
			document.add(bookingTable);
			document.add(new Paragraph(" "));

			document.add(new Paragraph("Price Breakdown", h2Font));
			PdfPTable priceTable = new PdfPTable(2);
			priceTable.setWidthPercentage(100);
			addKeyValueRow(priceTable, "Room Price / Night", formatMoney(breakdown.pricePerNight), boldFont, normalFont);
			addKeyValueRow(priceTable, "Number of Rooms", String.valueOf(breakdown.rooms), boldFont, normalFont);
			addKeyValueRow(priceTable, "Number of Nights", String.valueOf(breakdown.nights), boldFont, normalFont);
			addKeyValueRow(priceTable, "Subtotal", formatMoney(breakdown.subtotal), boldFont, normalFont);
			addKeyValueRow(priceTable, "Discount", "- " + formatMoney(breakdown.discount), boldFont, normalFont);
			addKeyValueRow(priceTable, "Tax / GST (" + taxPercent + "%)", formatMoney(breakdown.tax), boldFont, normalFont);
			document.add(priceTable);

			Paragraph grandTotal = new Paragraph("Grand Total: " + formatMoney(breakdown.total), totalFont);
			grandTotal.setSpacingBefore(8);
			document.add(grandTotal);
			document.add(new Paragraph(" "));

			document.add(new Paragraph("Payment Information", h2Font));
			PdfPTable paymentTable = new PdfPTable(2);
			paymentTable.setWidthPercentage(100);
			String paymentStatus = payment.map(Payment::getStatus).orElse("PENDING");
			addKeyValueRow(paymentTable, "Payment Status", paymentStatus, boldFont, normalFont);
			addKeyValueRow(paymentTable, "Payment / Transaction ID",
					payment.map(Payment::getRazorpayPaymentId).filter(s -> s != null && !s.isBlank()).orElse("N/A"),
					boldFont, normalFont);
			addKeyValueRow(paymentTable, "Payment Date",
					payment.map(Payment::getCreatedAt).map(d -> d.toLocalDate().format(DATE_FMT)).orElse("N/A"),
					boldFont, normalFont);
			addKeyValueRow(paymentTable, "Payment Method", "Razorpay", boldFont, normalFont);
			document.add(paymentTable);
			document.add(new Paragraph(" "));

			document.add(new Paragraph("Booking Status: " + booking.getBookingStatus(), boldFont));
			document.add(new Paragraph(" "));

			Paragraph thankYou = new Paragraph("Thank you for choosing " + hotelName + ".", normalFont);
			thankYou.setAlignment(Element.ALIGN_CENTER);
			thankYou.setSpacingBefore(20);
			document.add(thankYou);

			document.close();
			return out.toByteArray();
		} catch (DocumentException e) {
			log.error("Failed to generate invoice PDF for booking {}: {}", booking.getBookingId(), e.getMessage(), e);
			throw new InternalServerException("Unable to generate invoice at this time");
		}
	}

	private void addKeyValueRow(PdfPTable table, String key, String value, Font keyFont, Font valueFont) {
		PdfPCell keyCell = new PdfPCell(new com.itextpdf.text.Phrase(key, keyFont));
		keyCell.setBorder(com.itextpdf.text.Rectangle.NO_BORDER);
		keyCell.setPaddingBottom(4);
		PdfPCell valueCell = new PdfPCell(new com.itextpdf.text.Phrase(value != null ? value : "-", valueFont));
		valueCell.setBorder(com.itextpdf.text.Rectangle.NO_BORDER);
		valueCell.setPaddingBottom(4);
		table.addCell(keyCell);
		table.addCell(valueCell);
	}

	private String formatMoney(BigDecimal amount) {
		return "\u20B9" + amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
	}

	/** Plain data holder shared between the PDF and the confirmation email. */
	public static class PriceBreakdown {
		public final long nights;
		public final BigDecimal pricePerNight;
		public final int rooms;
		public final BigDecimal subtotal;
		public final BigDecimal discount;
		public final BigDecimal tax;
		public final BigDecimal total;

		public PriceBreakdown(long nights, BigDecimal pricePerNight, int rooms, BigDecimal subtotal,
				BigDecimal discount, BigDecimal tax, BigDecimal total) {
			this.nights = nights;
			this.pricePerNight = pricePerNight;
			this.rooms = rooms;
			this.subtotal = subtotal;
			this.discount = discount;
			this.tax = tax;
			this.total = total;
		}
	}
}
