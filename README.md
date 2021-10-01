# titaniumaplus

## Project - products Management

## Topics to introduce
### Pagination
### Caching using Redis
### File upload to S3

### Key points
- Create a group database `groupXDatabase`. You can clean the db you previously used and resue that.
- This time each group should have a *single git branch*. Coordinate amongst yourselves by ensuring every next person pulls the code last pushed by a team mate. You branch will be checked as part of the demo. Branch name should follow the naming convention `project/productsManagementGroupX`
- Follow the naming conventions exactly as instructed.

### Models
- User Model
```yaml
{ 
  fname: {string, mandatory},
  lname: {string, mandatory},
  email: {string, mandatory, valid email, unique},
  profileImage: {string, mandatory}, // s3 link
  phone: {string, mandatory, unique, valid Indian mobile number},
  password: {string, mandatory, minLen 8, maxLen 15}, // encrypted password
  address: {
    shipping: {
      street: {string},
      city: {string},
      pincode: {string}
    }, {mandatory}
    billing: {
      street: {string},
      city: {string},
      pincode: {string}
    }
  },
  createdAt: {timestamp},
  updatedAt: {timestamp}
}
```

- Product Model
```yaml
{ 
  title: {string, mandatory, unique},
  description: {string, mandatory},
  price: {number, mandatory, valid number/decimal},
  currencyId: {string, mandatory, INR},
  currencyFormat: {string, mandatory, Rupee symbol},
  isFreeShipping: {boolean, default: false},
  productImage: {string, mandatory},  // s3 link
  style: {string},
  availableSizes: {array of string, at least one size, enum["S", "XS","M","X", "L","XXL", "XL"]},
  installments: {number},
  deletedAt: {Date, when the document is deleted}, 
  isDeleted: {boolean, default: false},
  createdAt: {timestamp},
  updatedAt: {timestamp},
}
```

- Cart Model
```yaml
{
  userId: {ObjectId, refs to User, mandatory, unique},
  items: [productDocument + quantity],
  totalPrice: {number, mandatory, comment: "Holds total price of all the items in the cart"},
  totalItems: {number, mandatory, comment: "Holds total number of items in the cart"},
  createdAt: {timestamp},
  updatedAt: {timestamp},
}
```

- Order Model
```yaml
{
  userId: {ObjectId, refs to User, mandatory},
  items: [productDocument + quantity],
  totalPrice: {number, mandatory, comment: "Holds total price of all the items in the cart"},
  totalItems: {number, mandatory, comment: "Holds total number of items in the cart"},
  totalQuantity: {number, mandatory, comment: "Holds total number of items in the cart"},
  cancellable: {boolean, default: true},
  status: {string, default: 'pending', enum[pending, completed, cancled]}
  createdAt: {timestamp},
  updatedAt: {timestamp},
}
```

