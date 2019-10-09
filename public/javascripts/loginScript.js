function check(event) {
	// Get Values
	var username = document.getElementById('username').value;
	var password = document.getElementById('password').value;
	
	// Simple Check
	if (username.length != 8) {
		alert("Invalid username! Use your NUSNET username.");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if (password.length < 10) {
		alert("Invalid password! Password must have at least 10 characters.");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}