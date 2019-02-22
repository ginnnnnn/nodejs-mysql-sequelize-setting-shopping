const fs = require("fs");
const path = require("path");

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "cart.json"
);

module.exports = class Cart {
  static addProduct(id, productPrice) {
    //fetch the previous product
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 }; //set init cart
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      //Analyze the cart => find the existing product
      const existingProductIndex = cart.products.findIndex(
        prd => prd.id === id
      );
      //check if there is same product already in the cart and retuen Index of the product
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct; //init product for update
      if (existingProduct) {
        //if existingProduct in cart are exist just update the qty and property
        updatedProduct = { ...existingProduct }; //copy the existingProduct property
        updatedProduct.qty = updatedProduct.qty + 1; //update qty
        cart.products = [...cart.products]; //copy cart.products
        cart.products[existingProductIndex] = updatedProduct; //overwrite the cart.products
      } else {
        //if no same product in cart create one property set id and qty
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
        //if no same product in cart ,add new product to cart products array
      }
      cart.totalPrice = +(cart.totalPrice + +productPrice).toFixed(2); //productPrice convert to number
      //update price by one simple just add the price of the product selected to the old price
      //here is 0 + product price
      fs.writeFile(p, JSON.stringify(cart), err => {
        console.log(err); // write file to cart.json note this is still in callback in fs.readFile
      });
    });

    //Add new product and increase the quantity
  }
  static deleteProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        return;
      }
      const updatedCart = { ...JSON.parse(fileContent) }; //get Cart
      const product = updatedCart.products.find(prd => prd.id === id); //find target product
      if (product) {
        const productQty = product.qty;
        //find target product qty
        updatedCart.totalPrice =
          updatedCart.totalPrice - +productPrice * productQty;
      }
      // update Cart totalprice
      updatedCart.products = updatedCart.products.filter(prd => prd.id !== id);
      // update Cart products array ,delete target product in cart array filter prd.id !== id

      fs.writeFile(p, JSON.stringify(updatedCart), err => {
        console.log(err);
      });
    });
  }

  static updateProduct(id, productPriceDelta) {
    fs.readFile(p, (err, fileContent) => {
      let cart = {
        products: [],
        totalPrice: 0
      };
      //productPriceDelta is the difference of the price after changed
      if (!err) {
        const updateCart = JSON.parse(fileContent);
        const productIndex = updateCart.products.findIndex(
          prod => prod.id === id
        );
        const product = updateCart.products[productIndex];
        if (product) {
          const productQty = product.qty;
          updateCart.totalPrice = +(
            updateCart.totalPrice +
            +productPriceDelta * productQty
          ).toFixed(2);
          // new totalprice in cart = oldtotalprice in cart + differnce times qty
          fs.writeFile(p, JSON.stringify(updateCart), err => {
            if (err) {
              console.log(err);
            }
          });
        }
      }
    });
  }
  static getCart(cb) {
    fs.readFile(p, (err, fileContent) => {
      const cart = JSON.parse(fileContent); //set init cart
      if (err) {
        cb(null);
      } else {
        cb(cart);
      }
    });
  }
};
