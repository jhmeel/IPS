import React from "react";
import styled from "styled-components";
import { CircleLoaderIcon } from "../assets/icons";
import logo from '../assets/IPS logo.png'
const MLoader: React.FC = () => {
  return (
    <Loader>
      <img src={logo} /> <CircleLoaderIcon className="custom-loader" />
    </Loader>
  );
};

export default MLoader;
const Loader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  background: #fff;
  background-size: 200% 200%;
  cursor: progress;
  img {
    height: auto;
    width: 4.5em;
    z-index: 10;
    cursor: progress;
  }
  p {
    font-size: 12px;
    color: #1e282f;
  }
  .custom-loader {
    width: 1em;
    transform-origin: center;
    animation: rotate4 2s linear infinite;
  }

  @keyframes rotate4 {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash4 {
    0% {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
    }

    50% {
      stroke-dasharray: 90, 200;
      stroke-dashoffset: -35px;
    }

    100% {
      stroke-dashoffset: -125px;
    }
  }
`;
