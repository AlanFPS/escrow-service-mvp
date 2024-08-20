const EscrowService = artifacts.require("EscrowService");

contract("EscrowService", (accounts) => {
  const [buyer, seller, arbitrator] = accounts;

  it("should create an escrow", async () => {
    const escrowInstance = await EscrowService.new();
    await escrowInstance.createEscrow(seller, arbitrator, {
      from: buyer,
      value: web3.utils.toWei("1", "ether"),
    });
    const storedSeller = await escrowInstance.seller();
    const storedArbitrator = await escrowInstance.arbitrator();
    const storedAmount = await escrowInstance.escrowAmount();

    assert.equal(storedSeller, seller, "Seller should be correctly set");
    assert.equal(
      storedArbitrator,
      arbitrator,
      "Arbitrator should be correctly set"
    );
    assert.equal(
      storedAmount.toString(),
      web3.utils.toWei("1", "ether"),
      "Escrow amount should be 1 ETH"
    );
  });

  it("should allow buyer to release funds to the seller", async () => {
    const escrowInstance = await EscrowService.new();
    await escrowInstance.createEscrow(seller, arbitrator, {
      from: buyer,
      value: web3.utils.toWei("1", "ether"),
    });

    const initialSellerBalance = await web3.eth.getBalance(seller);
    await escrowInstance.releaseFunds({ from: buyer });
    const finalSellerBalance = await web3.eth.getBalance(seller);

    assert(
      new web3.utils.BN(finalSellerBalance)
        .sub(new web3.utils.BN(initialSellerBalance))
        .eq(new web3.utils.BN(web3.utils.toWei("1", "ether"))),
      "Seller should receive 1 ETH"
    );

    const escrowStatus = await escrowInstance.escrowStatus();
    assert.equal(
      escrowStatus.toNumber(),
      1, // EscrowStatus.Completed
      "Escrow should be marked as completed"
    );
  });

  it("should allow buyer or arbitrator to refund the buyer", async () => {
    const escrowInstance = await EscrowService.new();
    await escrowInstance.createEscrow(seller, arbitrator, {
      from: buyer,
      value: web3.utils.toWei("1", "ether"),
    });

    const initialBuyerBalance = await web3.eth.getBalance(buyer);
    await escrowInstance.refund({ from: arbitrator });
    const finalBuyerBalance = await web3.eth.getBalance(buyer);

    assert(
      new web3.utils.BN(finalBuyerBalance)
        .sub(new web3.utils.BN(initialBuyerBalance))
        .gt(new web3.utils.BN(web3.utils.toWei("0.9", "ether"))),
      "Buyer should receive most of the 1 ETH after refund"
    );

    const escrowStatus = await escrowInstance.escrowStatus();
    assert.equal(
      escrowStatus.toNumber(),
      2, // EscrowStatus.Refunded
      "Escrow should be marked as refunded"
    );
  });

  it("should allow arbitrator to resolve dispute", async () => {
    const escrowInstance = await EscrowService.new();
    await escrowInstance.createEscrow(seller, arbitrator, {
      from: buyer,
      value: web3.utils.toWei("1", "ether"),
    });

    const initialSellerBalance = await web3.eth.getBalance(seller);
    await escrowInstance.resolveDispute(true, { from: arbitrator });
    const finalSellerBalance = await web3.eth.getBalance(seller);

    assert(
      new web3.utils.BN(finalSellerBalance)
        .sub(new web3.utils.BN(initialSellerBalance))
        .eq(new web3.utils.BN(web3.utils.toWei("1", "ether"))),
      "Seller should receive 1 ETH after arbitrator resolves dispute"
    );

    const escrowStatus = await escrowInstance.escrowStatus();
    assert.equal(
      escrowStatus.toNumber(),
      1, // EscrowStatus.Completed
      "Escrow should be marked as completed"
    );
  });
});
