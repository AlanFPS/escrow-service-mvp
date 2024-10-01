const EscrowService = artifacts.require("EscrowService");

module.exports = function (deployer) {
  deployer.deploy(EscrowService);
};
