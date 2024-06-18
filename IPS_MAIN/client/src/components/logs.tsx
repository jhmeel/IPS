/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { IoMdInfinite } from "react-icons/io";
const Logs = () => {
  const [logs, setLogs] = useState([]);
  const fetchLog = async () => {
    const { data } = await axios.get("http://localhost:8000/ips-logs", {
      headers: { "Content-Type": "application/json" },
    });
    setLogs(data.logs?.split("\n"));
  };
  useEffect(() => {
    fetchLog();
  }, []);

  return (
    <LogsRenderer>
      <h2 style={{ display: "flex", alignItems: "center", gap: "3px", fontWeight:'800' }}>
        <IoMdInfinite />
        System Logs
      </h2>
      <div className="logs-cont">
        {logs?.map((log: any, i) => (
          <pre
            style={{ color: log.slice(10, 14) == "info" ? "green" : "crimson" }}
            key={i}
          >
            {log}
          </pre>
        ))}
      </div>
    </LogsRenderer>
  );
};

export default Logs;

const LogsRenderer = styled.div`
  background-color: #f5f5f5;
  max-width: 600px;
  min-width: 300px;
  padding: 10px;
  .logs-cont {
    max-height: 450px;
    min-height: 450px;
    overflow-y: scroll;
    width: auto;
    background-color: #000;
    padding: 5px 10px;
    color: #119811;
    padding: 15px;
  }
  .logs-cont::-webkit-scrollbar {
    display: none;
  }
`;
