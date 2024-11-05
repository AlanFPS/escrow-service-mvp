import React from "react";

function Header({ username, name }) {
  const handleLogout = () => {
    // Placeholder for logout logic
    alert("Logged out!");
  };

  return (
    <div className="header">
      <div className="header-content">
        <h1>
          Welcome, <span>{username}</span>
        </h1>
        <p>
          Name: <span>{name}</span>
        </p>
      </div>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Header;
