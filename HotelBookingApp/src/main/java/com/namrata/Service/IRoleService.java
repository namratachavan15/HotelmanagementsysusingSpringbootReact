package com.namrata.Service;

import java.util.List;

import com.namrata.Model.Role;
import com.namrata.Model.User;

public interface IRoleService {
	
	List<Role> getRoles();
	
	Role createRole(Role theRole);
	
	void deleteRole(Long id);
	
	Role findByName(String name);
	
	User removeUserFromRole(Long userId,Long roleId);
	
	User assignRoleToUser(Long userId,Long roleId);
	
	Role removeAllUsersFromRole(Long roleId);

}
