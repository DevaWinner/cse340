const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
	let data = await invModel.getClassifications();
	let list = "<ul>";
	list += '<li><a href="/" title="Home page">Home</a></li>';
	data.rows.forEach((row) => {
		list += "<li>";
		list +=
			'<a href="/inv/type/' +
			row.classification_id +
			'" title="See our inventory of ' +
			row.classification_name +
			' vehicles">' +
			row.classification_name +
			"</a>";
		list += "</li>";
	});
	list += "</ul>";
	return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
	let grid = "";
	if (data.length > 0) {
		grid = '<ul class="inv-display">';
		data.forEach((vehicle) => {
			grid += `
        <li class="grid-item">
          <a 
            href="../../inv/detail/${vehicle.inv_id}" 
            title="View ${vehicle.inv_make} ${vehicle.inv_model} details"
          >
            <img
              src="${vehicle.inv_thumbnail}"
              alt="Image of ${vehicle.inv_make} ${
				vehicle.inv_model
			} on CSE Motors"
              class="vehicle-thumbnail"
            />
          </a>
          <div class="namePrice">
            <hr />
            <h2>
              <a 
                href="../../inv/detail/${vehicle.inv_id}"
                title="View ${vehicle.inv_make} ${vehicle.inv_model} details"
              >
                ${vehicle.inv_make} ${vehicle.inv_model}
              </a>
            </h2>
            <span>$${new Intl.NumberFormat("en-US").format(
							vehicle.inv_price
						)}</span>
          </div>
        </li>`;
		});
		grid += "</ul>";
	} else {
		grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
	}
	return grid;
};

/* **************************************
 * Build the vehicle detail view HTML
 * ************************************ */
Util.buildVehicleDetail = function (vehicle) {
	return `
    <div id="vehicle-detail">
      <figure class="vehicle-image">
        <img 
          src="${vehicle.inv_image}" 
          alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" 
        />
      </figure>
      <div class="vehicle-info">
        <!-- Page title could also be updated dynamically on the server-side 
             but here's the main heading: -->
        <h2 class="vehicle-title">${vehicle.inv_year} ${vehicle.inv_make} ${
		vehicle.inv_model
	}</h2>

        <p class="vehicle-price">
          <strong>Price:</strong> 
          $${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}
        </p>
        <p class="vehicle-mileage">
          <strong>Mileage:</strong> 
          ${new Intl.NumberFormat("en-US").format(vehicle.inv_miles)} miles
        </p>
        <p class="vehicle-description">
          <strong>Description:</strong> 
          ${vehicle.inv_description}
        </p>
        <p class="vehicle-color">
          <strong>Color:</strong> 
          ${vehicle.inv_color}
        </p>
      </div>
    </div>
  `;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
	Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
