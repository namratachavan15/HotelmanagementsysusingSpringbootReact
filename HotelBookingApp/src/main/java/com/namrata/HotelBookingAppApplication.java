package com.namrata;

import java.security.Key;
import java.util.Base64;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;


@SpringBootApplication
public class HotelBookingAppApplication {

	public static void main(String[] args) {

		Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
		String base64EncodedKey = Base64.getEncoder().encodeToString(key.getEncoded());
		System.out.println("JWT Secret Key: " + base64EncodedKey);
		SpringApplication.run(HotelBookingAppApplication.class, args);

	}

}
