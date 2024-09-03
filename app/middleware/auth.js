import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const { token } = {
    ...req.body,
    ...req.headers,
    ...req.query,
    ...req.cookies,
  };

  console.log(token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("JWT verify error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
