import User from "../models/User.js";
import { signToken, AuthenticationError } from "../services/auth.js";

const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate("savedBooks");
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
  Mutation: {
    addUser: async (_parent: any, { username, email, password }: any) => {
      console.log("incoming data: ", username, email, password);
      // create a new user with the provided username, email, and password
      const user = await User.create({ username, email, password });
      console.log("User created: ", user);
      const token = signToken(user.username, user.email, user._id);
      console.log("Token created: ", token);
      return { token, user };
    },

    login: async (_parent: any, { email, password }: any) => {
      // find a user with the provided email

      const user = await User.findOne({ email });

      // if there is no user with throw an AuthenticationError
      if (!user) {
        throw new AuthenticationError("No user found with this email address");
      }

      // check if the provided password is correct

      const correctPw = await user.isCorrectPassword(password);

      // if the password is incorrect, throw an AuthenticationError
      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      // sign a token with the user information

      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    // save a book to a user's `savedBooks`;
    // methodName : (parentArgument, args(incoming data arguments), context) => {functionality}
    saveBook: async (_parent: any, { input }: any, context: any) => {
      console.log("incoming data: ", input);
      console.log("context data: ", context.user);

      if (context.user) {
        const user = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true }
        ).populate("savedBooks");
        console.log("User updated: ", user);
        return user;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    // remove a book from `savedBooks`
    removeBook: async (_parent: any, { bookId }: any, context: any) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate("savedBooks");
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

export default resolvers;
