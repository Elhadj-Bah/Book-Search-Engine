import User from "../models/User.js";
import {signToken, AuthenticationError} from "../utils/auth.js";

const resolvers = {
    Query: {
        me: async (_parent:any, _args: any, context: any) => {
            if (context.user) {
                return User.findOne({_id: context.user._id}).populate("savedBooks");
            }
            throw AuthenticationError("You need to be logged in!");
        }
    },  
 Mutation: {
    addUser: async (_parent: any, {username, email, password}: any)  => {
        
        // create a new user with the provided username, email, and password
        const user = await User.create({username, email, password});

        const token = signToken(user.username, user.email, user._id);

        return {token, user};
    },


    login: async (_parent: any, {email, password}: LoginUserArgs) => {
        // find a user with the provided email

        const user = await User.findOne({email});

        // if there is no user with throw an AuthenticationError
        if (!user) {
            throw new AuthenticationError("No user found with this email address");
        }

        // check if the provided password is correct

        const correctPw = await user.isCorrectPassword(password);

        // if the password is incorrect, throw an AuthenticationError   
        if (!correctPw) {
         throw new AuthenticationError ("Incorrect credentials");
        
        }

        // sign a token with the user information

        const token = signToken(user.username, user.email, user._id);
        return {token, user};
    },


    // save a book to a user's `savedBooks`;


    saveBook: async (_parent: any, {input}: any, context: any) => {
        if (context.user) {
            return User.findOneAndUpdate(
                context.user._id,
                {$addToSet: {savedBooks: input}},
                {new: true, runValidators: true}
            ).populate("savedBooks");
        }   
        throw new AuthenticationError("You need to be logged in!");
    }
    // remove a book from `savedBooks`
    removeBook: async (_parent: any, {bookId}: any, context: any) => {
        if (context.user) {
            return User.findOneAndUpdate(
                context.user._id,
                {$pull: {savedBooks: {bookId}}},
                {new: true}
            ).populate("savedBooks");
        }
        throw new AuthenticationError("You need to be logged in!");
    }
}
};
export default resolvers;

     

