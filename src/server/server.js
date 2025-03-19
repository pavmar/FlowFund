

// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const { graphqlHTTP } = require('express-graphql');
// const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLID } = require('graphql');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// // Initialize express app
// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));

// // User Schema and Model
// const userSchema = new mongoose.Schema({
//   fullName: String,
//   email: { type: String, unique: true },
//   phone: String,
//   password: String, // Hashed password will be stored here
// });

// const User = mongoose.model('User', userSchema);

// // GraphQL Types

// // UserType for returning user data
// const UserType = new GraphQLObjectType({
//   name: 'User',
//   fields: () => ({
//     id: { type: GraphQLID },
//     fullName: { type: GraphQLString },
//     email: { type: GraphQLString },
//     phone: { type: GraphQLString },
//   }),
// });

// // Root Query (optional for testing)
// const RootQuery = new GraphQLObjectType({
//   name: 'RootQueryType',
//   fields: {
//     hello: {
//       type: GraphQLString,
//       resolve() {
//         return 'Hello, world!';
//       },
//     },
//   },
// });

// // Root Mutation for registering and logging in a user
// const Mutation = new GraphQLObjectType({
//   name: 'Mutation',
//   fields: {
//     createUser: {
//       type: UserType,
//       args: {
//         fullName: { type: GraphQLString },
//         email: { type: GraphQLString },
//         phone: { type: GraphQLString },
//         password: { type: GraphQLString },
//       },
//       resolve: async (parent, args) => {
//         const { fullName, email, phone, password } = args;

//         // Check if user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//           throw new Error('User already exists.');
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create new user
//         const newUser = new User({
//           fullName,
//           email,
//           phone,
//           password: hashedPassword,
//         });

//         // Save the new user to the database
//         await newUser.save();

//         return newUser;
//       },
//     },
//     loginUser: {
//       type: GraphQLString, // Return a token instead of UserType
//       args: {
//         email: { type: GraphQLString },
//         password: { type: GraphQLString },
//       },
//       resolve: async (parent, args) => {
//         const { email, password } = args;

//         // Find the user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//           throw new Error('User not found.');
//         }

//         // Compare the provided password with the hashed password
//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) {
//           throw new Error('Invalid password.');
//         }

//         // Generate a JWT
//         const token = jwt.sign(
//           { id: user.id, email: user.email },
//           process.env.JWT_SECRET, // Use a secret key from environment variables
//           { expiresIn: '1h' } // Token expires in 1 hour
//         );

//         // Return the token
//         return token;
//       },
//     },
//   },
// });

// // GraphQL Schema
// const schema = new GraphQLSchema({
//   query: RootQuery,
//   mutation: Mutation,
// });

// // GraphQL Endpoint
// app.use('/graphql', graphqlHTTP({
//   schema,
//   graphiql: true, // Enable GraphiQL interface for testing
// }));

// // Middleware to verify JWT token
// const verifyToken = (req, res, next) => {
//   const token = req.headers['authorization'];
//   if (!token) return res.status(403).send('Token is required');

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).send('Invalid token');
//   }
// };

// // Example protected route
// app.get('/protected', verifyToken, (req, res) => {
//   res.send(`Welcome ${req.user.email}`);
// });

// // Set up the server
// const PORT = process.env.PORT || 9090;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

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
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// User Schema and Model
const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  phone: String,
  password: String, // Hashed password will be stored here
});

const User = mongoose.model('User', userSchema);

// GraphQL Types

// UserType for returning user data
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    fullName: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
  }),
});

// Root Query (optional for testing)
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    hello: {
      type: GraphQLString,
      resolve() {
        return 'Hello, world!';
      },
    },
  },
});

// Root Mutation for registering and logging in a user
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: UserType,
      args: {
        fullName: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const { fullName, email, phone, password } = args;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error('User already exists.');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
          fullName,
          email,
          phone,
          password: hashedPassword,
        });

        // Save the new user to the database
        await newUser.save();

        return newUser;
      },
    },
    loginUser: {
      type: GraphQLString, // Return a token instead of UserType
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const { email, password } = args;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error('User not found.');
        }

        // Compare the provided password with the hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid password.');
        }

        // Generate a JWT
        const token = jwt.sign(
          { id: user.id, email: user.email, fullName: user.fullName }, // Include fullName in the token payload
          process.env.JWT_SECRET, // Use a secret key from environment variables
          { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Return the token
        return token;
      },
    },
  },
});

// GraphQL Schema
const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});

// GraphQL Endpoint
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true, // Enable GraphiQL interface for testing
}));

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token is required');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send('Invalid token');
  }
};

// Example protected route
app.get('/protected', verifyToken, (req, res) => {
  res.send(`Welcome ${req.user.fullName}`);
});

// Set up the server
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));