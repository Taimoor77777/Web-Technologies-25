let express = require("express");
let mongoose = require("mongoose")
let bodyParser = require('body-parser');
let session = require('express-session');
let bcrypt = require('bcryptjs');
let User = require('./models/User');
let Order = require('./models/Order');
let Product = require('./models/Product');
let app = express();
let ejsLayouts = require("express-ejs-layouts");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(ejsLayouts);
app.set('layout', 'layout'); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

const uri = 'mongodb://localhost:27017/myshop';


mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  await Order.create({
    userEmail: "example@email.com",
    items: ["Leather Tote Bag", "Winter Overcoat"],
    totalPrice: 370
  });
  
  console.log('✅ Connected to MongoDB');
}).catch((err) => console.error('❌ MongoDB connection error:', err));


function isAuthenticated(req, res, next) {
    if (req.session.userEmail) {
        return next();
    }
    res.redirect('/login');
}

app.use((req, res, next) => {
    res.locals.userEmail = req.session.userEmail;
    next();
});

app.use((req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }
    next();
});

const productList = [
   {
    name: 'Leather Tote Bag',
    image: 'https://amq-mcq.dam.kering.com/m/6ae59033523d203c/Large-8346581VDDM1000_E.jpg?v=1 ',
    price: 120
  },
  {
    name: 'Winter Overcoat',
    image: 'https://amq-mcq.dam.kering.com/m/6ae59033523d203c/Large-8346581VDDM1000_E.jpg?v=1',
    price: 250
  },
  {
    name: 'Men’s Designer Sneakers',
    image: 'https://amq-mcq.dam.kering.com/m/6ae59033523d203c/Large-8346581VDDM1000_E.jpg?v=1',
    price: 180
  },
  {
    name: 'Leather Tote Bag',
    image: 'https://amq-mcq.dam.kering.com/m/6ae59033523d203c/Large-8346581VDDM1000_E.jpg?v=1 ',
    price: 120
  },
  {
    name: 'Leather Tote Bag',
    image: 'https://amq-mcq.dam.kering.com/m/6ae59033523d203c/Large-8346581VDDM1000_E.jpg?v=1 ',
    price: 120
  },
  {
    name: 'Leather Tote Bag',
    image: 'https://amq-mcq.dam.kering.com/m/6ae59033523d203c/Large-8346581VDDM1000_E.jpg?v=1 ',
    price: 120
  },
  {
    name: 'Leather Tote Bag',
    image: 'https://amq-mcq.dam.kering.com/m/6ae59033523d203c/Large-8346581VDDM1000_E.jpg?v=1 ',
    price: 120
  },
  {
    name: 'Leather Tote Bag',
    image: 'https://amq-mcq.dam.kering.com/m/6ae59033523d203c/Large-8346581VDDM1000_E.jpg?v=1 ',
    price: 120
  }
];

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

const isAdmin = (req, res, next) => {
  if (req.session.userEmail === ADMIN_EMAIL) {
    return next();
  }
  res.status(403).send('Access denied');
};

app.get('/admin/products', isAdmin, async (req, res) => {
    const products = await Product.find();
    //console.log(products)
    res.render('admin/products', { products });
});

app.post('/admin/products', isAdmin, async (req, res) => {
  const { title, price, description, image } = req.body;
  await Product.create({ title, price, description, image });
  res.redirect('/admin/products');
});

app.get('/admin/products/:id/edit', isAdmin, async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render('admin/edit-product', { product });
});

app.post('/admin/products/:id', isAdmin, async (req, res) => {
  const { title, price, description, image } = req.body;
  await Product.findByIdAndUpdate(req.params.id, { title, price, description, image });
  res.redirect('/admin/products');
});

app.post('/admin/products/:id/delete', isAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect('/admin/products');
});

app.get('/admin/orders', isAdmin, async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.render('admin/orders', { orders });
});




app.get("/contact-us", (req, res) => {
  res.render("contact-us");
});

app.get('/about', (req, res) => {
    res.render('about', { title: "About Us" });
});

app.get('/services', (req, res) => {
    res.render('services', { title: "Our Services" });
});

app.get('/', isAuthenticated, (req, res) => {
    //res.render('LandingPage', { title: 'Home', userEmail: req.session.userEmail, products: productList });
    const message = req.session.successMessage;
    req.session.successMessage = null; // clear after reading
    res.render('LandingPage', {
        title: 'Home',
        userEmail: req.session.userEmail,
        products: productList,
        successMessage: message
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        req.session.userEmail = email;
        req.session.isAdmin = true;
        return res.redirect('/admin/products');
    }

    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userEmail = user.email;
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed });
    res.redirect('/login');
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.get('/my-orders', isAuthenticated, async (req, res) => {
  try {
    const userOrders = await Order.find({ userEmail: req.session.userEmail });
    res.render('my-orders', { title: 'My Orders', orders: userOrders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/add-to-cart', (req, res) => {
    const { name, price } = req.body;

    // Check if already in cart
    const existing = req.session.cart.find(item => item.name === name);
    if (existing) {
        existing.quantity += 1;
    } else {
        req.session.cart.push({ name, price, quantity: 1 });
    }

    res.redirect('/cart');
});

app.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.render('cart', { cart, total });
});

// Update cart quantity
app.post('/update-cart', (req, res) => {
    const { index, action, quantity } = req.body;
    const cart = req.session.cart || [];
    
    if (cart[index]) {
        if (action === 'increase') {
            cart[index].quantity += 1;
        } else if (action === 'decrease' && cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else if (quantity) {
            cart[index].quantity = parseInt(quantity);
        }
    }
    
    req.session.cart = cart;
    res.redirect('/cart');
});

// Remove item from cart
app.post('/remove-from-cart', (req, res) => {
    const { index } = req.body;
    const cart = req.session.cart || [];
    
    if (cart[index]) {
        cart.splice(index, 1);
    }
    
    req.session.cart = cart;
    res.redirect('/cart');
});

app.get('/checkout', (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.render('checkout', { cart, total });
});

app.post('/place-order', async (req, res) => {
    const { name, phone, address } = req.body;
    const items = req.session.cart || [];
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (!items.length) return res.redirect('/cart');

    await Order.create({
        name,
        phone,
        address,
        items,
        total,
        userEmail: req.session.userEmail || null
    });

    req.session.cart = []; // Clear cart after placing order

    req.session.successMessage = '✅ Order placed successfully. Thank you!';
    res.redirect('/');
});




// app.get('/', isAuthenticated, async (req, res) => {
//     const orders = await Order.find({ userEmail: req.session.userEmail });
//     res.render('orders/my-orders', { orders });
// });

// res.render('home', { userEmail: req.session.userEmail });


app.listen(4000, () => {
  console.log("server started at localhost:4000");
});
console.log('Mongoose version:', mongoose.version);
// let express = require("express");
// const port = 4000;
// const app = express();

// app.get('/', (req,res) => {
//     res.send("hello3")

// });

// app.listen(port, () =>{
//     console.log("server running");
// });