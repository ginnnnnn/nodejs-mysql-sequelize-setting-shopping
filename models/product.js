const fs = require("fs");
const path = require("path");
const Cart = require("../models/cart");

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "products.json"
);

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile(products => {
      let productPriceDelta;
      if (this.id) {
        // this.id exist means in edit mode and this has new  title imageUrl..price
        const existingProductIndex = products.findIndex(
          prd => prd.id === this.id
        ); //get the old product index
        const newProductPrice = this.price;
        const oldProductPrice = products[existingProductIndex].price;
        productPriceDelta = newProductPrice - oldProductPrice;
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this; //replace class product
        if (productPriceDelta !== 0) {
          Cart.updateProduct(this.id, productPriceDelta);
        }
        fs.writeFile(p, JSON.stringify(updatedProducts), err => {
          if (err) {
            console.log(err);
          }
        });
      } else {
        this.id = `${this.title}${Math.random().toString()}`;
        // set id in product if there is no id !! in add-product
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), err => {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  }
  static deleteById(id) {
    getProductsFromFile(products => {
      const updateProduct = products.filter(prd => prd.id !== id);
      const product = products.find(prd => prd.id === id);
      fs.writeFile(p, JSON.stringify(updateProduct), err => {
        if (!err) {
          Cart.deleteProduct(id, product.price);
        }
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(prdId, cb) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id === prdId);
      cb(product);
    });
  }
};
