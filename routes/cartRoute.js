const express = require("express");
const router = new express.Router();
const cartController = require("../controllers/cartController");
const utilities = require("../utilities");
const checkoutValidate = require("../utilities/checkout-validation");

router.post("/add", cartController.addToCart);
router.get("/", utilities.checkLogin, cartController.viewCart);
router.get("/checkout", utilities.checkLogin, cartController.checkoutView);
router.post("/remove", utilities.checkLogin, cartController.removeFromCart);
router.post(
	"/checkout",
	utilities.checkLogin,
	checkoutValidate.checkoutRules(),
	checkoutValidate.checkCheckoutData,
	cartController.placeOrder
);

module.exports = router;
