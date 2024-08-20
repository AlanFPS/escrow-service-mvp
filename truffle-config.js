const HDWalletProvider = require("@truffle/hdwallet-provider");
const fs = require("fs");
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    sepolia: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://eth-sepolia.g.alchemy.com/v2/dHhZJRtZtUzjuDHuD_WiZihXuQcJcO6a`
        ),
      network_id: 11155111, // Sepolia's network id
      gas: 5500000, // Gas limit
      gasPrice: 10000000000, // 10 Gwei
      confirmations: 2, // # of confirmations to wait between deployments (default: 0)
      timeoutBlocks: 200, // # of blocks before a deployment times out (minimum/default: 50)
      networkCheckTimeout: 1000000, // Increase if you get a network timeout error
      skipDryRun: true, // Skip dry run before migrations? (default: false for public nets)
    },
  },

  mocha: {},

  compilers: {
    solc: {
      version: "0.8.2", // Fetch exact version from solc-bin (default: truffle's version)
      settings: {
        optimizer: {
          enabled: false,
          runs: 200,
        },
        evmVersion: "istanbul",
      },
    },
  },
};
