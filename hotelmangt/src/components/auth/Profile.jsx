import React, { useEffect, useState } from 'react'
import { deleteUser, getUser } from '../utils/ApiFunctions'
import { useNavigate, Link } from 'react-router-dom';
import { FaClipboardList, FaArrowRight } from 'react-icons/fa'

const Profile = () => {
	const [user, setUser] = useState({
		id: "",
		email: "",
		firstName: "",
		lastName: "",
		roles: [{ id: "", name: "" }]
	})

	const [message, setMessage] = useState("")
	const [errorMessage, setErrorMessage] = useState("")
	const navigate = useNavigate()

	const userId = localStorage.getItem("userId")
	const userEmail = localStorage.getItem("userEmail")
	const token = localStorage.getItem("token")

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const userData = await getUser(userEmail, token)
				setUser(userData)
			} catch (error) {
				console.error(error)
			}
		}

		if (userEmail) {
			fetchUser()
		}
	}, [userEmail, token])

	const handleDeleteAccount = async () => {
		const confirmed = window.confirm(
			"Are you sure you want to delete your account? This action cannot be undone."
		)
		if (confirmed) {
			await deleteUser(userId)
				.then((response) => {
					setMessage(response.data)
					localStorage.removeItem("token")
					localStorage.removeItem("userId")
					localStorage.removeItem("userRole")
					navigate("/")
					window.location.reload()
				})
				.catch((error) => {
					setErrorMessage(error.data)
				})
		}
	}

	return (
		<div className="container">
			{errorMessage && <p className="text-danger">{errorMessage}</p>}
			{message && <p className="text-danger">{message}</p>}
			{user ? (
				<div className="card p-5 mt-5" style={{ backgroundColor: "whitesmoke" }}>
					<h4 className="card-title text-center">User Information</h4>
					<div className="card-body">
						<div className="col-md-10 mx-auto">
							<div className="card mb-3 shadow">
								<div className="row g-0">
									<div className="col-md-2">
										<div className="d-flex justify-content-center align-items-center mb-4">
											<img
												src="https://themindfulaimanifesto.org/wp-content/uploads/2020/09/male-placeholder-image.jpeg"
												alt="Profile"
												className="rounded-circle"
												style={{ width: "150px", height: "150px", objectFit: "cover" }}
											/>
										</div>
									</div>

									<div className="col-md-10">
										<div className="card-body">
											<div className="form-group row">
												<label className="col-md-2 col-form-label fw-bold">ID:</label>
												<div className="col-md-10">
													<p className="card-text">{user.id}</p>
												</div>
											</div>
											<hr />

											<div className="form-group row">
												<label className="col-md-2 col-form-label fw-bold">First Name:</label>
												<div className="col-md-10">
													<p className="card-text">{user.firstName}</p>
												</div>
											</div>
											<hr />

											<div className="form-group row">
												<label className="col-md-2 col-form-label fw-bold">Last Name:</label>
												<div className="col-md-10">
													<p className="card-text">{user.lastName}</p>
												</div>
											</div>
											<hr />

											<div className="form-group row">
												<label className="col-md-2 col-form-label fw-bold">Email:</label>
												<div className="col-md-10">
													<p className="card-text">{user.email}</p>
												</div>
											</div>
											<hr />

											<div className="form-group row">
												<label className="col-md-2 col-form-label fw-bold">Roles:</label>
												<div className="col-md-10">
													<ul className="list-unstyled">
														{user.roles.map((role) => (
															<li key={role.id} className="card-text">
																{role.name}
															</li>
														))}
													</ul>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Booking history now lives on its own dedicated page (My
						    Bookings) with filters, status badges, invoice download and
						    cancellation - this card just links there instead of
						    duplicating that table here. */}
						<div className="col-md-10 mx-auto">
							<div className="card mb-3 shadow p-4 d-flex flex-row align-items-center justify-content-between flex-wrap gap-3">
								<div className="d-flex align-items-center gap-3">
									<FaClipboardList size={28} className="hotel-color" />
									<div>
										<h5 className="mb-1">My Bookings</h5>
										<p className="mb-0 text-muted">View, download invoices for, or cancel your reservations.</p>
									</div>
								</div>
								<Link to="/my-bookings" className="btn btn-hotel d-flex align-items-center gap-2">
									View my bookings <FaArrowRight size={12} />
								</Link>
							</div>
						</div>

						<div className="d-flex justify-content-center">
							<div className="mx-2">
								<button className="btn btn-danger btn-sm" onClick={handleDeleteAccount}>
									Close account
								</button>
							</div>
						</div>
					</div>
				</div>
			) : (
				<p>Loading user data...</p>
			)}
		</div>
	)
}
export default Profile
