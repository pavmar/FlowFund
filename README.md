# 🌟 FlowFund

FlowFund is a decentralized lending platform that enhances financial inclusion by providing a secure and transparent loan process. It leverages blockchain technology to eliminate traditional banking inefficiencies, empowering users with a trustless and cost-effective lending alternative.

---

## 🚀 Setup

### 🔧 Update Environment Variables

#### Frontend (`src/frontend/.env`)
```env
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGE_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
VITE_REACT_APP_ETHEREUM_RPC_URL="http://localhost:8545"
```

#### Backend (`src/server/.env`)
```env
ETHEREUM_RPC_URL="http://localhost:8545"
MONGO_URL="<MONGO URL>"
```

### 💻 Usage

```bash
git clone https://github.com/pavmar/FlowFund.git

cd FlowFund/
```

#### Compile contract

```bash
cd src/server/contract
npm install --legacy-peer-deps
npx hardhat compile
```

#### Start frontend

```bash
cd src/frontend
npm install --legacy-peer-deps
npm run dev
```

#### Start server

Open another terminal

```bash
cd src/server
npm install --legacy-peer-deps
node server.js
```

#### Start hardhat node

Open another terminal

```bash
cd hardhat
npm install --legacy-peer-deps
npx hardhat node
```

### 🌐 Access

[http://localhost:5173](http://localhost:5173)