import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logout from '../auth/Logout';
import { useAuth } from '../auth/AuthProvider';
import {
	FaSearch,
	FaUserCircle,
	FaShieldAlt,
	FaSignInAlt,
	FaUserPlus,
	FaPhoneAlt,
	FaEnvelope,
	FaConciergeBell,
	FaStar,
	FaArrowRight
} from 'react-icons/fa';

// New logo mark, drawn inline so this file is fully self-contained —
// a maroon medallion with a gold dome finial and a cream "TH" monogram.
// Swap this out any time for an <img src="..."/> if you'd rather use
// an image file instead.
const LogoMark = () => (
	<svg width="40" height="40" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<circle cx="21" cy="21" r="19.5" fill="#7A2E2A" stroke="#C9A227" strokeWidth="1.6" />
		<path
			d="M21 9.5c2 2.4 3.1 4.4 3.1 6 0 2-1.4 3.4-3.1 3.4s-3.1-1.4-3.1-3.4c0-1.6 1.1-3.6 3.1-6Z"
			fill="#E4C766"
		/>
		<text
			x="21"
			y="31.5"
			textAnchor="middle"
			fontFamily="Georgia, 'Times New Roman', serif"
			fontSize="13"
			fontWeight="700"
			fill="#FBF7EF"
			letterSpacing="0.5"
		>
			TH
		</text>
	</svg>
);

