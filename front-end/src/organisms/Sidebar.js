/* global chrome */
import React from "react";
import PropTypes from "prop-types";

import { useAuth0 } from "@auth0/auth0-react";

import { LogoutIcon, LogoIcon } from "../atoms/icons";
import SidebarWorkspace from "../molecules/SidebarWorkspace";

import "./Sidebar.css";

function Sidebar({ onClickWorkspace, accountId }) {
  const { logout } = useAuth0();

  const spacing = <div className="SideBar-spacing"/>;
  const divider = <div className="SideBar-divider"/>;
  const dividerLight = <div className="SideBar-divider-light"/>;
  const componentName = "SideBar";

  const handleGoToWorkspace = (id) => onClickWorkspace(id);
  
  const handleLogout = () => {
    if (chrome.runtime !== undefined) {
      // clear auth0Id and send to web extension
      window.localStorage.setItem("auth0Id", "");
      chrome.runtime.sendMessage(`${process.env.REACT_APP_EXTENSION_ID}`, { messageFromWeb: window.localStorage });
    }
    logout();
  };

  return (
    <div className={`${componentName}`}>
      <div className={`${componentName}-header`}>
        <LogoIcon className={`${componentName}-logo`}/>
        <div className={`${componentName}-logo-text`}>TextSavvy</div>
      </div>
      {divider}
      <SidebarWorkspace onSelectWorkspace={handleGoToWorkspace} accountId={accountId}/>
      {spacing}
      {dividerLight}
      <div className={`${componentName}-logout ${componentName}-option`} onClick={handleLogout}>
        <div className={`${componentName}-option-logo`}><LogoutIcon/></div>
        <div className={`${componentName}-option-text`}>Logout</div>
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  onClickWorkspace: PropTypes.func.isRequired,
  accountId: PropTypes.string.isRequired
};


export default Sidebar;