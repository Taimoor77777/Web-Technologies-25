let express = require("express");
let mongoose = require("mongoose")
let bodyParser = require('body-parser');
let session = require('express-session');
let bcrypt = require('bcryptjs');
let User = require('./models/User');
let Order = require('./models/Order');
let app = express();
let ejsLayouts = require("express-ejs-layouts");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(ejsLayouts);

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
    res.render('LandingPage', { title: 'Home', userEmail: req.session.userEmail, products: productList });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
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