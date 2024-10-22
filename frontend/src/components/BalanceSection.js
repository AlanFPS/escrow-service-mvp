import React from "react";

function BalanceSection({ fiatBalance, cryptoBalance }) {
  return (
    <div className="balance">
      <div className="balance-card">
        <h2>FIAT Balance</h2>
        <p>{fiatBalance}</p>
      </div>
      <div className="balance-card">
        <h2>CRYPTO Balance (ETH)</h2>
        <p>{cryptoBalance}</p>
      </div>
    </div>
  );
}

export default BalanceSection;
