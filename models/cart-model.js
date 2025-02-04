const pool = require("../database/");

async function addItemToCart(account_id, inv_id) {
	try {
		// Check if the item already exists for the user.
		const checkSql = `
      SELECT * FROM cart
      WHERE account_id = $1 AND inv_id = $2
    `;
		const checkResult = await pool.query(checkSql, [account_id, inv_id]);
		if (checkResult.rowCount > 0) {
			// If exists, update quantity.
			const updateSql = `
        UPDATE cart
        SET quantity = quantity + 1, added_at = CURRENT_TIMESTAMP
        WHERE account_id = $1 AND inv_id = $2
        RETURNING *
      `;
			const updateResult = await pool.query(updateSql, [account_id, inv_id]);
			return updateResult.rows[0];
		} else {
			// Insert new row.
			const insertSql = `
        INSERT INTO cart (account_id, inv_id, quantity)
        VALUES ($1, $2, 1)
        RETURNING *
      `;
			const insertResult = await pool.query(insertSql, [account_id, inv_id]);
			return insertResult.rows[0];
		}
	} catch (error) {
		console.error("Error in addItemToCart:", error);
		throw error;
	}
}

async function getCartItems(account_id) {
	try {
		const sql = `
      SELECT c.cart_id, c.inv_id, c.quantity, i.inv_make, i.inv_model, i.inv_price, i.inv_thumbnail
      FROM cart c
      JOIN inventory i ON c.inv_id = i.inv_id
      WHERE c.account_id = $1
      ORDER BY c.added_at DESC
    `;
		const data = await pool.query(sql, [account_id]);
		return data.rows;
	} catch (error) {
		console.error("Error in getCartItems:", error);
		throw error;
	}
}

async function clearCartItems(account_id) {
	try {
		const sql = `
      DELETE FROM cart
      WHERE account_id = $1
    `;
		const data = await pool.query(sql, [account_id]);
		return data;
	} catch (error) {
		console.error("Error in clearCartItems:", error);
		throw error;
	}
}

async function removeCartItem(cart_id, account_id) {
	try {
		const sql = `
      DELETE FROM cart
      WHERE cart_id = $1 AND account_id = $2
      RETURNING *
    `;
		const data = await pool.query(sql, [cart_id, account_id]);
		return data.rows[0];
	} catch (error) {
		console.error("Error in removeCartItem:", error);
		throw error;
	}
}

async function getCartCount(account_id) {
	try {
		const sql = `
      SELECT SUM(quantity) AS count
      FROM cart
      WHERE account_id = $1
    `;
		const data = await pool.query(sql, [account_id]);
		return data.rows[0].count ? parseInt(data.rows[0].count) : 0;
	} catch (error) {
		console.error("Error in getCartCount:", error);
		throw error;
	}
}

module.exports = {
	addItemToCart,
	getCartItems,
	clearCartItems,
	removeCartItem,
	getCartCount,
};
