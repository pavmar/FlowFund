import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [stats, setStats] = useState({
    activeBorrowers: 0,
    activeLenders: 0,
    pastLoans: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [borrowersRes, lendersRes, pastLoansRes] = await Promise.all([
          axios.get('http://localhost:9090/api/borrowers/count'), // API to get active borrowers count
          axios.get('http://localhost:9090/api/lenders/count'), // API to get active lenders count
          axios.get('http://localhost:9090/api/pastLoans/count'), // API to get past loans count
        ]);

        setStats({
          activeBorrowers: borrowersRes.data.count,
          activeLenders: lendersRes.data.count,
          pastLoans: pastLoansRes.data.count,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    // Fetch stats initially
    fetchStats();

    // Set up an interval to refresh stats every 10 seconds
    const intervalId = setInterval(fetchStats, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Welcome to FlowFund</h1>
      <p>Track your lending and borrowing activities seamlessly.</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
        <div
          style={{
            border: '1px solid #ccc',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#e3f2fd', // Light blue for Active Borrowers
            color: '#0d47a1', // Dark blue text
          }}
        >
          <h2>Active Borrowers</h2>
          <p>{stats.activeBorrowers}</p>
        </div>
        <div
          style={{
            border: '1px solid #ccc',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#e8f5e9', // Light green for Active Lenders
            color: '#1b5e20', // Dark green text
          }}
        >
          <h2>Active Lenders</h2>
          <p>{stats.activeLenders}</p>
        </div>
        <div
          style={{
            border: '1px solid #ccc',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#fbe9e7', // Light red for Past Loans
            color: '#b71c1c', // Dark red text
          }}
        >
          <h2>Past Loans</h2>
          <p>{stats.pastLoans}</p>
        </div>
      </div>
    </div>
  );
}