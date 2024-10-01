const EscrowService = artifacts.require("EscrowService");

module.exports = async function (callback) {
  try {
    const instance = await EscrowService.deployed();
    const buyer = "0xF217AD710CE40F6511616EA302F8b377211aF3D6";
    const seller = "0x6b9e4920F2F939fc3592bFbE9074F9330074DE49";
    const arbitrator = "0x536B2B1Da49ac26480a7238763033F5cf6FBeAc9";

    // Step 1: Fetch initial buyer balance
    const initialBuyerBalance = web3.utils.toBN(
      await web3.eth.getBalance(buyer)
    );

    // Step 2: Create an escrow transaction with 0.1 ETH
    await instance.createEscrow(seller, arbitrator, {
      from: buyer,
      value: web3.utils.toWei("0.01", "ether"),
    });

    // Step 3: Process the refund initiated by buyer
    const refundTx = await instance.refund({ from: buyer });

    // Step 4: Calculate gas cost for the refund transaction
    const gasUsed = web3.utils.toBN(refundTx.receipt.gasUsed);
    const gasPrice = web3.utils.toBN(await web3.eth.getGasPrice());
    const gasCost = gasUsed.mul(gasPrice);

    // Step 5: Fetch updated buyer balance after refund
    const updatedBuyerBalance = web3.utils.toBN(
      await web3.eth.getBalance(buyer)
    );

    // Step 6: Calculate refund amount before and after gas fees
    const refundAmountBeforeGas = updatedBuyerBalance.sub(initialBuyerBalance);
    const refundAmountAfterGas = updatedBuyerBalance
      .add(gasCost)
      .sub(initialBuyerBalance);

    // Step 7: Log the results for both before and after gas fees
    console.log(
      "Refund Amount Received by Buyer (Before Gas Fees):",
      web3.utils.fromWei(refundAmountBeforeGas, "ether"),
      "ETH"
    );
    console.log(
      "Refund Amount Received by Buyer (After Gas Fees):",
      web3.utils.fromWei(refundAmountAfterGas, "ether"),
      "ETH"
    );

    // Step 8: Check the escrow status after refund
    const status = await instance.escrowStatus.call();
    console.log("Escrow Status after Refund:", status.toString()); // Expecting '2' indicating Refunded

    callback();
  } catch (error) {
    console.error(error);
    callback(error);
  }
};
