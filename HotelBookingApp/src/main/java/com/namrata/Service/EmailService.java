package com.namrata.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

/**
 * Thin, reusable wrapper around Spring's JavaMailSender. Nothing in here is
 * booking-specific on purpose, so it can be reused for any future
 * transactional email (password reset, etc.) without duplicating SMTP/MIME
 * plumbing. All SMTP configuration comes from application.properties /
 * environment variables (spring.mail.*) - no credentials are hardcoded here.
 */
@Service
public class EmailService {

	private static final Logger log = LoggerFactory.getLogger(EmailService.class);

	private final JavaMailSender mailSender;

	@Value("${hotel.mail.from:${spring.mail.username:no-reply@tajhotel.example}}")
	private String fromAddress;

	@Value("${hotel.mail.from-name:Taj Hotel}")
	private String fromName;

	public EmailService(JavaMailSender mailSender) {
		this.mailSender = mailSender;
	}

	/**
	 * Sends an HTML email, optionally with a single PDF attachment.
	 *
	 * @return true if the message was handed off to the mail server
	 *         successfully, false otherwise (never throws - callers decide how
	 *         to react to a failed send, e.g. still let the booking succeed).
	 */
	public boolean sendHtmlEmail(String to, String subject, String htmlBody, byte[] attachmentBytes,
			String attachmentFilename) {
		try {
			MimeMessage message = mailSender.createMimeMessage();
			// multipart=true is required as soon as we might attach a file.
			MimeMessageHelper helper = new MimeMessageHelper(message, attachmentBytes != null, "UTF-8");
			helper.setFrom(fromAddress, fromName);
			helper.setTo(to);
			helper.setSubject(subject);
			helper.setText(htmlBody, true);

			if (attachmentBytes != null && attachmentFilename != null) {
				helper.addAttachment(attachmentFilename,
						new org.springframework.core.io.ByteArrayResource(attachmentBytes));
			}

			mailSender.send(message);
			log.info("Email sent to {} - subject: {}", to, subject);
			return true;
		} catch (MailException | java.io.UnsupportedEncodingException | jakarta.mail.MessagingException e) {
			log.error("Failed to send email to {} (subject: {}): {}", to, subject, e.getMessage(), e);
			return false;
		}
	}
}
