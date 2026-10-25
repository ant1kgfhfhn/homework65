require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");

const connectDatabase = require("./config/database");
const configurePassport = require("./config/passport");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Pug templates
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "..", "views"));

// Reverse proxy configuration for production
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Parse incoming requests
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve CSS files from views/styles.css
app.use("/styles", express.static(path.join(__dirname, "..", "views")));

// Session configuration
app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

// Passport authentication
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Home page
app.get("/", (req, res) => {
  res.render("auth/home", {
    isAuthenticated: req.isAuthenticated(),
  });
});

// Application routes
app.use("/", authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).send("Page not found.");
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Application error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).send("Internal Server Error.");
});

// Start server only after connecting to MongoDB
async function startServer() {
  try {
    if (!process.env.MONGODB_URI || !process.env.SESSION_SECRET) {
      throw new Error("Missing MONGODB_URI or SESSION_SECRET in the .env file");
    }

    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
