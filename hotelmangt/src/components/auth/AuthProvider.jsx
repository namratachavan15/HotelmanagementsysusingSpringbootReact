
import React, { createContext, useState, useContext } from "react";
import jwtDecode from "jwt-decode";

export const AuthContext = createContext({
    user: null,
    username: null,
    userRole: null,
    isLoggedIn: false,
    handleLogin: () => {},
    handleLogout: () => {}
});

const getInitialUser = () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) return null;

        return jwtDecode(token);
    } catch (e) {
        return null;
    }
};

const getInitialRole = () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) return null;

        const decodedUser = jwtDecode(token);

        let role = decodedUser.roles;

        if (Array.isArray(role)) {
            role = role[0];
        }

        return role || null;
    } catch (e) {
        return null;
    }
};

const getInitialUsername = () => {
    return localStorage.getItem("username") || null;
};

export const AuthProvider = ({ children }) => {

    // Logged-in user
    const [user, setUser] = useState(getInitialUser);

    // Logged-in user's role
    const [userRole, setUserRole] = useState(getInitialRole);

    // Logged-in user's username
    const [username, setUsername] = useState(getInitialUsername);

   

const handleLogin = (token, loginResponse) => {
    const decodedUser = jwtDecode(token);

    console.log("AUTH LOGIN RESPONSE:", loginResponse);

    const role =
        loginResponse?.role ||
        loginResponse?.roles?.[0] ||
        null;

    const loggedUsername =
        loginResponse?.username ||
        loginResponse?.fullName ||
        loginResponse?.email ||
        null;

    console.log("AUTH USERNAME:", loggedUsername);
    console.log("AUTH ROLE:", role);

    localStorage.setItem(
        "userId",
        loginResponse?.id || decodedUser.sub
    );

    localStorage.setItem("userRole", role || "");
    localStorage.setItem("token", token);

    if (loginResponse?.email) {
        localStorage.setItem("userEmail", loginResponse.email);
    }

    if (loggedUsername) {
        localStorage.setItem("username", loggedUsername);
    }

    setUser(decodedUser);
    setUserRole(role);
    setUsername(loggedUsername);
};





    const handleLogout = () => {

        // Clear localStorage
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
localStorage.removeItem("userEmail")
        // Clear React state
        setUser(null);
        setUserRole(null);
        setUsername(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                username,
                userRole,
                isLoggedIn: !!user,
                handleLogin,
                handleLogout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

