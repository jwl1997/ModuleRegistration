function check(event) {
	// Get Values
	var username = document.getElementById('username').value;
	var password = document.getElementById('password').value;
	var first_name = document.getElementById('first_name').value;
	var last_name = document.getElementById('last_name').value;

	document.getElementById('username_invalid').style.display = "none";
	document.getElementById('password_invalid').style.display = "none";
	document.getElementById('first_name_invalid').style.display = "none";
	document.getElementById('last_name_invalid').style.display = "none";
	
	// Simple Check
	if (username.length != 8) {
		document.getElementById('username_invalid').style.display = "block";
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if (password.length < 10) {
		document.getElementById('password_invalid').style.display = "block";
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if (!first_name.match(/^[a-z ,.'-]+$/i)) {
		document.getElementById('first_name_invalid').style.display = "block";
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if (!last_name.match(/^[a-z ,.'-]+$/i)) {
		document.getElementById('last_name_invalid').style.display = "block";
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}