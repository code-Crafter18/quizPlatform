import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token provided, authorization denied" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({ error: "Invalid token, authorization denied" });
    }
};

export { authMiddleware, JWT_SECRET };
