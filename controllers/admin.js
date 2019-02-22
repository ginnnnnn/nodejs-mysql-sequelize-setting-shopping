const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  // get req info and set as params
  const product = new Product(null, title, imageUrl, description, price);
  //class a new class with req params to get new info. this order matters /same in models
  //null is the id
  product.save();
  res.redirect("/");
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit; // boolean, after/:id?edit=editMode
  if (!editMode) {
    return res.redirect("/");
  }
  const prdId = req.params.productId;
  // check route "/edit-product/:productId"
  Product.findById(prdId, product => {
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const prdId = req.params.productId;
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  // get req info and set as params
  const product = new Product(prdId, title, imageUrl, description, price);
  //class a new class with req params to get new info. this order matters /same in models
  product.save();
  res.redirect("/admin/products");
};

exports.postDelProduct = (req, res, next) => {
  const prdId = req.body.productId;
  Product.deleteById(prdId);
  res.redirect("/admin/products");
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render("admin/products", {
      prods: products,
      pageTitle: "admin products page",
      path: "/admin/products"
    });
  });
};
