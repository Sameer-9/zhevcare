export const authMiddleware = (req, res, next) => {
  const { token } = {
    ...req.body.token,
    ...req.headers.token,
    ...req.query.token,
    ...req.cookies.token,
  };

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};