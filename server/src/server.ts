import express from "express";
import { Request, Response } from "express";
import path from "node:path";
import db from "./config/connection.js";
import routes from "./routes/index.js";
import { typeDefs, resolvers } from "./schemas/index.js";
import { ApolloServer } from "apollo-server-express";
import { authenticateToken, expressMiddleware } from "./services/auth.js"; // Import the expressMiddleware function

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Implement of the Apollo Server

const startApolloServer = async () => {
  await server.start();
  await db();

  const PORT = process.env.PORT || 3001;

  // configuaration of the express server

  const app = express();

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
    app.use(express.static(path.join(__dirname, "../client/build")));
  }

  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
};

app.listen(PORT, () => {
  console.log(`🌍 Now listening on localhost:${PORT}`);
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
});

//
startApolloServer();
