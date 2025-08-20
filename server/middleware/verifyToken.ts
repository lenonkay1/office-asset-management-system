import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret";

export interface AuthenticatedRequest extends Request {
  user?: jwt.JwtPayload; // More specific type
}

export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // 1. Check multiple token sources
  const token =
    req.headers["authorization"]?.split(" ")[1] || // Bearer token
    req.headers["x-access-token"] || // Alternative header
    req.cookies?.token; // Cookie-based auth

  if (!token) {
    return res.status(401).json({ 
      message: "Authentication required",
      details: "No token provided in Authorization header, x-access-token header, or cookies"
    });
  }

  // 2. Verify token
  jwt.verify(token, SECRET_KEY, (err: jwt.VerifyErrors | null, decoded: any) => {
    if (err) {
      console.error("JWT verification error:", err.name);
      
      const errorResponse: { message: string, details?: string } = {
        message: "Invalid token",
      };

      // More specific error messages
      if (err.name === "TokenExpiredError") {
        errorResponse.message = "Token expired";
        errorResponse.details = "Please refresh your token";
        return res.status(401).json(errorResponse);
      }
      if (err.name === "JsonWebTokenError") {
        errorResponse.details = "Malformed token";
      }
      
      return res.status(403).json(errorResponse);
    }

    // 3. Attach user data to request
    req.user = decoded as jwt.JwtPayload;
    next();
  });
}

export default verifyToken;