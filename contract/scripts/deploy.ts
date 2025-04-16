import { Wallet, ContractFactory, JsonRpcProvider } from "ethers";
import * as LendingBorrowingArtifact from "../artifacts/src/Lending.sol/LendingBorrowing.json";

async function main() {
  // Replace with your Ethereum provider (e.g., Infura, Alchemy, or local network)
  const provider = new JsonRpcProvider("http://127.0.0.1:32770"); // Local network
  const privateKey = "bcdf20249abf0ed6d944c0288fad489e33f66b3960d9e6229c1cd214ed3bbe31"; // Replace with your private key
  const wallet = new Wallet(privateKey, provider);

  console.log("Deploying contract with the account:", wallet.address);

  // Replace with the addresses of the collateral and lending tokens
  const collateralTokenAddress = "0x614561D2d143621E126e87831AEF287678B442b8"; // Replace with actual collateral token address
  const lendingTokenAddress = "0xE25583099BA105D9ec0A67f5Ae86D90e50036425"; // Replace with actual lending token address
  const collateralFactor = 50; // Example: 50% collateral factor

  // Create a ContractFactory
  const LendingBorrowingFactory = new ContractFactory(
    LendingBorrowingArtifact.abi,
    LendingBorrowingArtifact.bytecode,
    wallet
  );

  // Deploy the contract
  const lendingBorrowingContract = await LendingBorrowingFactory.deploy(
    collateralTokenAddress,
    lendingTokenAddress,
    collateralFactor
  );

  console.log("Deploying LendingBorrowing contract...");
  await lendingBorrowingContract.waitForDeployment();

  console.log("LendingBorrowing contract deployed at:", lendingBorrowingContract.target);
}

main().catch((error) => {
  console.error("Error deploying contract:", error);
  process.exit(1);
});