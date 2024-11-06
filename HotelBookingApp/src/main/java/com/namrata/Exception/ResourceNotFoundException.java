package com.namrata.Exception;

public class ResourceNotFoundException extends RuntimeException {
	
	public ResourceNotFoundException(String messageString) {
		super(messageString);
	}

}
