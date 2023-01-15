const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const cors = require("cors");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const app = express();
const db = require("./sequelize");

const User = require("./models/user");

const postRouter = require("./routes/posts");
const privateRouter = require("./routes/private_posts");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors({ credentials: true, origin: true }));

app.options("*", cors());

app.use(logger("dev"));
app.use(session({ secret: process.env.JWT_SECRET }));
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Validates email/password combo
passport.use(
  "local",
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      //look for user
      await User.sync();
      const user = await User.findOne({ where: { email: email } });
      if (!user)
        return done(null, false, {
          message: "Incorrect username or password.",
        });
      //check if password matches stored hash
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        let err = "Incorrect username or password.";
        err.status = 400;
        return done(err, false, { message: "Incorrect username or password." });
      }

      return done(null, user, { message: "Sign in successful" });
    }
  )
);

// Validates JWT
passport.use(
  "jwt",
  new JWTStrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      if (token) return done(null, token.user);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findOne({ where: { id } })
    .then((user) => done(null, user))
    .catch((err) => done(err, false));
});

app.use(async (req, res, next) => {
  try {
    await db.authenticate();
    console.log("Successfully connected to database");
    db.sync();
    next();
  } catch (err) {
    return next(err);
  }
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    else if (!user) res.sendStatus(400);
    else {
      const token = jwt.sign({ user }, process.env.JWT_SECRET);
      return res.json({ token: token });
    }
  })(req, res, next);
});

app.use("/private/posts", passport.authenticate("jwt"), privateRouter);
app.use("/posts", postRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
