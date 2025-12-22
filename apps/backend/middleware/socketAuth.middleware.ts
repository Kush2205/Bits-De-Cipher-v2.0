import { Socket } from "socket.io";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {

    let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!token) {
      console.error(`Auth failed: No token provided for socket ${socket.id}`);
      return next(new Error("Authentication error: Token not provided"));
    }


    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    socket.data.userId = decoded.userId;
    
    console.log(`Socket Authenticated: ${decoded.userId}`);
    next();
  } catch (error) {
    console.error("Socket Auth Error:", error instanceof Error ? error.message : "Invalid Token");
    return next(new Error("Authentication error: Invalid token"));
  }
};