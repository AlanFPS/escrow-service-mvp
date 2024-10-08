// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract EscrowService {
    struct Escrow {
        address buyer;
        address seller;
        address arbitrator;
        uint256 amount;
        EscrowStatus status;
    }

    enum EscrowStatus { Pending, Completed, Refunded }

    uint256 public escrowCount = 0;
    mapping(uint256 => Escrow) public escrows;

    // Reentrancy Guard
    bool private locked;

    modifier nonReentrant() {
        require(!locked, "Reentrant call detected!");
        locked = true;
        _;
        locked = false;
    }

    // Events
    event EscrowCreated(uint256 escrowId, address buyer, address seller, uint256 amount);
    event EscrowCompleted(uint256 escrowId);
    event EscrowRefunded(uint256 escrowId);
    event DisputeResolved(uint256 escrowId, bool releasedToSeller);

    // Function to create a new escrow
    function createEscrow(address _seller, address _arbitrator) public payable nonReentrant {
        require(msg.value > 0, "Payment required");
        require(msg.sender != _seller, "Buyer and seller cannot be the same");
        require(_arbitrator != msg.sender && _arbitrator != _seller, "Arbitrator cannot be buyer or seller");

        escrowCount++;
        escrows[escrowCount] = Escrow({
            buyer: msg.sender,
            seller: _seller,
            arbitrator: _arbitrator,
            amount: msg.value,
            status: EscrowStatus.Pending
        });

        emit EscrowCreated(escrowCount, msg.sender, _seller, msg.value);
    }

    // Function to release funds to the seller
    function releaseFunds(uint256 _escrowId) public nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.buyer != address(0), "Escrow does not exist");
        require(msg.sender == escrow.buyer, "Only buyer can release funds");
        require(escrow.status == EscrowStatus.Pending, "Escrow not pending");

        escrow.status = EscrowStatus.Completed;
        payable(escrow.seller).transfer(escrow.amount);

        emit EscrowCompleted(_escrowId);
    }

    // Function to refund the buyer
    function refund(uint256 _escrowId) public nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.buyer != address(0), "Escrow does not exist");
        require(msg.sender == escrow.buyer || msg.sender == escrow.arbitrator, "Not authorized");
        require(escrow.status == EscrowStatus.Pending, "Escrow not pending");

        escrow.status = EscrowStatus.Refunded;
        payable(escrow.buyer).transfer(escrow.amount);

        emit EscrowRefunded(_escrowId);
    }

    // Function to resolve a dispute
    function resolveDispute(uint256 _escrowId, bool _releaseToSeller) public nonReentrant {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.buyer != address(0), "Escrow does not exist");
        require(msg.sender == escrow.arbitrator, "Only arbitrator can resolve disputes");
        require(escrow.status == EscrowStatus.Pending, "Escrow not pending");

        if (_releaseToSeller) {
            escrow.status = EscrowStatus.Completed;
            payable(escrow.seller).transfer(escrow.amount);
        } else {
            escrow.status = EscrowStatus.Refunded;
            payable(escrow.buyer).transfer(escrow.amount);
        }

        emit DisputeResolved(_escrowId, _releaseToSeller);
    }
}
