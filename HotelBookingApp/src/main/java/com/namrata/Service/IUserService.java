package com.namrata.Service;

import java.util.List;

import com.namrata.Model.User;

public interface IUserService {

	User registerUser(User user);
	List<User> getUsers();
	
	void deleteUser(String email);
	
	User getUser(String email);
}
