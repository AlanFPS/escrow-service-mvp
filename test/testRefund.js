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

    // Fetch and display balances
    const buyerBalance = web3.utils.fromWei(
      await web3.eth.getBalance(buyer),
      "ether"
    );
    const sellerBalance = web3.utils.fromWei(
      await web3.eth.getBalance(seller),
      "ether"
    );
    const arbitratorBalance = web3.utils.fromWei(
      await web3.eth.getBalance(arbitrator),
      "ether"
    );

    console.log(`Buyer Balance: ${buyerBalance} ETH`);
    console.log(`Seller Balance: ${sellerBalance} ETH`);
    console.log(`Arbitrator Balance: ${arbitratorBalance} ETH`);

    // Step 1: Fetch buyer's balance before transaction
    const initialBuyerBalance = web3.utils.toBN(
      await web3.eth.getBalance(buyer)
    );
    console.log(
      "Initial Buyer Balance:",
      web3.utils.fromWei(initialBuyerBalance, "ether"),
      "ETH"
    );

    // Set fixed gas price (same as in truffle-config.js)
    const gasPrice = web3.utils.toBN(web3.utils.toWei("30", "gwei"));
    console.log(
      "Using Gas Price:",
      web3.utils.fromWei(gasPrice, "gwei"),
      "Gwei"
    );

    // Transaction Value (Adjusted to 0.05 ETH)
    const escrowValue = web3.utils.toWei("0.05", "ether"); // Adjusted value

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
    const estimatedGasCost = gasPrice.mul(
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
    const buyerBalanceBN = web3.utils.toBN(await web3.eth.getBalance(buyer));
    if (buyerBalanceBN.lt(estimatedTotalCost)) {
      throw new Error(
        `Buyer does not have enough balance. Required: ${web3.utils.fromWei(
          estimatedTotalCost,
          "ether"
        )} ETH, Available: ${web3.utils.fromWei(buyerBalanceBN, "ether")} ETH`
      );
    }

    // Convert gas price to string for transaction options
    const gasPriceStr = gasPrice.toString();

    // Sending createEscrow transaction
    console.log("Sending createEscrow transaction...");
    const txCreateEscrow = await instance.createEscrow(seller, arbitrator, {
      from: buyer,
      value: escrowValue,
      gas: gasEstimateCreateEscrow,
      gasPrice: gasPriceStr,
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

    // Calculate buyer's estimated gas cost for refund
    const refundGasCost = gasPrice.mul(web3.utils.toBN(gasEstimateRefund));

    console.log(
      "Buyer's Estimated Gas Cost for Refund:",
      web3.utils.fromWei(refundGasCost, "ether"),
      "ETH"
    );

    // Check if buyer has enough balance for refund transaction
    const buyerBalanceAfterEscrow = buyerBalanceBN.sub(
      web3.utils
        .toBN(escrowValue)
        .add(gasPrice.mul(web3.utils.toBN(gasEstimateCreateEscrow)))
    );

    if (buyerBalanceAfterEscrow.lt(refundGasCost)) {
      throw new Error(
        `Buyer does not have enough balance for refund transaction. Required: ${web3.utils.fromWei(
          refundGasCost,
          "ether"
        )} ETH, Available: ${web3.utils.fromWei(
          buyerBalanceAfterEscrow,
          "ether"
        )} ETH`
      );
    }

    // Step 4: Buyer initiates refund
    console.log("Sending refund transaction...");
    const refundTx = await instance.refund(escrowId, {
      from: buyer,
      gas: gasEstimateRefund,
      gasPrice: gasPriceStr,
    });
    console.log("Refund transaction hash:", refundTx.tx);

    // Step 5: Capture buyer's balance after refund
    const updatedBuyerBalance = web3.utils.toBN(
      await web3.eth.getBalance(buyer)
    );
    console.log(
      "Updated Buyer Balance:",
      web3.utils.fromWei(updatedBuyerBalance, "ether"),
      "ETH"
    );

    // Step 6: Calculate refund amount received by the buyer (after gas fees)
    const refundAmount = updatedBuyerBalance.sub(initialBuyerBalance);
    const gasUsed = web3.utils.toBN(refundTx.receipt.gasUsed);
    const effectiveGasPrice = web3.utils.toBN(
      refundTx.receipt.effectiveGasPrice
    );
    const gasCost = gasUsed.mul(effectiveGasPrice);

    // Step 7: Log the amount received
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

    // Step 8: Check the escrow status after refund
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
