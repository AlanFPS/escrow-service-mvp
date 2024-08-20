// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract EscrowService {
    address public buyer;
    address public seller;
    address public arbitrator;
    uint256 public escrowAmount;

    enum EscrowStatus { Pending, Completed, Refunded }
    EscrowStatus public escrowStatus;

    // Function to create the escrow
    function createEscrow(address _seller, address _arbitrator) public payable {
        require(msg.value > 0, "Payment required");
        buyer = msg.sender;
        seller = _seller;
        arbitrator = _arbitrator;
        escrowAmount = msg.value;
        escrowStatus = EscrowStatus.Pending;
    }

    // Function to release funds to the seller
    function releaseFunds() public {
        require(msg.sender == buyer, "Only buyer can release funds");
        require(escrowStatus == EscrowStatus.Pending, "Funds already released or refunded");
        escrowStatus = EscrowStatus.Completed;
        payable(seller).transfer(escrowAmount);
    }

    // Function to refund the buyer
    function refund() public {
        require(msg.sender == buyer || msg.sender == arbitrator, "Not authorized");
        require(escrowStatus == EscrowStatus.Pending, "Cannot refund at this stage");
        escrowStatus = EscrowStatus.Refunded;
        payable(buyer).transfer(escrowAmount);
    }
}
