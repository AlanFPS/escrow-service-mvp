// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract EscrowService {
    address public buyer;
    address public seller;
    address public arbitrator;
    uint256 public escrowAmount;

    enum EscrowStatus { Pending, Completed, Refunded }
    EscrowStatus public escrowStatus;

    // Modifiers for access control
    modifier onlyBuyer() {
        require(msg.sender == buyer, "Only buyer can call this function");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this function");
        _;
    }

    modifier onlyArbitrator() {
        require(msg.sender == arbitrator, "Only arbitrator can call this function");
        _;
    }

    modifier inStatus(EscrowStatus _status) {
        require(escrowStatus == _status, "Invalid escrow status for this action");
        _;
    }

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
    function releaseFunds() public onlyBuyer inStatus(EscrowStatus.Pending) {
        escrowStatus = EscrowStatus.Completed;
        payable(seller).transfer(escrowAmount);
    }

    // Function to refund the buyer
    function refund() public onlyBuyerOrArbitrator inStatus(EscrowStatus.Pending) {
        escrowStatus = EscrowStatus.Refunded;
        payable(buyer).transfer(escrowAmount);
    }

    // Optional: Function to handle disputes
    function resolveDispute(bool _releaseToSeller) public onlyArbitrator inStatus(EscrowStatus.Pending) {
        if (_releaseToSeller) {
            escrowStatus = EscrowStatus.Completed;
            payable(seller).transfer(escrowAmount);
        } else {
            escrowStatus = EscrowStatus.Refunded;
            payable(buyer).transfer(escrowAmount);
        }
    }

    // Modifier for access control by either buyer or arbitrator
    modifier onlyBuyerOrArbitrator() {
        require(msg.sender == buyer || msg.sender == arbitrator, "Not authorized");
        _;
    }
}
