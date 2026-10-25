const express = require("express");
const passport = require("passport");

const {
  showRegister,
  register,
  showLogin,
  logout,
  showProtected,
  showUsers,
} = require("../controllers/authController");

const ensureAuthenticated = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/register", showRegister);
router.post("/register", register);

router.get("/login", showLogin);

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login?error=1",
  }),
  (req, res) => {
    res.redirect("/protected");
  },
);

router.post("/logout", logout);

router.get("/protected", ensureAuthenticated, showProtected);
router.get("/users", ensureAuthenticated, showUsers);

module.exports = router;
