import React, { useState } from "react"
import { loginUser } from "../utils/ApiFunctions"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "./AuthProvider"
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa"
import logoMark from "../../assets/images/logo-mark.svg"

const Login = () => {
	const [errorMessage, setErrorMessage] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [login, setLogin] = useState({
		email: "",
		password: ""
	})

	const navigate = useNavigate()
	const auth = useAuth()
	const location = useLocation()
	const redirectUrl = location.state?.path || "/"
	const infoMessage = location.state?.message

	const handleInputChange = (e) => {
		setLogin({ ...login, [e.target.name]: e.target.value })
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setIsSubmitting(true)
		const success = await loginUser(login)
		
if (success) {
    console.log("SUCCESS OBJECT:", success);
    console.log("SUCCESS USERNAME:", success.username);
    console.log("SUCCESS FULL NAME:", success.fullName);
    console.log("SUCCESS ROLE:", success.role);

    const token = success.token;

    auth.handleLogin(token, success);

    navigate(redirectUrl, { replace: true });
}

 else {
			setErrorMessage("Invalid username or password. Please try again.")
		}
		setIsSubmitting(false)
		setTimeout(() => {
			setErrorMessage("")
		}, 4000)
	}

	return (
		<section className="auth-section">
			<div className="auth-panel">
				<div className="auth-panel-art">
					<div className="auth-panel-art-overlay">
						<img src={logoMark} alt="Taj Hotel logo" className="auth-panel-logo" />
						<h3>Welcome back</h3>
						<p>Sign in to manage your bookings, view your stay history and check out faster.</p>
					</div>
				</div>

				<div className="auth-panel-form">
					<h2 className="login-title">Login</h2>
					<p className="auth-subtitle">Enter your details to access your account.</p>

					{infoMessage && <p className="alert alert-info">{infoMessage}</p>}
					{errorMessage && <p className="alert alert-danger">{errorMessage}</p>}

					<form onSubmit={handleSubmit}>
						<div className="form-group">
							<label htmlFor="email"><FaEnvelope size={13} /> Email</label>
							<input
								id="email"
								name="email"
								type="email"
								className="form-control"
								placeholder="you@example.com"
								value={login.email}
								onChange={handleInputChange}
								required
							/>
						</div>

						<div className="form-group">
							<label htmlFor="password"><FaLock size={13} /> Password</label>
							<input
								id="password"
								name="password"
								type="password"
								className="form-control"
								placeholder="Enter your password"
								value={login.password}
								onChange={handleInputChange}
								required
							/>
						</div>

						<button type="submit" className="btn btn-hotel w-100 d-flex align-items-center justify-content-center gap-2" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
									Signing in…
								</>
							) : (
								<>
									<FaSignInAlt size={14} /> Login
								</>
							)}
						</button>

						<div className="register-link">
							Don't have an account yet? <Link to="/register">Register</Link>
						</div>
					</form>
				</div>
			</div>
		</section>
	)
}

export default Login
