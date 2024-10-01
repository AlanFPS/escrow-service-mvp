const EscrowService = artifacts.require("EscrowService");

module.exports = async function (callback) {
  try {
    const instance = await EscrowService.deployed();

    // Fetch available accounts from the provider
    const accounts = await web3.eth.getAccounts();

    // Assign buyer, seller, and arbitrator from the accounts
    const buyer = accounts[0];
    const seller = accounts[1];
    const arbitrator = accounts[2];

    console.log("Buyer Address:", buyer);
    console.log("Seller Address:", seller);
    console.log("Arbitrator Address:", arbitrator);

    // Step 1: Fetch buyer's balance before transaction
    const initialBuyerBalance = web3.utils.toBN(
      await web3.eth.getBalance(buyer)
    );
    console.log(
      "Initial Buyer Balance:",
      web3.utils.fromWei(initialBuyerBalance, "ether"),
      "ETH"
    );

    // Monitor Current Gas Prices
    const latestBlock = await web3.eth.getBlock("latest");
    const baseFeePerGas = web3.utils.toBN(latestBlock.baseFeePerGas || 0);
    console.log(
      "Current Base Fee:",
      web3.utils.fromWei(baseFeePerGas, "gwei"),
      "Gwei"
    );

    // Set max priority fee per gas (tip for miners)
    const maxPriorityFeePerGas = web3.utils.toBN(web3.utils.toWei("2", "gwei"));
    const maxFeePerGas = baseFeePerGas.add(maxPriorityFeePerGas);
    console.log(
      "Calculated Max Fee Per Gas:",
      web3.utils.fromWei(maxFeePerGas, "gwei"),
      "Gwei"
    );

    // Transaction Value
    const escrowValue = web3.utils.toWei("1", "ether"); // Adjust as needed

    // Step 2: Estimate gas for createEscrow
    let gasEstimateCreateEscrow = await instance.createEscrow.estimateGas(
      seller,
      arbitrator,
      {
        from: buyer,
        value: escrowValue,
      }
    );
    console.log("Estimated Gas for createEscrow:", gasEstimateCreateEscrow);

    // Add a buffer to the gas estimate (e.g., 50%)
    gasEstimateCreateEscrow = Math.round(gasEstimateCreateEscrow * 1.5);

    // Calculate estimated total cost
    const estimatedGasCost = maxFeePerGas.mul(
      web3.utils.toBN(gasEstimateCreateEscrow)
    );
    const estimatedTotalCost = web3.utils
      .toBN(escrowValue)
      .add(estimatedGasCost);

    console.log(
      "Estimated Total Cost:",
      web3.utils.fromWei(estimatedTotalCost, "ether"),
      "ETH"
    );

    // Check if buyer has enough balance
    if (initialBuyerBalance.lt(estimatedTotalCost)) {
      throw new Error(
        `Buyer does not have enough balance. Required: ${web3.utils.fromWei(
          estimatedTotalCost,
          "ether"
        )} ETH, Available: ${web3.utils.fromWei(
          initialBuyerBalance,
          "ether"
        )} ETH`
      );
    }

    // Convert gas fee parameters to strings for transaction options
    const maxFeePerGasStr = maxFeePerGas.toString();
    const maxPriorityFeePerGasStr = maxPriorityFeePerGas.toString();

    // Sending createEscrow transaction
    console.log("Sending createEscrow transaction...");
    const txCreateEscrow = await instance.createEscrow(seller, arbitrator, {
      from: buyer,
      value: escrowValue,
      gas: gasEstimateCreateEscrow,
      maxFeePerGas: maxFeePerGasStr,
      maxPriorityFeePerGas: maxPriorityFeePerGasStr,
    });
    console.log("Escrow transaction hash:", txCreateEscrow.tx);

    // Retrieve the escrowId
    const escrowId = await instance.escrowCount();
    console.log("Escrow ID:", escrowId.toString());

    // Step 3: Estimate gas for refund
    let gasEstimateRefund = await instance.refund.estimateGas(escrowId, {
      from: buyer,
    });
    console.log("Estimated Gas for refund:", gasEstimateRefund);

    // Add a buffer to the gas estimate (e.g., 50%)
    gasEstimateRefund = Math.round(gasEstimateRefund * 1.5);

    // Step 3: Buyer initiates refund
    console.log("Sending refund transaction...");
    const refundTx = await instance.refund(escrowId, {
      from: buyer,
      gas: gasEstimateRefund,
      maxFeePerGas: maxFeePerGasStr,
      maxPriorityFeePerGas: maxPriorityFeePerGasStr,
    });
    console.log("Refund transaction hash:", refundTx.tx);

    // Step 4: Capture buyer's balance after refund
    const updatedBuyerBalance = web3.utils.toBN(
      await web3.eth.getBalance(buyer)
    );
    console.log(
      "Updated Buyer Balance:",
      web3.utils.fromWei(updatedBuyerBalance, "ether"),
      "ETH"
    );

    // Step 5: Calculate refund amount received by the buyer (after gas fees)
    const refundAmount = updatedBuyerBalance.sub(initialBuyerBalance);
    const gasUsed = web3.utils.toBN(refundTx.receipt.gasUsed);
    const effectiveGasPrice = web3.utils.toBN(
      refundTx.receipt.effectiveGasPrice
    );
    const gasCost = gasUsed.mul(effectiveGasPrice);

    // Step 6: Log the amount received
    console.log(
      "Refund Amount Received by Buyer (Before Gas Fees):",
      web3.utils.fromWei(refundAmount.add(gasCost), "ether"),
      "ETH"
    );
    console.log(
      "Gas Cost for Refund:",
      web3.utils.fromWei(gasCost, "ether"),
      "ETH"
    );

    // Step 7: Check the escrow status after refund
    const escrowDetails = await instance.escrows(escrowId);
    console.log("Escrow Status after Refund:", escrowDetails.status.toString()); // Expected output: '2' indicating Refunded

    callback();
  } catch (error) {
    console.error(
      "An error occurred during the transaction process:",
      error.message
    );
    callback(error);
  }
};
