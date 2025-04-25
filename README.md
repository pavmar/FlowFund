# FlowFund
The product envisions a decentralized lending platform that enhances financial inclusion, provides a secure and transparent loan process, and leverages blockchain to eliminate traditional banking inefficiencies. The goal is to empower users by offering a trust less and cost-effective lending alternative.


# Setup

Update env variables

## src/frontend/.evn

VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGE_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
VITE_REACT_APP_ETHEREUM_RPC_URL="http://localhost:8545"

## src/server/.env

ETHEREUM_RPC_URL="http://localhost:8545"
MONGO_URL="<MONGO URL>"

# Usage 

git clone https://github.com/pavmar/FlowFund.git

cd FlowFund/

## Compile contract

cd src/server/contract
npm install --legacy-peer-deps
npx hardhat compile

## Start frontend

cd src/frontend
npm install --legacy-peer-deps
npm run dev

## Start server

Open another terminal

cd src/server
npm install --legacy-peer-deps
node server.js

## Start hardhat node

Open anothr terminal 

cd hardhat
npm install --legacy-peer-deps
npx hardhat node

## Access 

http://localhost:5173