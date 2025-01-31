const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
	const classification_id = req.params.classificationId;
	const data = await invModel.getInventoryByClassificationId(classification_id);
	const grid = await utilities.buildClassificationGrid(data);
	let nav = await utilities.getNav();
	const className = data[0].classification_name;
	res.render("./inventory/classification", {
		title: className + " vehicles",
		nav,
		grid,
		errors: null,
	});
};

invCont.buildByInvId = async function (req, res, next) {
	const inv_id = req.params.inv_id;
	const vehicle = await invModel.getInventoryById(inv_id);
	const detail = utilities.buildVehicleDetail(vehicle);
	const nav = await utilities.getNav();
	const vehicleTitle = vehicle.inv_make + " " + vehicle.inv_model;
	res.render("./inventory/detail", {
		title: vehicleTitle,
		nav,
		detail,
		errors: null,
	});
};

/* ****************************************
 * Trigger intentional 500 error
 * *************************************** */
invCont.triggerError = async function (req, res, next) {
	throw new Error("Intentional 500 error triggered");
};

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
	try {
		const nav = await utilities.getNav();
		const className = "Management";
		res.render("./inventory/management", {
			title: "Vehicle Management",
			nav,
			className,
			errors: null,
		});
	} catch (error) {
		error.status = 500;
		console.error("Error in buildManagementView:", error);
		next(error);
	}
};

invCont.buildAddClassification = async function (req, res, next) {
	const nav = await utilities.getNav();
	res.render("./inventory/add-classification", {
		title: "Add New Classification",
		nav,
		errors: null,
	});
};

invCont.buildAddInventory = async function (req, res, next) {
	const nav = await utilities.getNav();
	const classificationList = await utilities.buildClassificationList();
	res.render("./inventory/add-inventory", {
		title: "Add New Vehicle",
		nav,
		classificationList,
		errors: null,
	});
};

invCont.addClassification = async function (req, res, next) {
	const { classification_name } = req.body;
	const result = await invModel.addClassification(classification_name);

	if (result) {
		req.flash(
			"notice",
			`Classification ${classification_name} added successfully.`
		);
		res.redirect("/inv");
	} else {
		req.flash("error", "Adding classification failed.");
		res.status(501).render("inventory/add-classification", {
			title: "Add New Classification",
			nav: await utilities.getNav(),
			errors: null,
		});
	}
};

invCont.addInventory = async function (req, res, next) {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body

    const result = await invModel.addInventory({
      classification_id: parseInt(classification_id),
      inv_make,
      inv_model,
      inv_year: parseInt(inv_year),
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price: parseFloat(inv_price),
      inv_miles: parseInt(inv_miles),
      inv_color,
    })

    if (result.rowCount > 0) {
      req.flash("notice", `Vehicle ${inv_make} ${inv_model} added successfully.`)
      res.redirect("/inv")
    } else {
      req.flash("error", "Sorry, the addition failed.") // Change to error type
      res.render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav: await utilities.getNav(),
        classificationList: await utilities.buildClassificationList(classification_id),
        errors: null,
        // Preserve form data
        ...req.body
      })
    }
  } catch (error) {
    console.error("addInventory error:", error)
    req.flash("error", "Sorry, there was an error processing the request.") // Change to error type
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav: await utilities.getNav(),
      classificationList: await utilities.buildClassificationList(classification_id),
      errors: null,
      // Preserve form data
      ...req.body
    })
  }
}

module.exports = invCont;
