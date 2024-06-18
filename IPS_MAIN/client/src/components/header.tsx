import React from "react";
import {IoLogoGithub } from "react-icons/io";
import Config from "../config";
import styled from "styled-components";
import ipsLogo from '../assets/IPS logo.png'
function Header(): React.ReactElement {
  const openGithub = (): void => {
    window.open(Config.github, "_blank");
  };

  return (
    <HeaderRenderer>
      <span className="logo-cont">
        <img className="ips-logo" src={ipsLogo} />
      </span>
      <div className="icons">
        <IoLogoGithub className="icon" size={24} onClick={openGithub} />
      </div>
    </HeaderRenderer>
  );
}

export default Header;

const HeaderRenderer = styled.div`
 display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  z-index: 1000;
  top: 0;
  width: 100%;
  height: 70px;
  border-bottom: 1px solid #ededed;
  padding: 5px;
  background-color: #f5f5f5;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  -moz-backdrop-filter: blur(10px);
  -o-backdrop-filter: blur(10px);
  transform: 0.5s;

  .logo-cont {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .ips-logo {
    height: 2.5em;
    width: 2.5em;
    z-index: 10;
    cursor: pointer;
  }
  .icons {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-right: 10px;
  }

  .icon {
    height: 20px;
    width: 20px;
    border-radius: 20px;
    border: 1px solid #ededed;
    padding: 8px;
    cursor: pointer;
    box-sizing: content-box;
  }
  @media(max-width:767px){

    h2{
      font-size: 18px;
    }
}
`;
