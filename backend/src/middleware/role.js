const { httpError } = require("../utils/helpers");

const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(httpError(403, `Access denied. Requires one of roles: ${allowedRoles.join(", ")}`));
    }
    next();
  };
};

module.exports = { requireRoles };
