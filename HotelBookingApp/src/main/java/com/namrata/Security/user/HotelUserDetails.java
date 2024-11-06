package com.namrata.Security.user;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;


import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.databind.ser.std.UUIDSerializer;
import com.namrata.Model.User;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class HotelUserDetails  implements UserDetails{

	private Long id;
	private String email;
	private String password;
	
	private Collection<GrantedAuthority> authorities;
	
	
	public static HotelUserDetails buildUserDeatils(User user)
	{
		List<GrantedAuthority> authorities=user.getRoles()
				.stream()
				.map(role-> new SimpleGrantedAuthority(role.getName()))
				.collect(Collectors.toList());
		
		return new HotelUserDetails(
				user.getId(),
				user.getEmail(),
				user.getPassword(),
				authorities);
	}
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		// TODO Auto-generated method stub
		return authorities;
	}

	@Override
	public String getPassword() {
		// TODO Auto-generated method stub
		return password;
	}

	@Override
	public String getUsername() {
		// TODO Auto-generated method stub
		return email;
	}

	@Override
	public boolean isAccountNonExpired() {
		// TODO Auto-generated method stub
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		// TODO Auto-generated method stub
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		// TODO Auto-generated method stub
		return true;
	}

	@Override
	public boolean isEnabled() {
		// TODO Auto-generated method stub
		return true;
	}

}
