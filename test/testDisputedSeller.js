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

    // Step 1: Fetch seller's balance before transaction
    const initialSellerBalance = web3.utils.toBN(
      await web3.eth.getBalance(seller)
    );
    console.log(
      "Initial Seller Balance:",
      web3.utils.fromWei(initialSellerBalance, "ether"),
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

    // Step 3: Estimate gas for resolveDispute
    let gasEstimateResolveDispute = await instance.resolveDispute.estimateGas(
      escrowId,
      true, // Resolve in favor of seller
      { from: arbitrator }
    );
    console.log("Estimated Gas for resolveDispute:", gasEstimateResolveDispute);

    // Add a buffer to the gas estimate (e.g., 50%)
    gasEstimateResolveDispute = Math.round(gasEstimateResolveDispute * 1.5);

    // Calculate arbitrator's estimated gas cost
    const arbitratorGasCost = gasPrice.mul(
      web3.utils.toBN(gasEstimateResolveDispute)
    );

    console.log(
      "Arbitrator's Estimated Gas Cost:",
      web3.utils.fromWei(arbitratorGasCost, "ether"),
      "ETH"
    );

    // Check if arbitrator has enough balance
    const arbitratorBalanceBN = web3.utils.toBN(
      await web3.eth.getBalance(arbitrator)
    );
    if (arbitratorBalanceBN.lt(arbitratorGasCost)) {
      throw new Error(
        `Arbitrator does not have enough balance. Required: ${web3.utils.fromWei(
          arbitratorGasCost,
          "ether"
        )} ETH, Available: ${web3.utils.fromWei(
          arbitratorBalanceBN,
          "ether"
        )} ETH`
      );
    }

    // Step 4: Arbitrator resolves dispute in favor of seller
    console.log("Sending resolveDispute transaction...");
    const receipt = await instance.resolveDispute(escrowId, true, {
      from: arbitrator,
      gas: gasEstimateResolveDispute,
      gasPrice: gasPriceStr,
    });
    console.log("Dispute resolution transaction hash:", receipt.tx);

    // Step 5: Capture seller's balance after the dispute
    const updatedSellerBalance = web3.utils.toBN(
      await web3.eth.getBalance(seller)
    );
    console.log(
      "Updated Seller Balance:",
      web3.utils.fromWei(updatedSellerBalance, "ether"),
      "ETH"
    );

    // Step 6: Calculate the amount received by the seller (after gas fees)
    const sellerReceivedAmount = updatedSellerBalance.sub(initialSellerBalance);
    const gasUsed = web3.utils.toBN(receipt.receipt.gasUsed);
    const effectiveGasPrice = web3.utils.toBN(
      receipt.receipt.effectiveGasPrice
    );
    const gasCost = gasUsed.mul(effectiveGasPrice);

    // Step 7: Log the amount received
    console.log(
      "Amount Received by Seller (Before Gas Fees):",
      web3.utils.fromWei(sellerReceivedAmount.add(gasCost), "ether"),
      "ETH"
    );
    console.log(
      "Gas Cost for Dispute Resolution:",
      web3.utils.fromWei(gasCost, "ether"),
      "ETH"
    );

    // Step 8: Check the escrow status after dispute resolution
    const escrowDetails = await instance.escrows(escrowId);
    console.log(
      "Escrow Status after Dispute Resolution:",
      escrowDetails.status.toString()
    ); // Expected output: '1' indicating Completed

    callback();
  } catch (error) {
    console.error(
      "An error occurred during the transaction process:",
      error.message
    );
    callback(error);
  }
};
