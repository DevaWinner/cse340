const { body, validationResult } = require("express-validator");
const utilities = require(".");

const validate = {};

validate.checkoutRules = () => {
	return [
		body("shipping_address")
			.trim()
			.notEmpty()
			.withMessage("Shipping address is required."),
		body("shipping_city").trim().notEmpty().withMessage("City is required."),
		body("shipping_state")
			.trim()
			.isLength({ min: 2, max: 2 })
			.withMessage("State must be 2 characters (e.g., CA)."),
		body("shipping_zip")
			.trim()
			.isPostalCode("US")
			.withMessage("Please provide a valid US zip code."),
		body("shipping_phone")
			.trim()
			.matches(/^\d{10}$/)
			.withMessage("Phone number must be 10 digits."),
	];
};

validate.checkCheckoutData = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const nav = await utilities.getNav();
		res.render("cart/checkout", {
			title: "Checkout",
			nav,
			errors: errors.array(),
			shipping_address: req.body.shipping_address,
			shipping_city: req.body.shipping_city,
			shipping_state: req.body.shipping_state,
			shipping_zip: req.body.shipping_zip,
			shipping_phone: req.body.shipping_phone,
			total: req.body.total || "0.00",
		});
		return;
	}
	next();
};

module.exports = validate;
