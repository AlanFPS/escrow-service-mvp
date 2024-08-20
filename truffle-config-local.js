module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost
      port: 8545, // Standard Ganache CLI port
      network_id: "*", // Match any network id
    },
    matic: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://polygon-amoy.g.alchemy.com/v2/9-ZNcxQWaSpRN9VtC1pXyX_oS04He3sO`
        ),
      network_id: 80002,
      gasPrice: 20000000000,
      confirmations: 2,
      timeoutBlocks: 500,
      networkCheckTimeout: 100000,
      skipDryRun: true,
    },
  },

  mocha: {},

  compilers: {
    solc: {
      version: "0.8.2",
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
