// import React from 'react';
// import { View, Text, FlatList, StyleSheet } from 'react-native';

// // Define the type for a single transaction
// type Transaction = {
//   id: string;
//   amount: string;
//   date: string;
//   type: string;
// };

// // Sample transaction data
// const transactions: Transaction[] = [
//   { id: '1', amount: '$500', date: '02/19/2025', type: 'Borrowed' },
//   { id: '2', amount: '$1000', date: '02/14/2025', type: 'Lent' },
// ];

// // TransactionHistoryScreen Component
// const TransactionHistoryScreen: React.FC = () => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Transaction History</Text>
//       <FlatList
//         data={transactions}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.transaction}>
//             <Text style={styles.text}>
//               {item.amount} {item.type} on {item.date}
//             </Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
//   transaction: { padding: 10, borderBottomWidth: 1 },
//   text: { fontSize: 18, textAlign: 'center' },
// });

// export default TransactionHistoryScreen;


import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const transactions = [
  { id: '1', amount: '$500', date: '02/19/2025', type: 'Borrowed' },
  { id: '2', amount: '$1000', date: '02/14/2025', type: 'Lent' },
];

export default function TransactionHistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transaction}>
            <Text style={styles.text}>{item.amount} {item.type} on {item.date}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  transaction: { padding: 10, borderBottomWidth: 1 },
  text: { fontSize: 18, textAlign: 'center' },
});