import React from "react";

function ActionButtons({ handleSendMoney, handleReceiveMoney }) {
  return (
    <div className="action-buttons">
      <button className="send-btn" onClick={handleSendMoney}>
        Send Money
      </button>
      <button className="receive-btn" onClick={handleReceiveMoney}>
        Receive Money
      </button>
    </div>
  );
}

export default ActionButtons;
