import express from "express";
import { Request, Response } from "express";
import path from "node:path";
const __dirname = import.meta.dirname;
//import { dirname } from "node:path";
//import { fileURLToPath } from "node:url";
//const __dirname = dirname(fileURLToPath(import.meta.url));

import db from "./config/connection.js";
//import routes from "./routes/index.js";
import { typeDefs, resolvers } from "./schemas/index.js";
import { ApolloServer } from "@apollo/server";
import { authenticateToken } from "./services/auth.js"; // Import the expressMiddleware function
import { expressMiddleware } from "@apollo/server/express4";
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const PORT = process.env.PORT || 3001;

// configuaration of the express server\
const app = express();

// Implement of the Apollo Server
const startApolloServer = async () => {
  await server.start();
  await db;

  // Middleware

  app.use(express.urlencoded({ extended: true }));

  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware(server as any, {
      context: authenticateToken as any,
    })
  );

  // if we're in production, serve client/build as static assets

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../../client/dist")));
    // app.use(express.static(path.join("../../client/dist")));

    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
      //res.sendFile(path.join("../../client/dist/index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

//
startApolloServer();
