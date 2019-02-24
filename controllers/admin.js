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
  req.user
    .createProduct({
      title: title,
      imageUrl: imageUrl,
      price: price,
      description: description
    })
    .then(() => {
      console.log("Create Product");
      res.redirect("/product-list");
    })
    .catch(err => console.log(err));
  // Product.create({
  //   //sequelize method create() it create table and save
  //   title: title,
  //   imageUrl: imageUrl,
  //   price: price,
  //   description: description,
  //   userId: req.user.id
  // })
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit; // boolean, after/:id?edit=editMode
  if (!editMode) {
    return res.redirect("/");
  }
  const prdId = req.params.productId;
  // check route "/edit-product/:productId"
  req.user
    .getProducts({ where: { id: prdId } })
    .then(products => {
      // products [{}]
      const product = products[0];
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prdId = req.params.productId;
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  // get req info and set as params
  Product.findByPk(prdId)
    .then(product => {
      product.title = title;
      product.price = price;
      product.imageUrl = imageUrl;
      product.description = description;
      product.userId = req.user.id; // req.user has been replaced by sequelize user
      return product.save(); //sequelize method save it in database,if non exist create one
    })
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};

exports.postDelProduct = (req, res, next) => {
  const prdId = req.body.productId;
  // Product.destroy({ where: { id: prdId } })
  //   .then(() => {
  //     res.redirect("/admin/products");
  //   })
  //   .catch(err => console.log(err));
  Product.findByPk(prdId) //other way to delete
    .then(product => {
      return product.destroy();
    })
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "admin products page",
        path: "/admin/products"
      });
    })
    .catch(err => console.log(err));
};
