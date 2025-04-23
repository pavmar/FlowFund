const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const LendingContract = await hre.ethers.getContractFactory("LendingContract");

  console.log("Deploying LendingContract...");

  // Deploy the contract
  const contract = await LendingContract.deploy();
  console.log("LendingContract deployed at:", contract.target);

  // Wait for the deployment to complete
  await contract.waitForDeployment();

  console.log("Contract deployed at:", contract.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });

// LendingContract deployed at: 0xE19dddcaF5dCb2Ec0Fe52229e3133B99396f22e2
// Contract deployed at: 0xE19dddcaF5dCb2Ec0Fe52229e3133B99396f22e2