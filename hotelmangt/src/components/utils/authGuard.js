// Shared "Book now" click guard used across the site.
// Logged-in users go straight to the room checkout page.
// Guests are redirected to /login, and Login.jsx already knows how to
// send them on to the page they originally wanted (location.state.path).
export const goToBookRoom = (e, navigate, roomId) => {
	e.preventDefault()
	const isLoggedIn = !!localStorage.getItem("token")
	const bookingPath = `/book-room/${roomId}`

	if (isLoggedIn) {
		navigate(bookingPath)
	} else {
		navigate("/login", {
			state: {
				path: bookingPath,
				message: "Please login to continue with your booking."
			}
		})
	}
}
