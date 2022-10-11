const jwt = require("jsonwebtoken")


const authenticate = function (req, res, next) {
    try {
      const token = req.headers["x-api-key"]
  
      // token validation.
      if (!token) {
        return res
          .status(400)
          .send({ status: false, message: "token must be present" });
      } else {
        jwt.verify(token, "plutonium-63", function (err, data) {
          if (err) {
            return res.status(400).send({ status: false, message: err.message });
          } else {
            req.loginUserId = data.userId;
            next();
          }
        });
      }
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  };



module.exports ={authenticate}
  