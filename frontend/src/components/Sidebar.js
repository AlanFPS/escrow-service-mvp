import React, { useState } from "react";
import {
  FaHome,
  FaExchangeAlt,
  FaUser,
  FaBars,
  FaChartPie,
  FaCog,
} from "react-icons/fa";
import "./Sidebar.css";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState(0);

  const menuItems = [
    { icon: <FaHome />, text: "Home" },
    { icon: <FaExchangeAlt />, text: "Transactions" },
    { icon: <FaChartPie />, text: "Analytics" },
    { icon: <FaUser />, text: "Profile" },
    { icon: <FaCog />, text: "Settings" },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? "" : "collapsed"}`}>
      <div className="sidebar-header">
        <div className="logo">{isOpen ? "ZERVA" : "Z"}</div>
        <FaBars className="toggle-btn" onClick={toggleSidebar} />
      </div>
      <ul className="menu">
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={activeItem === index ? "active" : ""}
            onClick={() => setActiveItem(index)}
          >
            {item.icon}
            {isOpen && <span>{item.text}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
