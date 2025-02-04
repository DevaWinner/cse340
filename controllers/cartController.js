const cartModel = require("../models/cart-model");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

async function addToCart(req, res, next) {
	try {
		const { inv_id } = req.body;
		// If not logged in, redirect to login with flash message.
		if (!res.locals.loggedin) {
			req.flash("notice", "Please log in to add items to your cart.");
			return res.redirect("/account/login");
		}
		const accountData = res.locals.accountData;
		if (accountData.account_type !== "Client") {
			req.flash("notice", "Only clients can add items to the cart.");
			return res.redirect("back");
		}
		// Retrieve vehicle details for flash message.
		const vehicle = await invModel.getInventoryById(parseInt(inv_id));
		await cartModel.addItemToCart(accountData.account_id, parseInt(inv_id));
		req.flash(
			"notice",
			`Item added to cart: ${vehicle.inv_make} ${vehicle.inv_model}`
		);
		// Redirect back so that the flash message shows on the originating page.
		res.redirect("back");
	} catch (error) {
		next(error);
	}
}

async function viewCart(req, res, next) {
	try {
		const accountData = res.locals.accountData;
		if (!accountData || accountData.account_type !== "Client") {
			req.flash("notice", "Please log in as a client to view your cart.");
			return res.redirect("/account/login");
		}
		const cartItems = await cartModel.getCartItems(accountData.account_id);
		let total = 0;
		cartItems.forEach((item) => {
			total += parseFloat(item.inv_price) * item.quantity;
		});
		const formattedTotal = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		}).format(total);
		const nav = await utilities.getNav();
		res.render("cart/shoppingCart", {
			title: "Your Shopping Cart",
			nav,
			cartItems,
			total: formattedTotal,
			errors: null,
		});
	} catch (error) {
		next(error);
	}
}

async function checkoutView(req, res, next) {
	try {
		const accountData = res.locals.accountData;
		if (!accountData || accountData.account_type !== "Client") {
			req.flash("notice", "Please log in as a client to checkout.");
			return res.redirect("/account/login");
		}
		const cartItems = await cartModel.getCartItems(accountData.account_id);
		let total = 0;
		cartItems.forEach((item) => {
			total += parseFloat(item.inv_price) * item.quantity;
		});
		const formattedTotal = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		}).format(total);
		const nav = await utilities.getNav();
		res.render("cart/checkout", {
			title: "Checkout",
			nav,
			cartItems,
			total: formattedTotal,
			errors: null,
		});
	} catch (error) {
		next(error);
	}
}

async function removeFromCart(req, res, next) {
	try {
		const { cart_id } = req.body;
		const accountData = res.locals.accountData;
		if (!accountData || accountData.account_type !== "Client") {
			req.flash("notice", "Please log in as a client to modify your cart.");
			return res.redirect("/account/login");
		}
		const removedRow = await cartModel.removeItemFromCart(
			parseInt(cart_id),
			accountData.account_id
		);
		if (removedRow) {
			const vehicle = await invModel.getInventoryById(removedRow.inv_id);
			req.flash(
				"notice",
				`Item removed from cart: ${vehicle.inv_make} ${vehicle.inv_model}`
			);
		} else {
			req.flash("error", "Item removal failed.");
		}
		// Redirect back to the same page so that the flash message shows there.
		res.redirect("back");
	} catch (error) {
		next(error);
	}
}

async function placeOrder(req, res, next) {
	try {
		const accountData = res.locals.accountData;
		if (!accountData || accountData.account_type !== "Client") {
			req.flash("notice", "Please log in as a client to place an order.");
			return res.redirect("/account/login");
		}

		// Get cart items before clearing the cart
		const cartItems = await cartModel.getCartItems(accountData.account_id);
		if (!cartItems || cartItems.length === 0) {
			req.flash("notice", "Your cart is empty.");
			return res.redirect("/cart");
		}

		let total = 0;
		let vehicleNames = [];
		cartItems.forEach((item) => {
			total += parseFloat(item.inv_price) * item.quantity;
			vehicleNames.push(`${item.inv_make} ${item.inv_model} (x${item.quantity})`);
		});

		const formattedTotal = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		}).format(total);

		// Clear the cart first
		await cartModel.clearCartItems(accountData.account_id);

		// Then render the success page
		const nav = await utilities.getNav();
		res.render("cart/order-success", {
			title: "Order Success",
			nav,
			firstName: accountData.account_firstname,
			vehicleNames,
			total: formattedTotal,
			errors: null,
		});

		// Update cart count in session
		res.locals.cartCount = 0;

	} catch (error) {
		next(error);
	}
}

module.exports = {
	addToCart,
	viewCart,
	checkoutView,
	removeFromCart,
	placeOrder,
};
