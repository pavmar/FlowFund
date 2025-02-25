import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Wallet = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet</Text>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>$500.00</Text>
      </View>
      <View style={styles.actionContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.sideBySideButton, { backgroundColor: '#5EC61E' }]}>
            <Text style={styles.buttonText}>Add Balance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.sideBySideButton, { backgroundColor: '#FA0C0C' }]}>
            <Text style={styles.buttonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Transaction History</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.transactionContainer}>
        <Text style={styles.transactionText}>Loan Sent: $1000.00</Text>
        <Text style={styles.transactionText}>Loan Received: $500.00</Text>
        <Text style={styles.transactionText}>Withdraw: $0.00</Text>
      </View>
      <Text style={styles.loanOverview}>Loan Overview</Text>
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
    marginBottom: 20,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  balanceLabel: {
    fontSize: 18,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#66D2CE',
    marginTop: 10,
  },
  actionContainer: {
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  sideBySideButton: {
    width: '45%',
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 10,
  },
  transactionContainer: {
    marginBottom: 30,
  },
  transactionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  loanOverview: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2DAA9E',
    textAlign: 'center',
  },
});

export default Wallet;
