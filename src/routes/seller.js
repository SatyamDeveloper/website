const express = require('express')
const router = express.Router()
const { redirect } = require('../middlewares/auth')
const title = 'SellerCentral'
const multer = require('multer')
// const productRouter = require('./product')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage });

const renderPage = (filePath) => {
  return (req, res) => {
    res.render(filePath, { title })
  }
}

const sendData = (filePath) => {
  return (req, res) => {
    if (req.rootUser.seller === true) {
      const user = req.rootUser
      res.render(filePath, { title, user })
    } else {
      res.redirect('/')
    }
  }
}

router.get('/', redirect, sendData('seller/index'))

router.get('/inventory', redirect, sendData('seller/inventory'))

// router.use('/product', productRouter)

router.get('/search', redirect, sendData('seller/search'))

router.get('/user', redirect, sendData('seller/account'))

router.get('/orders', redirect, sendData('seller/orders'))


module.exports = router