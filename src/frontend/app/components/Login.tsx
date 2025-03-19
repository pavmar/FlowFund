// // import React, { useState } from 'react';
// // import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
// // import { useNavigation } from '@react-navigation/native';
// // import { gql, useQuery } from '@apollo/client';

// // // GraphQL Query to check user credentials
// // const LOGIN_USER = gql`
// //   query LoginUser($email: String!, $password: String!) {
// //     loginUser(email: $email, password: $password) {
// //       id
// //       fullName
// //       email
// //       phone
// //     }
// //   }
// // `;

// // const Login = () => {
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [error, setError] = useState('');
// //   const navigation = useNavigation();

// //   const { loading, refetch } = useQuery(LOGIN_USER, {
// //     variables: { email, password },
// //     skip: true, // Skip the query on mount
// //   });

// //   const handleLogin = async () => {
// //     if (!email || !password) {
// //       setError('Email and Password are required!');
// //       return;
// //     }

// //     try {
// //       const { data } = await refetch({ email, password });

// //       if (data?.loginUser) {
// //         Alert.alert('Login Successful', `Welcome, ${data.loginUser.fullName}!`);
// //         navigation.navigate('MainMenu'); // Navigate to MainMenu
// //       } else {
// //         setError('Invalid email or password.');
// //       }
// //     } catch (error) {
// //       setError('Failed to login. Please try again.');
// //       console.error(error);
// //     }
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.title}>Login</Text>

// //       {error ? <Text style={styles.errorText}>{error}</Text> : null}

// //       <TextInput
// //         style={styles.input}
// //         placeholder="Email"
// //         keyboardType="email-address"
// //         value={email}
// //         onChangeText={setEmail}
// //       />
// //       <TextInput
// //         style={styles.input}
// //         placeholder="Password"
// //         secureTextEntry
// //         value={password}
// //         onChangeText={setPassword}
// //       />

// //       <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
// //         <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
// //       </TouchableOpacity>

// //       <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
// //         <Text style={styles.registerText}>Don't have an account? Sign up</Text>
// //       </TouchableOpacity>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#F5F5F5',
// //     padding: 20,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   title: {
// //     fontSize: 32,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     textAlign: 'center',
// //     marginBottom: 30,
// //   },
// //   input: {
// //     width: '80%',
// //     padding: 12,
// //     marginBottom: 10,
// //     borderWidth: 1,
// //     borderColor: '#ccc',
// //     borderRadius: 8,
// //     fontSize: 16,
// //     color: '#333',
// //   },
// //   button: {
// //     backgroundColor: '#2DAA9E',
// //     paddingVertical: 14,
// //     paddingHorizontal: 40,
// //     borderRadius: 8,
// //     alignItems: 'center',
// //     marginTop: 20,
// //   },
// //   buttonText: {
// //     fontSize: 18,
// //     color: '#fff',
// //     fontWeight: '600',
// //   },
// //   errorText: {
// //     color: 'red',
// //     fontSize: 14,
// //     marginBottom: 10,
// //   },
// //   registerText: {
// //     marginTop: 15,
// //     fontSize: 16,
// //     color: '#2DAA9E',
// //   },
// // });

// // export default Login;

// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { gql, useMutation } from '@apollo/client';

// // GraphQL Mutation to check user credentials
// const LOGIN_USER = gql`
//   mutation LoginUser($email: String!, $password: String!) {
//     loginUser(email: $email, password: $password) {
//       id
//       fullName
//       email
//       phone
//     }
//   }
// `;

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigation = useNavigation();

//   const [loginUser, { loading }] = useMutation(LOGIN_USER, {
//     onError: (err) => {
//       setError(err.message || 'Failed to login. Please try again.');
//     },
//   });

//   const handleLogin = async () => {
//     if (!email || !password) {
//       setError('Email and Password are required!');
//       return;
//     }

//     try {
//       const { data } = await loginUser({ variables: { email, password } });

//       if (data?.loginUser) {
//         Alert.alert('Login Successful', `Welcome, ${data.loginUser.fullName}!`);
//         navigation.navigate('MainMenu'); // Navigate to MainMenu
//       } else {
//         setError('Invalid email or password.');
//       }
//     } catch (error) {
//       setError('Failed to login. Please try again.');
//       console.error(error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Login</Text>

//       {error ? <Text style={styles.errorText}>{error}</Text> : null}

//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         keyboardType="email-address"
//         value={email}
//         onChangeText={setEmail}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
//         <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
//         <Text style={styles.registerText}>Don't have an account? Sign up</Text>
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
//     marginBottom: 30,
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
//   registerText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: '#2DAA9E',
//   },
// });

// export default Login;

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { gql, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// GraphQL Mutation to check user credentials
const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password)
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    onError: (err) => {
      setError(err.message || 'Failed to login. Please try again.');
    },
  });

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and Password are required!');
      return;
    }

    try {
      const { data } = await loginUser({ variables: { email, password } });

      if (data?.loginUser) {
        // Save the token to AsyncStorage
        await AsyncStorage.setItem('userToken', data.loginUser);

        Alert.alert('Login Successful', 'Welcome!');
        navigation.navigate('MainMenu'); // Navigate to MainMenu
      } else {
        setError('Invalid email or password.');
      }
    } catch (error) {
      setError('Failed to login. Please try again.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
        <Text style={styles.registerText}>Don't have an account? Sign up</Text>
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
    marginBottom: 30,
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
  registerText: {
    marginTop: 15,
    fontSize: 16,
    color: '#2DAA9E',
  },
});

export default Login;