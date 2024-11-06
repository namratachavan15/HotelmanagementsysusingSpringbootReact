package com.namrata.Security.jwt;
import io.jsonwebtoken.ExpiredJwtException;
import java.awt.RenderingHints.Key;
import java.util.Base64.Decoder;
import java.util.Date;
import java.util.List;

import org.apache.catalina.authenticator.SpnegoAuthenticator.AuthenticateAction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import com.namrata.Security.user.HotelUserDetails;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtils {
	
	private static final Logger logger=LoggerFactory.getLogger(JwtUtils.class);
	
	@Value("${auth.token.jwtSecret}")
	private String jwtSecret;
	
	@Value("${auth.token.expirationInMills}")
	private int jwtExpirationTime;
	
	
	public String generateJwtTokenForUser(Authentication authentication) {
	    HotelUserDetails userPrincipal = (HotelUserDetails) authentication.getPrincipal();
	    List<String> roles = userPrincipal.getAuthorities()
	            .stream()
	            .map(GrantedAuthority::getAuthority).toList();
	    java.security.Key key = key();
	    String token = Jwts.builder()
	            .setSubject(userPrincipal.getUsername())
	            .claim("roles", roles)
	            .setIssuedAt(new Date())
	            .setExpiration(new Date((new Date()).getTime() + jwtExpirationTime))
	            .signWith(key, SignatureAlgorithm.HS256)
	            .compact();
	    
	    // Log the generated token and its expiration time
	    logger.info("Generated JWT token for user {}: {}", userPrincipal.getUsername(), token);
	    logger.info("Token expiration time: {}", new Date((new Date()).getTime() + jwtExpirationTime));
	    
	    return token;
	  
	}



	private java.security.Key key() {
		// TODO Auto-generated method stub
		return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
		
	}
	
	public String getUserNameFromToken(String token)
	{
		return Jwts.parserBuilder()
				.setSigningKey(key())
				.build()
				.parseClaimsJws(token).getBody().getSubject();
	}
	
	public boolean validateToken(String token) {
	    try {
	        Jwts.parserBuilder().setSigningKey(key()).build().parse(token);
	        return true;
	    } catch (ExpiredJwtException e) {
	        logger.error("JWT expired: {}", e.getMessage());
	        return false;
	    } catch (MalformedJwtException | UnsupportedJwtException | IllegalArgumentException e) {
	        logger.error("Invalid JWT token: {}", e.getMessage());
	        return false;
	    }
	}


}
