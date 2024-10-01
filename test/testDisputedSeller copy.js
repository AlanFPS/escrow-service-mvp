const EscrowService = artifacts.require("EscrowService");

module.exports = async function (callback) {
  try {
    const instance = await EscrowService.deployed();
    const buyer = "0xF217AD710CE40F6511616EA302F8b377211aF3D6";
    const seller = "0x6b9e4920F2F939fc3592bFbE9074F9330074DE49";
    const arbitrator = "0x536B2B1Da49ac26480a7238763033F5cf6FBeAc9";

    // Step 1: Fetch initial balances
    const sellerBalance = await web3.eth.getBalance(seller);
    const initialSellerBalance = web3.utils.toBN(sellerBalance);

    // Step 2: Create Escrow transaction from the buyer
    await instance.createEscrow(seller, arbitrator, {
      from: buyer,
      value: web3.utils.toWei("0.01", "ether"),
    });

    // Step 3: Arbitrator resolves dispute in favor of seller
    const receipt = await instance.resolveDispute(true, { from: arbitrator });

    // Step 4: Capture seller's balance after the dispute
    const updatedSellerBalance = web3.utils.toBN(
      await web3.eth.getBalance(seller)
    );
    const receivedAmount = updatedSellerBalance.sub(initialSellerBalance);

    // Step 5: Log the amount received
    console.log(
      "Amount Received by Seller (Before Gas Fees):",
      web3.utils.fromWei(receivedAmount, "ether"),
      "ETH"
    );

    // Step 6: Calculate amount received by the seller (after gas fees)
    const gasUsed = receipt.receipt.gasUsed;
    const gasPrice = web3.utils.toBN(await web3.eth.getGasPrice());
    const gasCost = gasUsed * gasPrice;
    console.log(
      "Gas Cost:",
      web3.utils.fromWei(gasCost.toString(), "ether"),
      "ETH"
    );

    // Step 7: Check the escrow status after dispute resolution
    const updatedStatus = await instance.escrowStatus.call();
    console.log(
      "Escrow Status after Dispute Resolution:",
      updatedStatus.toString()
    ); // Expecting '1'

    callback();
  } catch (err) {
    console.error("Error executing testDisputedSeller.js:", err);
    callback(err);
  }
};