## User APIs 
### POST /register
- Create a user - atleast 5 users
- Create a user document from request body.
- Should save password in encrypted format. (bcrypt)
- Return HTTP status 201 on a succesful user creation. Also return the user document. The response should be a JSON object like [this](#successful-response-structure)
- Return HTTP status 400 if no params or invalid params received in request body. The response should be a JSON object like [this](#error-response-structure)

### POST /login
- Allow an user to login with their email and password.
- On a successful login attempt return a JWT token contatining the userId, exp, iat. The response should be a JSON object like [this](#successful-response-structure)
- If the credentials are incorrect return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

## PUT /user/:userId/profile
- Allow an user to update their profile.
- A user can update all the fields except email id
- On a successful operation return updated user document. The response should be a JSON object like [this](#successful-response-structure)
- On a failed operation return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

## Products API (No authentication required)
### POST /products
- Create a product document from request body.
- Return HTTP status 201 on a succesful product creation. Also return the product document. The response should be a JSON object like [this](#successful-response-structure) 
- Return HTTP status 400 for an invalid request with a response body like [this](#error-response-structure)

### GET /products
- Returns all products in the collection that aren't deleted. Response example [here](#get-products-response)
- Return the HTTP status 200 if any documents are found. The response structure should be like [this](#successful-response-structure) 
- If no documents are found then return an HTTP status 404 with a response like [this](#error-response-structure) 
- Filter products list by applying filters. Query param can have any combination of below filters.
  - Size
  - Product name
  - Price - greater than or less than
  example of a query url: products?filtername=filtervalue&f2=fv2
- Return all products sorted by product price in ascending order or descending order.

### GET /products/:productId
- Returns a product with complete details
- Return the HTTP status 200 if any documents are found. The response structure should be like [this](#successful-response-structure) 
- If no documents are found then return an HTTP status 404 with a response like [this](#error-response-structure) 

### PUT /products/:productId
- Update a product. Can change any field value.
- Check if the productId exists (must have isDeleted false and is present in collection). If it doesn't, return an HTTP status 404 with a response body like [this](#error-response-structure)
- Return an HTTP status 200 if updated successfully with a body like [this](#successful-response-structure) 
- Also make sure in the response you return the updated product document.

### DELETE /products/:productId
- Check if the productId exists and is not deleted. If it does, mark it deleted and return an HTTP status 200 with a response body with status and message.
- If the product document doesn't exist then return an HTTP status of 404 with a body like [this](#error-response-structure) 

## Cart APIs (authentication required - as authorization header - bearer token)
### POST /users/:userId/cart (Add to cart)
- Create a cart for the user if it does not exist. Else add product(s) in cart.
- Get cart id in request body.
- Make sure that cart exist.
- Add a product(s) for a user in the cart.
- Make sure the userId in params and in JWT token match.
- Make sure the user exist
- Make sure the product(s) are valid and not deleted.
- Get product(s) details in request body.
- Return the updated cart document on successful operation. The response body should be in the form of JSON object like [this](#successful-response-structure)

### PUT /users/:userId/cart (Remove product from the cart)
- Get cart id in request body.
- Make sure that cart exist.
- Remove product(s) from cart.
- Make sure the userId in params and in JWT token match.
- Make sure the user exist
- Check if the productId exists and is not deleted before updating the cart.
- Return the updated cart document on successful operation. The response body should be in the form of JSON object like [this](#successful-response-structure)

### GET /users/:userId/cart
- Returns cart summary of the user.
- Make sure that cart exist.
- Make sure the userId in params and in JWT token match.
- Make sure the user exist

## Checkout/Order APIs (Authentication and authorization required)
### POST /users/:userId/orders
- Create an order for the user
- Make sure the userId in params and in JWT token match.
- Make sure the user exist
- Get cart details in the request body
- Return the order document on successful operation. The response body should be in the form of JSON object like [this](#successful-response-structure)

## PUT /users/:userId/orders
- Updates an order status
- Make sure the userId in params and in JWT token match.
- Make sure the user exist
- Get order id in request body
- Make sure the order belongs to the user
- Return the updated order document on successful operation. The response body should be in the form of JSON object like [this](#successful-response-structure)

## Testing 
- To test these apis create a new collection in Postman named Project 3 products Management 
- Each api should have a new request in this collection
- Each request in the collection should be rightly named. Eg Create user, Create product, Get products etc
- Each member of each team should have their tests in running state

Refer below sample
 ![A Postman collection and request sample](assets/Postman-collection-sample.png)

## Response

### Successful Response structure
```yaml
{
  status: true,
  message: 'Success',
  data: {

  }
}
```
### Error Response structure
```yaml
{
  status: false,
  message: ""
}
```

## Collections
## users
```yaml
{
  _id: ObjectId("88abc190ef0288abc190ef02"),
  title: "Mr",
  name: "John Doe",
  phone: 9897969594,
  email: "johndoe@mailinator.com", 
  password: "abcd1234567",
  address: {
    street: "110, Ridhi Sidhi Tower",
    city: "Jaipur",
    pincode: 400001
  },
  "createdAt": "2021-09-17T04:25:07.803Z",
  "updatedAt": "2021-09-17T04:25:07.803Z",
}
```
### products
```yaml
{
  "_id": ObjectId("88abc190ef0288abc190ef55"),
  "title": "How to win friends and influence people",
  "excerpt": "product body",
  "userId": ObjectId("88abc190ef0288abc190ef02"),
  "ISBN": "978-0008391331",
  "category": "product",
  "subcategory": "Non fiction",
  "deleted": false,
  "reviews": 0,
  "deletedAt": "", // if deleted is true deletedAt will have a date 2021-09-17T04:25:07.803Z,
  "releasedAt": "2021-09-17T04:25:07.803Z"
  "createdAt": "2021-09-17T04:25:07.803Z",
  "updatedAt": "2021-09-17T04:25:07.803Z",
}
```

### reviews
```yaml
{
  "_id": ObjectId("88abc190ef0288abc190ef88"),
  productId: ObjectId("88abc190ef0288abc190ef55"),
  reviewedBy: "Jane Doe",
  reviewedAt: "2021-09-17T04:25:07.803Z",
  rating: 4,
  review: "An exciting nerving thriller. A gripping tale. A must read product."
}
```

## Response examples
### Get products response
```yaml
{
  status: true,
  message: 'products list',
  data: [
    {
      "_id": ObjectId("88abc190ef0288abc190ef55"),
      "title": "How to win friends and influence people",
      "excerpt": "product body",
      "userId": ObjectId("88abc190ef0288abc190ef02")
      "category": "product",
      "reviews": 0,
      "releasedAt": "2021-09-17T04:25:07.803Z"
    },
    {
      "_id": ObjectId("88abc190ef0288abc190ef56"),
      "title": "How to win friends and influence people",
      "excerpt": "product body",
      "userId": ObjectId("88abc190ef0288abc190ef02")
      "category": "product",
      "reviews": 0,
      "releasedAt": "2021-09-17T04:25:07.803Z"
    }
  ]
}
```

### product details response
```yaml
{
  status: true,
  message: 'products list',
  data: {
    "_id": ObjectId("88abc190ef0288abc190ef55"),
    "title": "How to win friends and influence people",
    "excerpt": "product body",
    "userId": ObjectId("88abc190ef0288abc190ef02")
    "category": "product",
    "subcategory": "Non fiction", "Self Help"],
    "deleted": false,
    "reviews": 0,
    "deletedAt": "", // if deleted is true deletedAt will have a date 2021-09-17T04:25:07.803Z,
    "releasedAt": "2021-09-17T04:25:07.803Z"
    "createdAt": "2021-09-17T04:25:07.803Z",
    "updatedAt": "2021-09-17T04:25:07.803Z",
    "reviewsData": [
      {
        "_id": ObjectId("88abc190ef0288abc190ef88"),
        productId: ObjectId("88abc190ef0288abc190ef55"),
        reviewedBy: "Jane Doe",
        reviewedAt: "2021-09-17T04:25:07.803Z",
        rating: 4,
        review: "An exciting nerving thriller. A gripping tale. A must read product."
      },
      {
        "_id": ObjectId("88abc190ef0288abc190ef89"),
        productId: ObjectId("88abc190ef0288abc190ef55"),
        reviewedBy: "Jane Doe",
        reviewedAt: "2021-09-17T04:25:07.803Z",
        rating: 4,
        review: "An exciting nerving thriller. A gripping tale. A must read product."
      },
      {
        "_id": ObjectId("88abc190ef0288abc190ef90"),
        productId: ObjectId("88abc190ef0288abc190ef55"),
        reviewedBy: "Jane Doe",
        reviewedAt: "2021-09-17T04:25:07.803Z",
        rating: 4,
        review: "An exciting nerving thriller. A gripping tale. A must read product."
      },
      {
        "_id": ObjectId("88abc190ef0288abc190ef91"),
        productId: ObjectId("88abc190ef0288abc190ef55"),
        reviewedBy: "Jane Doe",
        reviewedAt: "2021-09-17T04:25:07.803Z",
        rating: 4,
        review: "An exciting nerving thriller. A gripping tale. A must read product."
      }, 
    ]
  }
}
```

### product details response no reviews
```yaml
{
  status: true,
  message: 'products list',
  data: {
    "_id": ObjectId("88abc190ef0288abc190ef55"),
    "title": "How to win friends and influence people",
    "excerpt": "product body",
    "userId": ObjectId("88abc190ef0288abc190ef02")
    "category": "product",
    "subcategory": "Non fiction", "Self Help"],
    "deleted": false,
    "reviews": 0,
    "deletedAt": "", // if deleted is true deletedAt will have a date 2021-09-17T04:25:07.803Z,
    "releasedAt": "2021-09-17T04:25:07.803Z"
    "createdAt": "2021-09-17T04:25:07.803Z",
    "updatedAt": "2021-09-17T04:25:07.803Z",
    "reviewsData": []
  }
}
```