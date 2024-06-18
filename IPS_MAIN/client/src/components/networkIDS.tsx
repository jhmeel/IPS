import React from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  background-color: #222;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  padding: 20px 10px;
  font-family: "Roboto", sans-serif;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  h2 {
    color: #fff;
    font-size: 16px;
  }
  .s-pt-w {
    width: 70%;
    overflow-x: scroll;
  }
  .s-pt-w::-webkit-scrollbar {
    display: none;
  }
  @media (max-width: 767px) {
    .s-pt-w {
      width: 100%;
    }
  }
`;

const Header = styled.h1`
  font-size: 24px;
  text-align: center;
  margin-bottom: 30px;
  color: #fff;
`;

const MetricContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  width: 100%;
`;

const MetricBox = styled.div`
  background-color: #333;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  width: 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease-in-out;
  div {
    color: #c2bcbc;
  }
  &:hover {
    transform: translateY(-5px);
  }
`;

const MetricValue = styled.div`
  font-size: 30px;
  font-weight: bold;
  color: #ff6347;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  @media (max-width: 767px) {
    & {
      font-size: 25px;
    }
  }
`;

const SuspiciousPacketsTable = styled.table`
  width: 100%;

  background-color: #333;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
`;

const TableHead = styled.th`
  background-color: #444;
  padding: 15px;
  text-align: left;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 14px;
  color: #fff;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #2c2c2c;
  }

  &:hover {
    background-color: #444;
  }
`;

const TableCell = styled.td`
  padding: 15px;
  color: #c2bcbc;
  font-size: 12px;
`;

const NetworkIDS: React.FC = () => {
  const suspiciousPackets = [
    {
      source: "193.045.235.04",
      flag: "RSTR",
      protocol: "TCP",
      service: "http",
      error: "03",
      count: 812,
    },
    {
      source: "193.145.235.02",
      flag: "RSTR",
      protocol: "TCP",
      service: "http",
      error: "03",
      count: 12,
    },
  ];

  return (
    <Container>
      <Header>Dashboard</Header>
      <MetricContainer>
        <MetricBox>
          <div>Notifications</div>
          <MetricValue>0</MetricValue>
        </MetricBox>
        <MetricBox>
          <div>Suspicious Packets</div>
          <MetricValue>0</MetricValue>
        </MetricBox>
        <MetricBox>
          <div>Suspicious Source</div>
          <MetricValue>0</MetricValue>
        </MetricBox>
      </MetricContainer>
      <h2>Suspicious Packets</h2>
      <div className="s-pt-w">
        <SuspiciousPacketsTable>
          <thead>
            <tr>
              <TableHead>source</TableHead>
              <TableHead>flag</TableHead>
              <TableHead>protocol</TableHead>
              <TableHead>service</TableHead>
              <TableHead>error</TableHead>
              <TableHead>count</TableHead>
            </tr>
          </thead>
          <tbody>
            {suspiciousPackets.map((packet, index) => (
              <TableRow key={index}>
                <TableCell>{packet.source}</TableCell>
                <TableCell>{packet.flag}</TableCell>
                <TableCell>{packet.protocol}</TableCell>
                <TableCell>{packet.service}</TableCell>
                <TableCell>{packet.error}</TableCell>
                <TableCell>{packet.count}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </SuspiciousPacketsTable>
      </div>
    </Container>
  );
};

export default NetworkIDS;
