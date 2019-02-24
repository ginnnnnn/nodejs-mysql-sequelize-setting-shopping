const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      //this middleware get user from sequelize and replace req.user .it has methods!!
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use("/admin", adminRoutes); //set all routes from admin.js in sub folder /admin
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
User.hasMany(Order);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsToMany(Product, { through: OrderItem });
Order.belongsTo(User);

// association set up

sequelize
  // .sync({ force: true }) //{force:true} is for production mode overwrite existing table
  .sync()
  .then(result => {
    return User.findByPk(1);
  })
  .then(user => {
    if (!user) {
      return User.create({ name: "Austin", email: "aginlo@hotmail.com" });
    }
    return user; // return Promise.reslove(user) ,return value in then() will auto wrap in Promise
  })
  .then(user => {
    user
      .getCart()
      .then(cart => {
        if (cart) {
          return cart;
        }
        return user.createCart();
      })
      .catch(err => console.log(err));
  })
  .then(cart => {
    app.listen(3000);
  })
  .catch(err => console.log(err));
// this is the sequelize syntax for createing table,it did check if not exit then create
