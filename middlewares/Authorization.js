const jwt = require("jsonwebtoken");
require("dotenv").config();

const Authorization = async (req, res, next) => {
  const token = req.headers.authorization;
  try {
    jwt.verify(token, process.env.secretKey, (err, success) => {
      if (err) {
        res.status(401).json({
          msg: "Unautorized",
        });
      } else {
        next();
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { Authorization };
