import React, { useState } from "react";

function TransactionForm({ transactionType, setTransactionType }) {
  const [amount, setAmount] = useState("");
  const [recipientUsername, setRecipientUsername] = useState("");
  const [fiatDetails, setFiatDetails] = useState("");
  const [cryptoDetails, setCryptoDetails] = useState("");

  const handleTransactionTypeChange = (e) => {
    setTransactionType(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for form submission logic
    alert("Transaction submitted!");
  };

  return (
    <div className="transaction-form">
      <h2>Transaction Details</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Amount to Send:</label>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Recipient Username:</label>
          <input
            type="text"
            placeholder="Enter username"
            value={recipientUsername}
            onChange={(e) => setRecipientUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Choose Transaction Type:</label>
          <select
            value={transactionType}
            onChange={handleTransactionTypeChange}
          >
            <option value="">--Select--</option>
            <option value="fiat">FIAT</option>
            <option value="crypto">CRYPTO</option>
          </select>
        </div>
        {transactionType === "fiat" && (
          <div className="form-group">
            <label>Bank Account Number:</label>
            <input
              type="text"
              placeholder="Enter bank account number"
              value={fiatDetails}
              onChange={(e) => setFiatDetails(e.target.value)}
            />
          </div>
        )}
        {transactionType === "crypto" && (
          <div className="form-group">
            <label>Wallet Address:</label>
            <input
              type="text"
              placeholder="Enter wallet address"
              value={cryptoDetails}
              onChange={(e) => setCryptoDetails(e.target.value)}
            />
          </div>
        )}
        <button className="submit-btn" type="submit">
          Submit Transaction
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;
