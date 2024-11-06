package com.namrata.Security;

import java.security.SecureRandom;
import java.util.Base64;

public class RandomStringGenerator {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		  SecureRandom random = new SecureRandom();
	        byte[] bytes = new byte[32]; // Adjust the length as per your requirements
	        random.nextBytes(bytes);
	        String randomString = Base64.getEncoder().encodeToString(bytes);
	        System.out.println("Random String: " + randomString);
	}

}
