import React from "react";

function Header({ username, name }) {
  return (
    <div className="header">
      <h1>
        Welcome, <span>{username}</span>
      </h1>
      <p>
        Name: <span>{name}</span>
      </p>
    </div>
  );
}

export default Header;
