require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  paths: {
    sources: "./src/", // Update this to the correct path
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:32770",
    },
  },
};
