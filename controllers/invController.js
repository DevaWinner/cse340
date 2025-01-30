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
		errors: null
	});
};

invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.inv_id
  const vehicle = await invModel.getInventoryById(inv_id)
  const detail = utilities.buildVehicleDetail(vehicle)
  const nav = await utilities.getNav()
  const vehicleTitle = vehicle.inv_make + " " + vehicle.inv_model
  res.render("./inventory/detail", {
    title: vehicleTitle,
    nav,
    detail,
    errors: null
  })
}

/* ****************************************
* Trigger intentional 500 error
* *************************************** */
invCont.triggerError = async function(req, res, next){
  throw new Error('Intentional 500 error triggered');
}

module.exports = invCont;