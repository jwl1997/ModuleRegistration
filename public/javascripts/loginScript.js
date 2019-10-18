function check(event) {
	// Get Values
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;

	document.getElementById('username_invalid').style.display = "none";
	document.getElementById('password_invalid').style.display = "none";
	
	// Simple Check
	if (username.length !== 8) {
		document.getElementById('username_invalid').style.display = "block";
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if (password.length < 6) {
		document.getElementById('password_invalid').style.display = "block";
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}