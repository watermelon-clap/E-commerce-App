const express = require('express')
const router = express.Router()
const db = require('./../db/dbconn')
const verifyToken = require('./../middlewares/verifytoken')

//add products
router.post('/api/products', verifyToken, async(req, res) => {
    const { productname, stock, price, description } = req.body 

    if(!productname) return res.json({ success: false, message: "Product name can not be null"})

    try {

        const [aR] = await db.query(
            `INSERT INTO products(product_name, price, stock, description) VALUES(?,?,?,?)
            ON DUPLICATE KEY UPDATE 
            stock = stock + ?,
            price = VALUES(price),
            description = VALUES(description)
            `,
            [productname, price, stock, description,stock ]
        )

        if(!aR.affectedRows) return res.json({ success: false, message: "Error adding product"})
        return res.json({ success: true, message: "Product added successfully"})

    }
    catch(err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
})

//get products per page
router.get('/api/products', async (req, res) => {
    let page = parseInt(req.query.page) || 1
    let limit = parseInt(req.query.limit) || 10

    if(page < 1) page = 1
    if(limit <1 || limit > 100) limit = 10

    let offset = (page - 1) * limit

    try {
        const [pRows] = await db.query(
            `SELECT * FROM products ORDER BY id_product DESC
            LIMIT ? OFFSET ?`,
            [limit, offset]
        )

        if(!pRows.length) return res.json({ success: false, message: "No product found"})
        return res.json({ success: true, data: pRows, page: page })
    }
    catch(err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
})

//get each product
router.get('/api/products/:id', async (req, res) => {
    
    const id_product = parseInt(req.params.id)

    try {
        const [pRows] = await db.query(
            `SELECT * FROM products WHERE id_product =? `,
            [id_product]
        )

        if(!pRows.length) return res.json({ success: false, message: "No product found"})
        return res.json({ success: true, data: pRows[0] })
    }
    catch(err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
})

//edit products
router.patch('/api/products', verifyToken, async(req, res) => {
    const {product_id, productname, price, stock, description} = req.body

    try {
        const [uP] = await db.query(
            `UPDATE products SET product_name = ?, price =?, stock = ?, description = ?
            WHERE id_product =?`,
            [productname, price, stock, description, product_id]
        )
        if(!uP.affectedRows) return res.json({ success: false, message: "No changes were made"})
        
        return res.json({ success: true, message: "Product updated successfully."})
        
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