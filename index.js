require('dotenv').config()
const express = require('express')
const app = express()

//for forms
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send("Hello world!")
})

//app.use('/', express.static('./public'))
app.use('/', require('./be/routes'))

app.listen(process.env.PORT, () => {
    console.log(`Server listening at ${process.env.PORT}`)
})
