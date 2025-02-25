// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// const MarketPlace = () => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Market Place</Text>
//       <Text>Find Best Interest Rate</Text>
//       <Text>Borrow Money</Text>
//       <Text>Lend Money</Text>
//       <Text>Top Borrowers</Text>
//       <Text>Top Lenders</Text>
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
// });

// export default MarketPlace;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const MarketPlace = () => {
  const topBorrowers = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];  // Example data
  const topLenders = ['Grace', 'Helen', 'Ivy', 'Jack', 'Liam'];  // Example data

  const renderListItem = (item: string) => (
    <Text style={styles.listItem}>{item}</Text>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Market Place</Text>
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Find Best Interest Rate</Text>
        </TouchableOpacity>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.button, styles.borrowButton]}>
            <Text style={styles.buttonText}>Borrow Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.lendButton]}>
            <Text style={styles.buttonText}>Lend Money</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.listContainer}>
          <View style={styles.listColumn}>
            <Text style={styles.listTitle}>Top Borrowers</Text>
            <FlatList
              data={topBorrowers.slice(0, 3)}  // Show only top 3
              renderItem={({ item }) => renderListItem(item)}
              keyExtractor={(item, index) => index.toString()}
              style={styles.list}
            />
          </View>
          <View style={styles.listColumn}>
            <Text style={styles.listTitle}>Top Lenders</Text>
            <FlatList
              data={topLenders.slice(0, 3)}  // Show only top 3
              renderItem={({ item }) => renderListItem(item)}
              keyExtractor={(item, index) => index.toString()}
              style={styles.list}
            />
          </View>
        </View>
      </View>
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
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#2DAA9E',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  borrowButton: {
    backgroundColor: '#E3B10B', // Borrow Money color
    width: '45%',
    marginRight: 10,
  },
  lendButton: {
    backgroundColor: '#8979FF', // Lend Money color
    width: '45%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 10,
  },
  listContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 20,
  },
  listColumn: {
    width: '45%',
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  list: {
    marginBottom: 20,
  },
  listItem: {
    fontSize: 18,
    color: '#333',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default MarketPlace;
