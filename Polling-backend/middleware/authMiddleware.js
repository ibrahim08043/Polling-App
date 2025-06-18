const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  console.log("TOKEN RECEIVED:", token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized. Please login to continue." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT ERROR:", err);
    return res.status(401).json({ message: "Invalid token. Please login again." });
  }
};
