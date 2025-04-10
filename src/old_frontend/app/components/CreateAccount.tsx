// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
// import { gql, useMutation } from '@apollo/client';

// // GraphQL Mutation for creating a user
// const CREATE_USER = gql`
//   mutation CreateUser($fullName: String!, $email: String!, $phone: String!, $password: String!) {
//     createUser(fullName: $fullName, email: $email, phone: $phone, password: $password) {
//       id
//       fullName
//       email
//       phone
//     }
//   }
// `;

// const CreateAccount = () => {
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [successMessage, setSuccessMessage] = useState(''); // New state for success message

//   // Email validation function
//   const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

//   // Password validation function (at least 6 chars, 1 number)
//   const isValidPassword = (password: string) => /^(?=.*\d).{6,}$/.test(password);

//   const [createUser, { loading }] = useMutation(CREATE_USER, {
//     onCompleted: (data) => {
//       // Set success message
//       setSuccessMessage('User registered successfully!');

//       // Reset fields after success
//       setFullName('');
//       setEmail('');
//       setPhone('');
//       setPassword('');
//       setError('');
//     },
//     onError: (error) => {
//       // Handle specific error messages from the server
//       if (error.message.includes('User already exists')) {
//         setError('User already exists. Please login.');
//       } else {
//         setError('Failed to create account. Please try again.');
//       }
//       console.error(error);
//     },
//   });

//   const handleRegister = async () => {
//     if (!fullName || !email || !phone || !password) {
//       setError('All fields are required!');
//       return;
//     }

//     if (!isValidEmail(email)) {
//       setError('Invalid email address');
//       return;
//     }

//     if (!isValidPassword(password)) {
//       setError('Password must be at least 6 characters and contain a number');
//       return;
//     }

//     try {
//       await createUser({
//         variables: { fullName, email, phone, password },
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Create Account</Text>

//       {/* Display success message */}
//       {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

//       {/* Display error message */}
//       {error ? <Text style={styles.errorText}>{error}</Text> : null}

//       <TextInput
//         style={styles.input}
//         placeholder="Full Name"
//         value={fullName}
//         onChangeText={setFullName}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         keyboardType="email-address"
//         value={email}
//         onChangeText={setEmail}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Phone Number"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
//         <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//     padding: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   input: {
//     width: '80%',
//     padding: 12,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     fontSize: 16,
//     color: '#333',
//   },
//   button: {
//     backgroundColor: '#2DAA9E',
//     paddingVertical: 14,
//     paddingHorizontal: 40,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   buttonText: {
//     fontSize: 18,
//     color: '#fff',
//     fontWeight: '600',
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 14,
//     marginBottom: 10,
//   },
//   successText: {
//     color: 'green',
//     fontSize: 14,
//     marginBottom: 10,
//   },
// });

// export default CreateAccount;

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Add navigation
import { gql, useMutation } from '@apollo/client';

// GraphQL Mutation for creating a user
const CREATE_USER = gql`
  mutation CreateUser($fullName: String!, $email: String!, $phone: String!, $password: String!) {
    createUser(fullName: $fullName, email: $email, phone: $phone, password: $password) {
      id
      fullName
      email
      phone
    }
  }
`;

const CreateAccount = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigation = useNavigation(); // Initialize navigation

  // Email validation function
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Password validation function (at least 6 chars, 1 number)
  const isValidPassword = (password: string) => /^(?=.*\d).{6,}$/.test(password);

  const [createUser, { loading }] = useMutation(CREATE_USER, {
    onCompleted: (data) => {
      // Set success message
      setSuccessMessage('User registered successfully!');

      // Reset fields after success
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setError('');

      // Redirect to login screen after 2 seconds
      setTimeout(() => {
        navigation.navigate('Login'); // Replace 'Login' with your login screen name
      }, 2000);
    },
    onError: (error) => {
      // Handle specific error messages from the server
      if (error.message.includes('User already exists')) {
        setError('User already exists. Please login.');
      } else {
        setError('Failed to create account. Please try again.');
      }
      console.error(error);
    },
  });

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !password) {
      setError('All fields are required!');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Invalid email address');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters and contain a number');
      return;
    }

    try {
      await createUser({
        variables: { fullName, email, phone, password },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {/* Display success message */}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

      {/* Display error message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#2DAA9E',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  successText: {
    color: 'green',
    fontSize: 14,
    marginBottom: 10,
  },
});

export default CreateAccount;