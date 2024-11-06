package com.namrata.Repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.namrata.Model.Role;

public interface RoleRepository  extends JpaRepository<Role,Long>{

  Optional<Role> findByName(String role);

   boolean existsByName(Role role);

}
