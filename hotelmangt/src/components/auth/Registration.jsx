import React, { useState } from 'react'
import { registerUser } from '../utils/ApiFunctions'
import { Link } from 'react-router-dom'


const Registration = () => {
	const [registration, setRegistration] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: ""
	})

	const [errorMessage, setErrorMessage] = useState("")
	const [successMessage, setSuccessMessage] = useState("")

	const handleInputChange = (e) => {
		setRegistration({ ...registration, [e.target.name]: e.target.value })
	}

	const handleRegistration = async (e) => {
		e.preventDefault()
		try {
			const result = await registerUser(registration)
			setSuccessMessage(result)
			setErrorMessage("")
			setRegistration({ firstName: "", lastName: "", email: "", password: "" })
		} catch (error) {
			setSuccessMessage("")
			setErrorMessage(`Registration error : ${error.message}`)
		}
		setTimeout(() => {
			setErrorMessage("")
			setSuccessMessage("")
		}, 5000)
	}

	return (
		<section className="registration-container">
			<div className="registration-card">
				<h2 className="registration-title">Register</h2>
				{errorMessage && <p className="alert alert-danger">{errorMessage}</p>}
				{successMessage && <p className="alert alert-success">{successMessage}</p>}
				<form onSubmit={handleRegistration}>
					<div className="form-group">
						<label htmlFor="firstName">First Name</label>
						<input
							id="firstName"
							name="firstName"
							type="text"
							className="form-control"
							value={registration.firstName}
							onChange={handleInputChange}
						
						/>
					</div>

					<div className="form-group">
						<label htmlFor="lastName">Last Name</label>
						<input
							id="lastName"
							name="lastName"
							type="text"
							className="form-control"
							value={registration.lastName}
							onChange={handleInputChange}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input
							id="email"
							name="email"
							type="email"
							className="form-control"
							value={registration.email}
							onChange={handleInputChange}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password">Password</label>
						<input
							id="password"
							name="password"
							type="password"
							className="form-control"
							value={registration.password}
							onChange={handleInputChange}
						/>
					</div>

					<button type="submit" className="btn btn-primary">
						Register
					</button>
					<div className="login-link">
						Already have an account? <Link to="/login">Login</Link>
					</div>
				</form>
			</div>
		</section>
	)
}

export default Registration
