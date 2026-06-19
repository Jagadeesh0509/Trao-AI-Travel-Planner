const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Read token from Authorization Header: "Bearer <Token>"
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Access Denied. Missing or malformed Auth Token',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the verified user identity payload directly to the request context
    req.user = verified;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    return res.status(400).json({ message: 'Invalid or expired security token.' });
  }
};
