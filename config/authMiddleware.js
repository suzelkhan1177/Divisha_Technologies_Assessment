const jwt = require('jsonwebtoken');
const Seller = require('../models/seller');

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return  res.render('login'); 
      // return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, 'secretKey');
    const user = await Seller.findOne({ _id: decoded._id, 'tokens.token': token });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authenticate;
