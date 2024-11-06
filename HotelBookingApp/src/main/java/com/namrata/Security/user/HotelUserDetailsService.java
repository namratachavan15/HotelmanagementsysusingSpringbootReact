package com.namrata.Security.user;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.namrata.Model.User;
import com.namrata.Repo.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HotelUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		
		User user=userRepository.findByEmail(email)
				.orElseThrow(()->new UsernameNotFoundException("User not found "));
		return HotelUserDetails.buildUserDeatils(user);
	}
	
}
