import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables before reading them
// (ES module imports execute before dotenv.config() in index.js)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config(); // Also try CWD/.env as fallback

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("\n❌ FATAL: JWT_SECRET is not set in your environment variables.");
    console.error("   Add JWT_SECRET=your-secret-here to Backend/.env\n");
    process.exit(1);
}

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
