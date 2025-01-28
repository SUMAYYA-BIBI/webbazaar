const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const port = 4000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
  credentials: true
}));

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://sumayyabibi533:sumi2001@cluster0.mu2go.mongodb.net/web?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "upload", "images");
const fs = require('fs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from the upload directory
app.use("/images", express.static(uploadDir));

// Image Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Schemas and Models
const Users = mongoose.model("Users", {
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  cartData: { type: Map, of: Number, default: {} }, // Use a Map for dynamic keys
  date: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});

const Order = mongoose.model("Order", {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  items: [
    {
      id: { type: Number, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

// Middleware to fetch user from token
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).json({ success: false, error: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Invalid token. Please authenticate again." });
  }
};

// Routes
app.get("/", (req, res) => {
  res.send("Root Endpoint - API is working!");
});

// Authentication Routes
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await Users.findOne({ email });
  if (!user || user.password !== password) {
    return res.status(400).json({ success: false, error: "Invalid email or password" });
  }
  const data = { user: { id: user.id } };
  const token = jwt.sign(data, "secret_ecom");
  res.json({ success: true, token });
});

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await Users.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, error: "User with this email already exists" });
  }

  const cartData = {}; // Initialize an empty cart
  const user = new Users({ name: username, email, password, cartData });
  await user.save();

  const data = { user: { id: user.id } };
  const token = jwt.sign(data, "secret_ecom");

  res.json({ success: true, token });
});

// Cart Operations
app.post("/addtocart", fetchuser, async (req, res) => {
  const user = await Users.findOne({ _id: req.user.id });

  console.log("Received itemId:", req.body.itemId);
  console.log("User's Current Cart Data:", user.cartData);

  if (!user.cartData.has(req.body.itemId.toString())) {
    user.cartData.set(req.body.itemId.toString(), 0); // Initialize item ID if not present
  }

  user.cartData.set(req.body.itemId.toString(), user.cartData.get(req.body.itemId.toString()) + 1); // Increment item quantity
  console.log("Updated Cart Data:", user.cartData);

  await user.save();
  res.json({ success: true, message: "Item added to cart" });
});

app.post("/checkout", fetchuser, async (req, res) => {
  const user = await Users.findOne({ _id: req.user.id });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  console.log("Request Items from Frontend:", req.body.items);
  console.log("User's Cart Data from Database:", user.cartData);

  const { items, totalAmount } = req.body;

  // Validate Cart
  const validItems = items.filter((item) => {
    const quantityInCart = user.cartData.get(item.id.toString()) || 0;
    return quantityInCart > 0;
  });

  console.log("Valid Items After Validation:", validItems);

  if (validItems.length === 0) {
    return res.status(400).json({ success: false, message: "Your cart is empty!" });
  }

  // Save Order
  const order = new Order({
    userId: req.user.id,
    items: validItems,
    totalAmount,
  });
  await order.save();

  // Clear User Cart
  user.cartData = new Map(); // Clear cart
  await user.save();

  res.json({ success: true, message: "Order placed successfully!" });
});

// Product Routes
app.post("/upload", upload.single("product"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Return the complete URL for the uploaded image
    const imageUrl = `/images/${req.file.filename}`;
    
    res.json({
      success: true,
      message: "File uploaded successfully",
      image_url: imageUrl
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error uploading file"
    });
  }
});

app.get("/allproducts", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ id: 1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/popularinwomen", async (req, res) => {
  try {
    const products = await Product.find({ 
      category: { $regex: /women/i } // Case-insensitive match for "women"
    })
    .sort({ date: -1 }) // Sort by date, newest first
    .limit(8); // Limit to 8 products
    res.json(products);
  } catch (error) {
    console.error("Error fetching popular women products:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/newcollections", async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ date: -1 }) // Sort by date, newest first
      .limit(8); // Limit to 8 products
    res.json(products);
  } catch (error) {
    console.error("Error fetching new collections:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/addproduct", async (req, res) => {
  try {
    // Find the highest existing ID
    const highestProduct = await Product.findOne().sort('-id');
    const nextId = highestProduct ? highestProduct.id + 1 : 1;

    const productData = {
      id: nextId,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      image: req.body.image,
      new_price: parseFloat(req.body.new_price),
      old_price: parseFloat(req.body.old_price),
    };

    const product = new Product(productData);
    await product.save();

    // Emit a socket event to notify clients about the new product
    io.emit('product_added', product);

    res.json({
      success: true,
      name: product.name,
      id: product.id
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/removeproduct", async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.body.id });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    res.json({
      success: true,
      message: "Product removed successfully"
    });
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_faq_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined FAQ room: ${roomId}`);
  });

  socket.on('faq_question', (data) => {
    console.log('Received question:', data);
    // Broadcast the question to admin room
    io.to('admin_room').emit('new_question', {
      userId: socket.id,
      question: data.question,
      timestamp: new Date()
    });
    
    // For testing, let's auto-respond
    setTimeout(() => {
      socket.emit('question_answered', {
        question: data.question,
        answer: `Thank you for your question: "${data.question}". Our team will respond shortly.`,
        timestamp: new Date()
      });
    }, 1000);
  });

  socket.on('faq_answer', (data) => {
    // Send answer back to specific user
    io.to(data.userId).emit('question_answered', {
      question: data.question,
      answer: data.answer,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Worker Thread for heavy computations
const { Worker } = require('worker_threads');

const runWorker = (data) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./workers/compute.js', {
      workerData: data
    });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
