const express = require("express");
const routes = require("./controllers");
const sequelize = require("./config/connection");
const path = require("path");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const app = express();
const PORT = process.env.PORT || 3001;

const sess = {
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // true on heroku
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  },
  resave: false,
  saveUninitialized: false,
  store: new SequelizeStore({ db: sequelize }),
};

app.use(session(sess));
sess.store.sync();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "client", "build")));
}
app.get("/ping", (req, res) => res.send("pong"));
app.use(routes);

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log(`Now glistening on Port ${PORT}`));
});
