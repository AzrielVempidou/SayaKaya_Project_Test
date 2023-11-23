const express = require(`express`)
const waRouter = require("./waRoutes")
const router = express.Router()

router.use('/SendMessage', waRouter)

module.exports = router