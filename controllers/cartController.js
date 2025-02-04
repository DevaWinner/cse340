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
		// Only Clients may add items to the cart.
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

		// Format total using Intl.NumberFormat:
		const formatter = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		});
		const formattedTotal = formatter.format(total);
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

async function removeFromCart(req, res, next) {
	try {
		const { cart_id } = req.body;
		const accountData = res.locals.accountData;
		if (!accountData || accountData.account_type !== "Client") {
			req.flash("notice", "Please log in as a client to modify your cart.");
			return res.redirect("/account/login");
		}
		await cartModel.removeCartItem(parseInt(cart_id), accountData.account_id);
		req.flash("notice", "Item removed from cart.");
		res.redirect("/cart");
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
		const formatter = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		});
		const formattedTotal = formatter.format(total);
		const nav = await utilities.getNav();
		res.render("cart/checkout", {
			title: "Checkout",
			nav,
			total: formattedTotal,
			errors: null,
		});
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
		const {
			shipping_address,
			shipping_city,
			shipping_state,
			shipping_zip,
			shipping_phone,
		} = req.body;

		// Retrieve cart items.
		const cartItems = await cartModel.getCartItems(accountData.account_id);
		if (!cartItems || cartItems.length === 0) {
			req.flash("notice", "Your cart is empty.");
			return res.redirect("/cart");
		}
		let total = 0;
		let vehicleNames = [];
		cartItems.forEach((item) => {
			total += parseFloat(item.inv_price) * item.quantity;
			vehicleNames.push(
				`${item.inv_make} ${item.inv_model} (x${item.quantity})`
			);
		});
		const formatter = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		});
		const formattedTotal = formatter.format(total);

    // Clear the cart.
		await cartModel.clearCartItems(accountData.account_id);
		const nav = await utilities.getNav();
		res.render("cart/order-success", {
			title: "Order Success",
			nav,
			firstName: accountData.account_firstname,
			vehicleNames,
			total: formattedTotal,
			errors: null,
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	addToCart,
	viewCart,
	removeFromCart,
	checkoutView,
	placeOrder,
};
