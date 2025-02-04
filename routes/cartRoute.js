const express = require("express");
const router = new express.Router();
const cartController = require("../controllers/cartController");
const utilities = require("../utilities");
const checkoutValidate = require("../utilities/checkout-validation");

// Route to add an item to the cart (available to all; controller redirects if not logged in)
router.post("/add", cartController.addToCart);

// Route to view the shopping cart (requires login)
router.get("/", utilities.checkLogin, cartController.viewCart);

// Route to remove an item from the cart (requires login)
router.post("/remove", utilities.checkLogin, cartController.removeFromCart);

// Route to display the checkout form (requires login)
router.get("/checkout", utilities.checkLogin, cartController.checkoutView);

// Route to process the checkout and place the order (requires login)
// Add checkout validation middleware.
router.post(
	"/checkout",
	utilities.checkLogin,
	checkoutValidate.checkoutRules(),
	checkoutValidate.checkCheckoutData,
	cartController.placeOrder
);

module.exports = router;
