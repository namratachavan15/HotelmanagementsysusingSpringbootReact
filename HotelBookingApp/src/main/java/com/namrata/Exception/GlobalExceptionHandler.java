package com.namrata.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Central place to turn our domain exceptions into sensible HTTP responses
 * with a readable message body. Without this, Spring Boot's default error
 * handling returns a generic 500 with no message for any RuntimeException,
 * which meant validation errors (e.g. "Room price must be greater than 0",
 * "Cannot reduce total rooms below N...") were invisible to the frontend for
 * any endpoint that didn't manually catch them.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(InvalidBookingRequestException.class)
	public ResponseEntity<String> handleInvalidRequest(InvalidBookingRequestException e) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
	}

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<String> handleNotFound(ResourceNotFoundException e) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
	}

	@ExceptionHandler(PhotoRetrievalException.class)
	public ResponseEntity<String> handlePhotoRetrieval(PhotoRetrievalException e) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
	}

	@ExceptionHandler(InternalServerException.class)
	public ResponseEntity<String> handleInternalServer(InternalServerException e) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
	}

	/**
	 * Thrown by BookingController when an authenticated guest tries to access
	 * (view/cancel/download the invoice of) a booking that isn't theirs. Gives
	 * a proper 403 + readable body instead of an empty response.
	 */
	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<String> handleAccessDenied(AccessDeniedException e) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
	}
}
