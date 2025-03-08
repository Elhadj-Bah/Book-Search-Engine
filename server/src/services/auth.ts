import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();
console.log("ENV: ", process.env.JWT_SECRET_KEY);

export const authenticateToken = ({ req }: any) => {
  // alow token to b sent via req.body, req.query or headers
  let token = req.body.token || req.query.token || req.headers.authorization;
  console.log("Server token: ", token);
  // if token was sent via headers, we need to extract it
  if (req.headers.authorization) {
    token = token.split(" ").pop().trim();
  }

  // if there is no token at all, we return the request object as is
  if (!token) {
    return req;
  }

  // try to verify the token

  try {
    const { data }: any = jwt.verify(token, process.env.JWT_SECRET_KEY || "", {
      maxAge: "2hr",
    });
    // if token is valid, add the user's data to the request object
    req.user = data;
  } catch (error) {
    console.log("invalid token");
  }
  // return the request object
  return req;
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey: any = process.env.JWT_SECRET_KEY || "";

  return jwt.sign({ data: payload }, secretKey, { expiresIn: "2h" });
};

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, undefined, undefined, undefined, ["UNAUTHENTICATED"]);
    Object.defineProperty(this, "name", { value: "AuthenticationError" });
  }
}
