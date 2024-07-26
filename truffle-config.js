const HDWalletProvider = require("@truffle/hdwallet-provider");
const fs = require("fs");
const mnemonic = fs.readFileSync(".secret").toString().trim();
const alchemyKey = "9-ZNcxQWaSpRN9VtC1pXyX_oS04He3sO";

module.exports = {
  networks: {
    matic: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://polygon-amoy.g.alchemy.com/v2/9-ZNcxQWaSpRN9VtC1pXyX_oS04He3sO`
        ),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },

  mocha: {},

  compilers: {
    solc: {},
  },
};
