
package com.namrata.Response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {

    private Long id;

    private String username;

    private String email;

    private String token;

    private String type = "Bearer";

    private List<String> roles;

    public JwtResponse(
            Long id,
            String username,
            String email,
            String token,
            List<String> roles) {

        this.id = id;
        this.username = username;
        this.email = email;
        this.token = token;
        this.roles = roles;
    }
}

