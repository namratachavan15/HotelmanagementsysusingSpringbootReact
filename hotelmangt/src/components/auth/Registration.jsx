import React, { useState } from 'react'
import { registerUser } from '../utils/ApiFunctions'
import { Link } from 'react-router-dom'
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa'
import logoMark from '../../assets/images/logo-mark.svg'

const Registration = () => {
	const [registration, setRegistration] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: ""
	})

	const [errorMessage, setErrorMessage] = useState("")
	const [successMessage, setSuccessMessage] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleInputChange = (e) => {
		setRegistration({ ...registration, [e.target.name]: e.target.value })
	}

	const handleRegistration = async (e) => {
		e.preventDefault()
		setIsSubmitting(true)
		try {
			const result = await registerUser(registration)
			setSuccessMessage(result)
			setErrorMessage("")
			setRegistration({ firstName: "", lastName: "", email: "", password: "" })
		} catch (error) {
			setSuccessMessage("")
			setErrorMessage(`Registration error : ${error.message}`)
		}
		setIsSubmitting(false)
		setTimeout(() => {
			setErrorMessage("")
			setSuccessMessage("")
		}, 5000)
	}

	return (
		<section className="auth-section">
			<div className="auth-panel">
				<div className="auth-panel-art">
					<div className="auth-panel-art-overlay">
						<img src={logoMark} alt="Taj Hotel logo" className="auth-panel-logo" />
						<h3>Join Taj Hotel</h3>
						<p>Create an account to book rooms in minutes and keep track of every stay.</p>
					</div>
				</div>

				<div className="auth-panel-form">
					<h2 className="registration-title">Register</h2>
					<p className="auth-subtitle">It only takes a moment to get started.</p>

					{errorMessage && <p className="alert alert-danger">{errorMessage}</p>}
					{successMessage && <p className="alert alert-success">{successMessage}</p>}

					<form onSubmit={handleRegistration}>
						<div className="row g-3">
							<div className="col-sm-6">
								<div className="form-group">
									<label htmlFor="firstName"><FaUser size={12} /> First name</label>
									<input
										id="firstName"
										name="firstName"
										type="text"
										className="form-control"
										placeholder="First name"
										value={registration.firstName}
										onChange={handleInputChange}
										required
									/>
								</div>
							</div>

							<div className="col-sm-6">
								<div className="form-group">
									<label htmlFor="lastName"><FaUser size={12} /> Last name</label>
									<input
										id="lastName"
										name="lastName"
										type="text"
										className="form-control"
										placeholder="Last name"
										value={registration.lastName}
										onChange={handleInputChange}
										required
									/>
								</div>
							</div>
						</div>

						<div className="form-group">
							<label htmlFor="email"><FaEnvelope size={12} /> Email</label>
							<input
								id="email"
								name="email"
								type="email"
								className="form-control"
								placeholder="you@example.com"
								value={registration.email}
								onChange={handleInputChange}
								required
							/>
						</div>

						<div className="form-group">
							<label htmlFor="password"><FaLock size={12} /> Password</label>
							<input
								id="password"
								name="password"
								type="password"
								className="form-control"
								placeholder="Create a password"
								value={registration.password}
								onChange={handleInputChange}
								required
							/>
						</div>

						<button type="submit" className="btn btn-hotel w-100 d-flex align-items-center justify-content-center gap-2" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
									Creating account…
								</>
							) : (
								<>
									<FaUserPlus size={14} /> Register
								</>
							)}
						</button>

						<div className="login-link">
							Already have an account? <Link to="/login">Login</Link>
						</div>
					</form>
				</div>
			</div>
		</section>
	)
}

export default Registration
