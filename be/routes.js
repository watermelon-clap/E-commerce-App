const express = require('express')
const router = express.Router()
const verifyToken = require('./../middlewares/verifytoken')

router.use('/', require('./products'))

router.use(verifyToken)

router.use('/', require('./users'))
router.use('/', require('./purchases'))

module.exports = router