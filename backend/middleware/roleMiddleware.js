/**
 * Role-based access control middleware
 */

/**
 * Check if user has required role
 * @param  {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please login'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

/**
 * Check if user is approved (for doctors and nurses)
 */
export const checkApprovalStatus = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, please login'
    });
  }

  // Admin users don't need approval
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if doctor, nurse, or lab assistant is approved
  if ((req.user.role === 'doctor' || req.user.role === 'nurse' || req.user.role === 'lab_assistant') && req.user.status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: `Your account is ${req.user.status}. Please wait for admin approval.`,
      status: req.user.status
    });
  }

  next();
};

/**
 * Admin only middleware
 */
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, please login'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

/**
 * Doctor only middleware (with approval check)
 */
export const doctorOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, please login'
    });
  }

  if (req.user.role !== 'doctor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Doctor privileges required.'
    });
  }

  if (req.user.status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: `Your account is ${req.user.status}. Please wait for admin approval.`,
      status: req.user.status
    });
  }

  next();
};

/**
 * Nurse only middleware (with approval check)
 */
export const nurseOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, please login'
    });
  }

  if (req.user.role !== 'nurse') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Nurse privileges required.'
    });
  }

  if (req.user.status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: `Your account is ${req.user.status}. Please wait for admin approval.`,
      status: req.user.status
    });
  }

  next();
};

/**
 * Lab assistant only middleware (with approval check)
 */
export const labAssistantOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, please login'
    });
  }

  if (req.user.role !== 'lab_assistant') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Lab assistant privileges required.'
    });
  }

  if (req.user.status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: `Your account is ${req.user.status}. Please wait for admin approval.`,
      status: req.user.status
    });
  }

  next();
};

/**
 * Staff only middleware (nurse or lab_assistant with approval check)
 */
export const staffOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, please login'
    });
  }

  if (req.user.role !== 'nurse' && req.user.role !== 'lab_assistant') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Staff privileges required (nurse or lab assistant).'
    });
  }

  if (req.user.status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: `Your account is ${req.user.status}. Please wait for admin approval.`,
      status: req.user.status
    });
  }

  next();
};