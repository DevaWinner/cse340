"use strict";

document.addEventListener("DOMContentLoaded", function () {
	const checkoutForm = document.getElementById("checkoutForm");
	if (!checkoutForm) return;

	checkoutForm.addEventListener("submit", function (event) {
		let errors = [];

		// Retrieve and trim form values.
		const shipping_address = document
			.getElementById("shipping_address")
			.value.trim();
		const shipping_city = document.getElementById("shipping_city").value.trim();
		const shipping_state = document
			.getElementById("shipping_state")
			.value.trim();
		const shipping_zip = document.getElementById("shipping_zip").value.trim();
		const shipping_phone = document
			.getElementById("shipping_phone")
			.value.trim();

		// Client-side validation rules.
		if (!shipping_address) {
			errors.push("Shipping address is required.");
		}
		if (!shipping_city) {
			errors.push("City is required.");
		}
		if (shipping_state.length !== 2) {
			errors.push("State must be 2 characters (e.g., CA).");
		}
		// Simple US Zip code validation: 5 digits optionally followed by a dash and 4 digits.
		if (!/^\d{5}(-\d{4})?$/.test(shipping_zip)) {
			errors.push("Please provide a valid US zip code.");
		}
		// Validate phone number: exactly 10 digits.
		if (!/^\d{10}$/.test(shipping_phone)) {
			errors.push("Phone number must be 10 digits.");
		}

		if (errors.length > 0) {
			event.preventDefault();
			// Display errors in an alert (alternatively, you could display inline).
			alert(errors.join("\n"));
		}
	});
});
