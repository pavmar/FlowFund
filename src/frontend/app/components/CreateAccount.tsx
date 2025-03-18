// import React from 'react';
// import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

// const CreateAccount = () => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Create Account</Text>
//       <TextInput style={styles.input} placeholder="Full Name" />
//       <TextInput style={styles.input} placeholder="Email" />
//       <TextInput style={styles.input} placeholder="Phone Number" />
//       <TextInput style={styles.input} placeholder="Password" secureTextEntry />
//       <Button title="Register" onPress={() => {}} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     marginBottom: 20,
//   },
//   input: {
//     width: '80%',
//     padding: 10,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//   },
// });

// export default CreateAccount;

import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const CreateAccount = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmitRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/register', { username, email, phone, password });
      localStorage.setItem('token', response.data.token);
      alert('Registration is successfull. \n You can now login');
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput style={styles.input} onChangeText={setUsername} placeholder="Full Name" />
      <TextInput style={styles.input} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
      <TextInput style={styles.input} onChangeText={setPhone} placeholder="Phone Number" keyboardType="phone-pad" />
      <TextInput style={styles.input} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={() => { handleSubmitRegister()}}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
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
    marginBottom: 15,
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
});

export default CreateAccount;
