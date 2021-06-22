const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const { verify, redirect } = require('../middlewares/auth')
const multer = require('multer')

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
    res.render(filePath)
  }
}

const sendData = (filePath) => {
  return (req, res) => {
    const cartQty = req.rootUser?.carts?.length
    const user = req.rootUser
    res.render(filePath, { user, cartQty })
  }
}

router.get('/', verify, sendData('user/index'))

router.get('/search', verify, sendData('user/search'))

router.get('/my-account', redirect, sendData('user/account'))

router.get('/orders', redirect, sendData('user/orders'))

router.get('/cart', redirect, async (req, res) => {
  const cartQty = req.rootUser?.cart.length
  const user = req.rootUser || undefined
  const carti = await Product.findOne({ _id: req.rootUser.cart[0].product })
  console.log(carti)
  res.render('user/cart', { user, cartQty, carti })
})

router.post('/cart/add', redirect, async (req, res) => {
  const { product } = req.body
  if (product) {
    req.rootUser.cart = req.rootUser.cart.concat({ product })
    await req.rootUser.save()
    res.status(200).json('Cart is full')
  } else {
    res.status(400).send('Please add product to cart')
  }
})

router.get('/product', verify, sendData('user/product'))

router.get('/register', renderPage('user/register'))

router.post('/signup', upload.single("photo"), async (req, res) => {
  try {
    const { username, phone, email, password } = req.body
    const photo = req.file.filename;

    if (photo && username && email && phone && password) {
      const userExists = await User.findOne({ email })
      if (!userExists) {
        const userData = new User({ photo, username, email, phone, password, })
        await userData.save()
        res.status(200).redirect('/login')
      } else {
        res.status(400).json('Email already exists. Please try another')
      }
    } else {
      res.status(400).json('Please fill all mandatory fields')
    }
  } catch (error) {
    res.status(500).json(`error is : ${error}`)
  }
})

router.get('/login', renderPage('user/login'))

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body
    if (email && password) {
      const userExists = await User.findOne({ email })
      if (userExists) {
        const passVerify = await bcrypt.compare(password, userExists.password)
        if (passVerify) {
          const token = await userExists.generateToken()
          res.cookie('jwt', token, {
            expires: new Date(Date.now() + 258920000000),
          })
          res.status(200).json('msg')
        } else {
          res.status(400).json('Invalid Credentials')
        }
      } else {
        res.status(400).json('Invalid Credentials')
      }
    } else {
      res.status(400).json('Please fill all mandatory fileds')
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

router.get('/logout', redirect, async (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((currentElem) => {
      return currentElem.token != req.token
    })
    res.clearCookie('jwt')
    await req.rootUser.save()
    res.redirect('/login')
  } catch (error) {
    res.status(500).json(error)
  }
})

router.get('/seller', redirect, async (req, res) => {
  const userEmail = req.rootUser.email
  const sellerEmail = await User.findOne({ email: userEmail })
  if (sellerEmail.seller === true) {
    res.redirect('/seller-central')
  }
  else {
    sellerEmail.seller = true
    sellerEmail.save()
    res.redirect('/seller-central')
  }
})

module.exports = router