require("@nomicfoundation/hardhat-ethers");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  // Specify the Solidity version and compiler settings
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Adjust optimizer runs as needed
      },
    },
  },

  // Network configuration
  networks: {
    // Hardhat's built-in network for local testing
    hardhat: {},

    // Localhost network (e.g., when running `npx hardhat node`)
    localhost: {
      url: "http://127.0.0.1:8545",
    },

  },
};