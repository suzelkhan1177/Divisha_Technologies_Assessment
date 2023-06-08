const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const Seller = require('../models/seller');
const authMiddleware = require('../config/authMiddleware');



router.get('/search', authMiddleware, async (req, res) => {
  const query = req.query.query.trim(); // Get the search query from the request query parameters

  try {
    const results = [];

     for(let i=0; i<req.user.inventory.length; i++){  
             if(req.user.inventory[i].productName == query){
                results.push(req.user.inventory[i]);
             }
        }
        // if (results.length === 0) {
        //   res.status(400).json({ message: 'Text Serch  Not Present' });

        // } else {
          res.render('search-results', { results });
        // } 
  } catch (error) {
    res.status(500).json({ message: 'Failed to perform search' });
  }
});




// Render the sign-up form
router.get('/', (req, res) => {
  res.render('login');
});

router.get('/signup', (req, res) => {
  res.render('signup');
});



// Render the "Add Store Info" form
router.get('/store-info', authMiddleware, (req, res) => {
  const storeInfo = req.user.storeInfo;
  res.render('store', { storeInfo });
});

// Render the "Add Category" form
router.get('/add-category', authMiddleware, (req, res) => {
  const categories = req.user.categories;
  res.render('category' , {categories });
});

// Render the "Add Inventory" form
router.get('/add-inventory', authMiddleware, (req, res) => {
  const inventory = req.user.inventory;
  res.render('inventory' , { inventory});
});


// Render the dashboard
router.get('/dashboard', authMiddleware, (req, res) => {
  try {
    const email = req.user.email;
    const businessName = req.user.businessName;
    const url = req.user.url;

    res.render('dashboard', { email, businessName, url }); // Pass the data to the dashboard EJS file
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch data' });
  }
});





// Add inventory route
router.post('/dashboard/inventory', authMiddleware, (req, res) => {
  const { category, subcategory, productName, mrp, sp, quantity, images } = req.body;

  // Convert images to an array if it's a string
  const imageArray = Array.isArray(images) ? images : [images];

  // Save inventory to the database
  // You can use the logged-in seller's ID to update their record
  Seller.findByIdAndUpdate(req.user._id, {
    $push: {
      inventory: {
        category,
        subcategory,
        productName,
        mrp,
        sp,
        quantity,
        images: imageArray,
      },
    },
  })
    .then(() => {
      res.redirect('/add-inventory');
    })
    .catch((error) => {
      res.status(500).json({ error: 'Error adding inventory' });
    });
});


// Add Category, Sub Category route
router.post('/dashboard/categories', authMiddleware, (req, res) => {
  const { category, subCategory } = req.body;

  // Save category and subcategory to the database
  Seller.findByIdAndUpdate(req.user._id, { $push: { categories: { name: category, subcategories: [subCategory] } } })
    .then(() => {
      res.redirect('/add-category');
    })
    .catch((error) => {
      res.status(500).json({ error: 'Error adding category and subcategory' });
    });
});


// Add store info route
router.post('/dashboard/store-info', authMiddleware, (req, res) => {
  const { address, gst, logo, storeTimings } = req.body;
  console.log(req.body);
  // Save store info to the database
  Seller.findByIdAndUpdate(req.user._id, { storeInfo: { address, gst, logo, storeTimings } })
    .then(() => {
      res.redirect('/store-info');
    })
    .catch((error) => {
      res.status(500).json({ error: 'Error adding store info' });
    });
});




// Logout Funtion 
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(tokenObj => tokenObj.token !== req.token);
    await req.user.save();

    res.clearCookie('token'); // Clear the token cookie

    res.render('login');
    // res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});







// Login router
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Seller.findOne({ email });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = user.generateAuthToken();
    await user.save();

    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // Set the token as a cookie

    // res.json({ token });
    res.redirect('dashboard');
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});





// Sign up route
router.post('/signup', async (req, res) => {
  const { email, businessName, password, confirmPassword } = req.body;

  // Check if the passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // Generate a unique URL for the seller
  const url = generateUniqueURL();



  // Create a new seller
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      const seller = new Seller({
        email,
        businessName,
        password: hash,
        url,
      });


      // Save the seller to the database
      seller.save()
        .then(() => {

          res.render('login');
          // res.status(201).json({ message: 'Seller registered successfully' });

        })
        .catch((error) => {
          res.status(500).json({ error: 'Error registering seller' });
        });


    });
  });
});


function generateUniqueURL() {
  // Generate a random string or use a unique identifier logic as per your requirements
  const uniqueString = Math.random().toString(36).substr(2, 8);
  return `/seller/${uniqueString}`;
}





module.exports = router;