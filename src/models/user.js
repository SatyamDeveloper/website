const mongooose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongooose.Schema({
  photo: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  seller: {
    type: Boolean,
    default: false,
    required: true,
  },
  wishlists: [
    {
      wishlist: {
        type: String,
      }
    }
  ],
  orders: [
    {
      order: {
        type: String,
      },
    }
  ],
  carts: [
    {
      cart: {
        type: String
      }
    }
  ],
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
})

userSchema.methods.generateToken = async function () {
  try {
    const token = jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    )
    this.tokens = this.tokens.concat({ token })
    await this.save()
    return token
  } catch (error) {
    res.status(500).json(error)
  }
}

userSchema.pre('save', async function (_req, _res, next) {
  try {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 12)
    }
    next()
  } catch (error) {
    res.status(500).json(error)
  }
})

const User = mongooose.model('USER', userSchema)
module.exports = User