package com.namrata.Repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.namrata.Model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long>{

	boolean existsByEmail(String email);
	
  
	void deleteByEmail(String email);

	Optional<User> findByEmail(String email);

}
