const HDWalletProvider = require("@truffle/hdwallet-provider");
const fs = require("fs");
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost
      port: 8545, // Ganache default port
      network_id: "*", // Any network
    },
    sepolia: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: mnemonic,
          },
          providerOrUrl: `https://eth-sepolia.g.alchemy.com/v2/dHhZJRtZtUzjuDHuD_WiZihXuQcJcO6a`, // Replace with your Alchemy API key
          numberOfAddresses: 3,
          shareNonce: true,
          derivationPath: `m/44'/60'/0'/0/`,
        }),
      network_id: 11155111, // Sepolia's network id
      gas: 3000000, // 3,000,000 gas
      gasPrice: 200000000000, // 200 Gwei
      confirmations: 2, // # of confirmations to wait between deployments
      timeoutBlocks: 200, // # of blocks before a deployment times out
      skipDryRun: true, // Skip dry run before migrations
    },
  },

  mocha: {},

  compilers: {
    solc: {
      version: "0.8.2",
      settings: {
        optimizer: {
          enabled: true, // Enable optimizer
          runs: 200,
        },
        evmVersion: "istanbul",
      },
    },
  },
};
