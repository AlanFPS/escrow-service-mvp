import React, { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import BalanceSection from "./components/BalanceSection";
import ActionButtons from "./components/ActionButtons";
import TransactionForm from "./components/TransactionForm";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [transactionType, setTransactionType] = useState("");

  const handleSendMoney = () => {
    setShowForm(true);
  };

  const handleReceiveMoney = () => {
    setShowForm(true);
  };

  return (
    <div className="container">
      {/* Header */}
      <Header username="User123" name="John Doe" />

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
    </div>
  );
}

export default App;
