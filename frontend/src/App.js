import React, { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import BalanceSection from "./components/BalanceSection";
import ActionButtons from "./components/ActionButtons";
import TransactionForm from "./components/TransactionForm";
import TransactionHistory from "./components/TransactionHistory";
import Notifications from "./components/Notifications";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [transactionType, setTransactionType] = useState("");

  const handleSendMoney = () => {
    setShowForm(true);
  };

  const handleReceiveMoney = () => {
    setShowForm(true);
  };

  // Sample transaction data
  const transactions = [
    {
      id: 1,
      date: "2023-10-01",
      type: "Send",
      amount: "$500",
      status: "Completed",
    },
    {
      id: 2,
      date: "2023-09-28",
      type: "Receive",
      amount: "0.2 ETH",
      status: "Pending",
    },
    // Add more sample transactions
  ];

  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        {/* Header */}
        <Header username="User123" name="John Doe" />

        {/* Notifications */}
        <Notifications />

        {/* Balance Section */}
        <BalanceSection fiatBalance="$10,000.00" cryptoBalance="5.0 ETH" />

        {/* Action Buttons */}
        <ActionButtons
          handleSendMoney={handleSendMoney}
          handleReceiveMoney={handleReceiveMoney}
        />

        {/* Transaction Form */}
        {showForm && (
          <TransactionForm
            transactionType={transactionType}
            setTransactionType={setTransactionType}
          />
        )}

        {/* Transaction History */}
        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  );
}

export default App;
