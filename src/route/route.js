const express = require("express");
const router = express.Router();
const controllers = require("../controllers/userController");
const productController = require("../controllers/productController");
const cartController = require("../controllers/cartController");
const orderController = require("../controllers/orderController")
const mid = require("../middleware/auth");




//========================================= UserController =======================================================//

router.post("/register", controllers.createUser);
router.post("/login", controllers.loginUser);
router.get("/user/:userId/profile", mid.authenticate, mid.authorisation, controllers.getUserProfile);
router.put("/user/:userId/profile", mid.authenticate, mid.authorisation, controllers.updateProfile);

//======================================== productController ====================================================//

router.post("/products", productController.createProduct);
router.get("/products", productController.getProduct);
router.get("/products/:productId", productController.getProductById);
router.put("/products/:productId", productController.updateProduct);
router.delete("/products/:productId", productController.deleteProduct);

//======================================= cartController ========================================================//

router.post("/users/:userId/cart", mid.authenticate, mid.authorisation,  cartController.createCart );
router.put("/users/:userId/cart",  mid.authenticate, mid.authorisation, cartController.updateCart );
router.get("/users/:userId/cart",  mid.authenticate, mid.authorisation, cartController.getCart );
router.delete("/users/:userId/cart",  mid.authenticate, mid.authorisation, cartController.deleteCart );


//======================================= orderController=========================================================//

router.post("/users/:userId/orders",  mid.authenticate, mid.authorisation, orderController.createOrder );
router.put("/users/:userId/orders",  mid.authenticate, mid.authorisation, orderController.updateOrder );



module.exports = router