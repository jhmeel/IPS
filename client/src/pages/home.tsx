import React from "react";
import Header from "../components/header";
import ConfigTable from "../components/configTable";
import NetworkIDS from "../components/networkIDS";
import Logs from "../components/logs";
import styled from "styled-components";

const Home = (): React.ReactElement => {
  return (
    <HomeRenderer>
      <Header />
      <NetworkIDS />
      <div className="c-l-cont">
        <ConfigTable />
        <Logs />
      </div>
    </HomeRenderer>
  );
};

export default Home;

const HomeRenderer = styled.div`
  width: 100%;
  .c-l-cont {
    display: flex;
    width: 100%;
  }
  @media (max-width: 767px) {
    .c-l-cont {
      flex-direction: column;
    }
  }
`;
