package com.namrata.Service;

import java.util.Collections;
import java.util.List;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.namrata.Exception.UserAlreadyExistsException;
import com.namrata.Model.Role;
import com.namrata.Model.User;
import com.namrata.Repo.RoleRepository;
import com.namrata.Repo.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

	private final UserRepository userRepo;
	private final PasswordEncoder passwordEncoder;
	private final RoleRepository roleRepository;

	@Override
	public User registerUser(User user) {
		// TODO Auto-generated method stub
		if (userRepo.existsByEmail(user.getEmail())) {
			throw new UserAlreadyExistsException(user.getEmail() + "already exits");
		}
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		Role userRole = roleRepository.findByName("ROLE_USER").get();
		user.setRoles(Collections.singletonList(userRole));
		return userRepo.save(user);
	}

	@Override
	public List<User> getUsers() {
		// TODO Auto-generated method stub
		return userRepo.findAll();
	}

	@Transactional
	@Override
	public void deleteUser(String email) {
		// TODO Auto-generated method stub
		User theUser = getUser(email);
		if (theUser != null) {
			userRepo.deleteByEmail(email);
		}

	}

	@Override
	public User getUser(String email) {
		// TODO Auto-generated method stub
		System.out.println("inside get user");
		return userRepo.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("User not found"));
	}

}
