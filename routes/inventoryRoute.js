// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

// Route to management view - move this to the top of routes
router.get("/", utilities.handleErrors(invController.buildManagementView));

// Route to get inventory JSON data - move this near the top, after the management view route
router.get("/getInventory/:classification_id", 
  utilities.handleErrors(invController.getInventoryJSON)
);

// Route to build inventory by classification view
router.get(
	"/type/:classificationId",
	utilities.handleErrors(invController.buildByClassificationId)
);

// Route to serve a single vehicle detail page
router.get(
	"/detail/:inv_id",
	utilities.handleErrors(invController.buildByInvId)
);

// Route to test server error handling
router.get(
	"/trigger-error",
	utilities.handleErrors(invController.triggerError)
);

// Route to add classification view
router.get(
	"/add-classification",
	utilities.handleErrors(invController.buildAddClassification)
);

// Route to edit inventory view
router.get("/edit/:inv_id", 
  utilities.handleErrors(invController.editInventoryView)
);

// Route to add inventory view
router.get(
	"/add-inventory",
	utilities.handleErrors(invController.buildAddInventory)
);

// Process adding classification with validation
router.post(
	"/add-classification",
	invValidate.classificationRules(),
	invValidate.checkData,
	utilities.handleErrors(invController.addClassification)
);

// Process adding inventory with validation
router.post(
	"/add-inventory",
	invValidate.inventoryRules(),
	invValidate.checkData,
	utilities.handleErrors(invController.addInventory)
);

// Route to update inventory
router.post(
  "/update/",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

module.exports = router;
