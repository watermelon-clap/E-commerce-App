const express = require('express')
const router = express.Router()
const db = require('./../db/dbconn')

//make purchase
router.post('/api/purchases', async (req, res) => {
    const userid = req.user.userid
    const { productid, quantity } = req.body;

    const connection = await db.getConnection()

    try{
        //validate stock
        const [pRows] = await connection.query(
            `SELECT * FROM products WHERE id_product = ?`,
            [productid]
        )

        if(!pRows.length) {

            await connection.rollback()
            return res.json({ success: false, message: "Product not found"})
        }

        if(parseInt(quantity) > pRows[0].stock ) {

            await connection.rollback()
            return res.json({ success: false, message: "Insufficient stock."})
        }

        const total_price = parseInt(quantity) * pRows[0].price

        //make purchase

        const [pR] = await connection.query(
            `INSERT INTO purchases(user_id, product_id, quantity, total_price)
            VALUES(?,?,?,?)
            `,
            [userid, productid, quantity, total_price]
        )

        if(!pR.affectedRows) {
            await connection.rollback()
            return res.json({ success: false, message: "Error while making purchase"})
        }

        //update stock

        const [uP] = await connection.query(
            `UPDATE products SET stock = stock -? WHERE id_product = ? AND stock >= ?`,
            [quantity, productid, quantity]
        )

        if(!uP.affectedRows) throw new Error()
        
        await connection.commit()

        return res.json({ success: true, message: "Purchase made successfully."})

        
    }
    catch(err) {
        await connection.rollback()
        console.error(err)
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    } finally {
       await connection.release()
    }
})

//edit purchase - change status 
router.patch('/api/purchases', async(req, res) => {
    const { purchaseid, status } = req.body
    const userid = req.user.userid

    try{
        const [eP] = await db.query(
            `UPDATE purchases SET status = ? WHERE id_purchase = ? AND user_id = ?`,
            [status, purchaseid, userid] 
        )

        if(!eP.affectedRows) return res.json({ success: false, message: "No changes were made."})
        
        return res.json({ success: true, message: "Purchase status updated successfully."})

    }
    catch(err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
})

//get purchases per user
router.get('/api/purchases', async(req, res) => {
    const userid = req.user.userid

    try{
        const [pRows] = await db.query(
            `SELECT pr.product_name, pr.price, pr.description,
            p.quantity, p.total_price, p.status
            FROM purchases p JOIN products pr ON p.product_id = pr.id_product
            WHERE p.user_id = ?`,
            [userid] 
        )

        if(!pRows.length) return res.json({ success: false, message: "No purchase found."})
        
        return res.json({ success: true, data: pRows})

    }
    catch(err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
})

//get individual purchases per user
router.get('/api/purchases/:idpurchase', async(req, res) => {
    const userid = req.user.userid
    const purchaseid = req.params.idpurchase

    try{
        const [pRows] = await db.query(
            `SELECT pr.product_name, pr.price, pr.description,
            p.quantity, p.total_price, p.status
            FROM purchases p JOIN products pr ON p.product_id = pr.id_product
            WHERE p.user_id = ? AND p.id_purchase = ?`,
            [userid, purchaseid] 
        )

        if(!pRows.length) return res.json({ success: false, message: "No purchase found."})
        
        return res.json({ success: true, data: pRows})

    }
    catch(err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
})

module.exports = router