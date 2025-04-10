
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLID } = require('graphql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// User Schema and Model
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  password: { type: String, required: true },
  profileImage: String,
  walletAddress: String
});

const User = mongoose.model('User', userSchema);

// GraphQL Types
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    fullName: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    profileImage: { type: GraphQLString },
    walletAddress: { type: GraphQLString }
  })
});

// Root Query
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    hello: {
      type: GraphQLString,
      resolve() { return 'Hello, world!'; }
    },
    me: {
      type: UserType,
      resolve(parent, args, context) {
        if (!context.user) throw new Error('Not authenticated');
        return User.findById(context.user.userId);
      }
    }
  }
});

// Root Mutation
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // User Registration
    createUser: {
      type: UserType,
      args: {
        fullName: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        password: { type: GraphQLString }
      },
      resolve: async (parent, args) => {
        const existingUser = await User.findOne({ email: args.email });
        if (existingUser) throw new Error('User already exists.');

        const hashedPassword = await bcrypt.hash(args.password, 10);
        const newUser = new User({
          fullName: args.fullName,
          email: args.email,
          phone: args.phone,
          password: hashedPassword
        });

        return await newUser.save();
      }
    },

    // User Login
    loginUser: {
      type: GraphQLString,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString }
      },
      resolve: async (parent, args) => {
        const user = await User.findOne({ email: args.email });
        if (!user) throw new Error('User not found.');

        const validPassword = await bcrypt.compare(args.password, user.password);
        if (!validPassword) throw new Error('Invalid password.');

        return jwt.sign(
          { 
            userId: user._id,
            fullName: user.fullName,
            email: user.email 
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
      }
    },

    // Update User Profile
    updateUser: {
      type: UserType,
      args: {
        fullName: { type: GraphQLString },
        currentPassword: { type: GraphQLString },
        newPassword: { type: GraphQLString },
        profileImage: { type: GraphQLString },
        walletAddress: { type: GraphQLString }
      },
      resolve: async (parent, args, context) => {
        if (!context.user) throw new Error('Not authenticated');
        
        const user = await User.findById(context.user.userId);
        if (!user) throw new Error('User not found');

        const updates = {};
        
        // Update full name if provided
        if (args.fullName) {
          updates.fullName = args.fullName;
        }

        // Update password if provided (with verification)
        if (args.newPassword) {
          if (!args.currentPassword) throw new Error('Current password is required');
          
          const validPassword = await bcrypt.compare(args.currentPassword, user.password);
          if (!validPassword) throw new Error('Current password is incorrect');
          
          updates.password = await bcrypt.hash(args.newPassword, 10);
        }

        // Update profile image if provided
        if (args.profileImage) {
          updates.profileImage = args.profileImage;
        }

        // Update wallet address if provided
        if (args.walletAddress) {
          updates.walletAddress = args.walletAddress;
        }

        return User.findByIdAndUpdate(context.user.userId, updates, { new: true });
      }
    },

    // Delete User Account
    deleteUser: {
      type: UserType,
      args: {
        password: { type: GraphQLString }
      },
      resolve: async (parent, args, context) => {
        if (!context.user) throw new Error('Not authenticated');
        
        const user = await User.findById(context.user.userId);
        if (!user) throw new Error('User not found');

        const validPassword = await bcrypt.compare(args.password, user.password);
        if (!validPassword) throw new Error('Invalid password');

        const deletedUser = await User.findByIdAndDelete(context.user.userId);
        if (!deletedUser) throw new Error('Failed to delete user');
        
        return deletedUser;
      }
    }
  }
});

// GraphQL Schema
const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});

// Authentication Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return next(); // Continue without user context
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).send('Invalid token');
  }
};

// GraphQL Endpoint with Context
app.use('/graphql', verifyToken, graphqlHTTP((req) => ({
  schema,
  graphiql: true,
  context: { user: req.user }
})));

// Protected route example
app.get('/protected', verifyToken, (req, res) => {
  if (!req.user) return res.status(403).send('Token is required');
  res.send(`Welcome ${req.user.fullName}`);
});

// Start server
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

