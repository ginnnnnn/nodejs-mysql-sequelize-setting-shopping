const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Shop",
        path: "/product-list"
      });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prdId = req.params.productId;
  Product.findAll({ where: { id: prdId } })
    .then(products => {
      //always get products array ,findAll()
      res.render("shop/product-details", {
        product: products[0],
        pageTitle: products[0].title,
        path: "/products"
      });
    })
    .catch(err => console.log(err));
  // Product.findById(prdId) // sequelize method findById(id) get product
  //   .then(product => {
  //     res.render("shop/product-details", {
  //       product: product,
  //       pageTitle: product.title,
  //       path: "/products"
  //     });
  //   })
  //   .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "welcome to my shop",
        path: "/"
      });
    })
    .catch(err => console.log(err));
  // Product.fetchAll()
  //   .then(([rows, fieldData]) => {
  //     console.log(rows);
  //     //[param1,param2] destrature from result = [[],[]]
  //     res.render("shop/index", {
  //       prods: rows,
  //       pageTitle: "welcome to my shop",
  //       path: "/"
  //     });
  //   })
  // .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(cart => {
      return cart
        .getProducts()
        .then(products => {
          res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: products
          });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prdId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prdId } });
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product; // return product
      }
      return Product.findByPk(prdId); //return product ,product in then() Promise.resolve(product)
    })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity } //save in cartItem quantity
      });
    })
    .then(() => {
      res.redirect("/");
    })
    .catch(err => console.log(err));
};

exports.postCartdelProduct = (req, res, next) => {
  const prdId = req.body.productId;
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: prdId } });
    })
    .then(products => {
      const product = products[0];
      product.cartItem.destroy();
    })
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  const user = req.user;
  let fetchedCart;
  user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return fetchedCart.getProducts();
    })
    .then(products => {
      return user
        .createOrder()
        .then(order => {
          return order.addProducts(
            products.map(product => {
              product.orderItem = { quantity: product.cartItem.quantity }; //set quantity to orderItem
              return product; //map return a new array
            })
          );
        })
        .catch(err => console.log(err));
    })
    .then(result => {
      return fetchedCart.setProducts(null); // clear products in cart
    })
    .then(result => {
      res.redirect("/orders");
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({ include: ["products"] })
    //sequelize syntax insert products array in orders,
    //  so each order has products array and can access ordItem to get quantity
    .then(orders => {
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders
      });
    })
    .catch(err => console.log(err));
};