const NavBar = () => {
	const [showAccount, setShowAccount] = useState(false)

	const handleAccountClick = () => {
		setShowAccount(!showAccount)
	}

	// Reactive: comes from AuthContext, so the header updates the instant
	// a user logs in or out, without needing a full page refresh.
	const { isLoggedIn, userRole, username } = useAuth();
	//const userRole = localStorage.getItem("userRole")

	return (
		<>
			{/* Slim utility bar — contact details, rating & tagline, desktop only */}
			<div className="tj-topbar d-none d-lg-flex">
				<div className="container-fluid px-lg-5 d-flex justify-content-between align-items-center">
					<div className="tj-topbar-info">
						<a href="tel:+15550123456"><FaPhoneAlt size={11} /> +1 (555) 012-3456</a>
						<span className="tj-topbar-dot" aria-hidden="true">•</span>
						<a href="mailto:stay@tajhotel.com"><FaEnvelope size={11} /> stay@tajhotel.com</a>
					</div>
					<div className="tj-topbar-info">
						<span className="tj-topbar-rating"><FaStar size={11} /> 4.8 rated by 18k+ guests</span>
						<span className="tj-topbar-dot" aria-hidden="true">•</span>
						<span><FaConciergeBell size={11} /> 24/7 concierge, always at your service</span>
					</div>
				</div>
			</div>

			<nav className="navbar tj-navbar navbar-expand-lg px-3 px-lg-5 sticky-top">
				<div className="container-fluid">
					<Link to={"/"} className="navbar-brand tj-brand">
						<LogoMark />
						<span className="tj-brand-text">
							<span className="tj-brand-name">Taj Hotel</span>
							<span className="tj-brand-sub">Boutique &amp; Suites</span>
						</span>
					</Link>

					<button
						className="navbar-toggler tj-toggler"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target="#navbarScroll"
						aria-controls="navbarScroll"
						aria-expanded="false"
						aria-label="Toggle navigation">
						<span className="navbar-toggler-icon"></span>
					</button>

					<div className="collapse navbar-collapse" id="navbarScroll">
						<ul className="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll">
							<li className="nav-item">
								<NavLink className="nav-link" aria-current="page" to={"/browse-all-rooms"}>
									Browse all rooms
								</NavLink>
							</li>
							{isLoggedIn && userRole === "ROLE_ADMIN" && (
								<li className="nav-item">
									<NavLink className="nav-link" aria-current="page" to={"/admin"}>
										<FaShieldAlt size={14} /> Admin
									</NavLink>
								</li>
							)}
						</ul>

						<ul className="d-flex navbar-nav align-items-lg-center">

							{/* Find My Booking - Only logged-in normal users */}
							{isLoggedIn && userRole === "ROLE_USER" && (
								<li className="nav-item">
									<NavLink className="nav-link" to="/find-booking">
										<FaSearch size={14} /> Find my booking
									</NavLink>
								</li>
							)}

							<li className="nav-item dropdown">
								<a
									className={`nav-link dropdown-toggle tj-account-toggle ${
										showAccount ? "show" : ""
									} ${isLoggedIn ? "tj-account-toggle--active" : ""}`}
									href="#"
									role="button"
									data-bs-toggle="dropdown"
									aria-expanded="false"
									onClick={handleAccountClick}
								>
									<FaUserCircle size={16} />
									{isLoggedIn ? (username || "My account") : "Login"}
								</a>

								<ul
									className={`dropdown-menu dropdown-menu-end tj-dropdown ${
										showAccount ? "show" : ""
									}`}
									aria-labelledby="navbarDropdown"
								>
									{isLoggedIn ? (
										<Logout />
									) : (
										<>
											<li>
												<Link className="dropdown-item" to={"/login"}>
													<FaSignInAlt size={13} /> Login
												</Link>
											</li>

											<li>
												<Link className="dropdown-item" to={"/register"}>
													<FaUserPlus size={13} /> Register
												</Link>
											</li>
										</>
									)}
								</ul>
							</li>

							<li className="nav-item ms-lg-3 mt-2 mt-lg-0">
								<Link to={"/browse-all-rooms"} className="tj-cta">
									Book now <FaArrowRight size={11} />
								</Link>
							</li>

						</ul>
					</div>
				</div>
			</nav>

			<style>{`
				.tj-topbar {
					background-color: #14282A;
					color: rgba(255,255,255,0.82);
					font-family: 'Jost', 'Segoe UI', sans-serif;
					font-size: 0.78rem;
					padding: 0.5rem 0;
				}
				.tj-topbar-info { display: flex; align-items: center; gap: 0.65rem; }
				.tj-topbar-info a, .tj-topbar-info span { display: flex; align-items: center; gap: 0.4rem; color: inherit; text-decoration: none; }
				.tj-topbar-info a:hover { color: #E4C766; }
				.tj-topbar-rating { color: #E4C766; font-weight: 500; }
				.tj-topbar-dot { color: rgba(255,255,255,0.35); }
				.tj-topbar svg { color: #C9A227; flex-shrink: 0; }

				.tj-navbar {
					padding-top: 0;
					padding-bottom: 0;
					background-color: rgba(251, 247, 239, 0.95) !important;
					backdrop-filter: blur(10px);
					border-bottom: 2px solid transparent;
					border-image: linear-gradient(90deg, #7A2E2A, #C9A227, #7A2E2A) 1;
					transition: box-shadow .3s ease;
				}
				.tj-navbar.sticky-top { box-shadow: 0 6px 24px rgba(20,40,42,0.08); }

				.tj-brand { display: flex; align-items: center; gap: 0.7rem; }
				.tj-brand-text { display: flex; flex-direction: column; line-height: 1.1; }
				.tj-brand-name {
					font-family: 'Fraunces', Georgia, serif;
					font-size: 1.4rem;
					font-weight: 600;
					color: #7A2E2A;
				}
				.tj-brand-sub {
					font-family: 'Jost', 'Segoe UI', sans-serif;
					font-size: 0.68rem;
					letter-spacing: 0.06em;
					color: #6B6053;
				}
				.tj-brand:hover .tj-brand-name { color: #5E211E; }

				.tj-toggler { border-color: #E4DCC8 !important; box-shadow: none !important; }

				.tj-navbar .navbar-nav .nav-link {
					position: relative;
					padding: 1.15em 0.9em;
					color: #14282A;
					font-family: 'Jost', 'Segoe UI', sans-serif;
					font-weight: 500;
					font-size: 0.95rem;
					display: flex;
					align-items: center;
					gap: 0.4rem;
					transition: color .2s ease;
				}
				.tj-navbar .navbar-nav .nav-link::after {
					content: '';
					position: absolute;
					bottom: 6px;
					left: 0.9em;
					right: 0.9em;
					height: 2px;
					background-color: #C9A227;
					width: 0;
					transition: width .3s ease;
				}
				.tj-navbar .navbar-nav .nav-link:hover,
				.tj-navbar .navbar-nav .nav-link.active {
					color: #7A2E2A;
				}
				.tj-navbar .navbar-nav .nav-link:hover::after,
				.tj-navbar .navbar-nav .nav-link.active::after {
					width: calc(100% - 1.8em);
				}

				.tj-account-toggle {
					display: flex;
					align-items: center;
					gap: 0.4rem;
				}
				.tj-account-toggle::after { content: none; }
				.tj-account-toggle--active {
					color: #7A2E2A !important;
					font-weight: 600;
				}
				.tj-account-toggle--active svg { color: #C9A227; }

				.tj-dropdown {
					min-width: 210px;
					padding: 0.5rem;
					margin-top: 0.7rem;
					border: 1px solid #E4DCC8;
					border-radius: 12px;
					box-shadow: 0 12px 32px rgba(20,40,42,0.14);
				}
				.tj-dropdown .dropdown-item {
					display: flex;
					align-items: center;
					gap: 0.6rem;
					padding: 0.55rem 0.75rem;
					border-radius: 6px;
					font-family: 'Jost', 'Segoe UI', sans-serif;
					font-size: 0.92rem;
					font-weight: 500;
					color: #14282A;
				}
				.tj-dropdown .dropdown-item svg { color: #7A2E2A; flex-shrink: 0; }
				.tj-dropdown .dropdown-item:hover,
				.tj-dropdown .dropdown-item:focus {
					background-color: #F3ECDD;
					color: #7A2E2A;
				}
				.tj-dropdown .dropdown-divider { margin: 0.35rem 0.25rem; border-color: #E4DCC8; }

				.tj-cta {
					display: inline-flex;
					align-items: center;
					gap: 0.5rem;
					background-color: #7A2E2A;
					color: #FBF7EF;
					font-family: 'Jost', 'Segoe UI', sans-serif;
					font-weight: 500;
					font-size: 0.9rem;
					padding: 0.55rem 1.2rem;
					border-radius: 999px;
					text-decoration: none;
					transition: background-color .2s ease, transform .2s ease;
				}
				.tj-cta:hover { background-color: #5E211E; color: #E4C766; transform: translateY(-1px); }

				@media screen and (min-width: 992px) {
					.tj-navbar .navbar-nav .nav-link { padding: 1.4em 0.9em; }
				}
			`}</style>
		</>
	)
}

export default NavBar;
