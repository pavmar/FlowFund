const { task } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("hardhat-deploy");
const fs = require("fs");
const path = require("path");

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();
  accounts.forEach((account) => {
    console.log(account.address);
  });
});

task("delete-contracts", "Deletes deployed contract artifacts and resets deployments")
  .setAction(async (_, hre) => {
    const deploymentsPath = path.join(hre.config.paths.root, "deployments");

    if (fs.existsSync(deploymentsPath)) {
      fs.rmSync(deploymentsPath, { recursive: true, force: true });
      console.log("Deleted all deployed contract artifacts in:", deploymentsPath);
    } else {
      console.log("No deployments folder found at:", deploymentsPath);
    }
  });

// Task to get the deployed contract address
task("get-address", "Prints the deployed contract address")
  .addParam("name", "The name of the contract")
  .setAction(async (taskArgs, hre) => {
    const contractName = taskArgs.name;
    const deployment = await hre.deployments.get(contractName);
    console.log(`${contractName} deployed at address: ${deployment.address}`);
  });

module.exports = {
  solidity: "0.8.20",
  paths: {
    sources: "./src/", // Ensure this points to the directory containing your contracts
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:32770",
      accounts: ["0xbcdf20249abf0ed6d944c0288fad489e33f66b3960d9e6229c1cd214ed3bbe31"], // Replace with your private key
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // Use the first account as the deployer
    },
  },
};
