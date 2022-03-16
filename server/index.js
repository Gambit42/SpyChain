//Import packages
const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const mongodbSession = require("connect-mongodb-session")(session);
const cors = require("cors");

//Import file from other folders
const connectDatabase = require("./config/connectDatabase");
const authURLS = require("./routes/auth");
const sessionURLS = require("./routes/session");
const portfolioURLS = require("./routes/portfolio");
const assetURLS = require("./routes/asset");
const userURLS = require("./routes/user");

//Use dotenv package wit the path
dotenv.config({ path: "./config.env" });

//Variable Declaration
const app = express();
const PORT = process.env.PORT || 4000;
const store = new mongodbSession({
  uri: process.env.DATABASE_ACCESS,
  collection: "sessions",
});

//Connect to the database
connectDatabase();

//middlewares
app.use(express.json());
app.use(
  cors({
    origin: ["https://spychain.netlify.app"],
    methods: ["GET", "POST", "PUT"],
    credentials: true, // enable set cookie
  })
);

app.use(
  session({
    store: store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    proxy: true, // Required for Heroku & Digital Ocean (regarding X-Forwarded-For)
    cookie: {
      // httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 48,
      sameSite: "none",
    },
  })
);

app.use("/", authURLS);
app.use("/session", sessionURLS);
app.use("/portfolio", portfolioURLS);
app.use("/asset", assetURLS);
app.use("/user", userURLS);

const server = app.listen(PORT, () => {
  console.log(`Server is running: ${PORT}`);
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Logged error ${err}`);
  server.close(() => process.exit(1));
});
