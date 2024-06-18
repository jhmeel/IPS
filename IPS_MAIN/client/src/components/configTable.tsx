import React, { useState } from "react";
import styled from "styled-components";
import { IoMdSettings } from "react-icons/io";
import axios from "axios";
import toast from "react-hot-toast";

const Container = styled.div`
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 5px;
  width: 100%;
  h2 {
    font-weight: 800;
  }
  @media (max-width: 767px) {
    h2 {
      font-size: 16px;
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 10px;
  border-left: 4px solid grey;
  text-align: left;
  font-size: 14px;
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 3px;
  border: 1px solid #ccc;
`;

const RulesContainer = styled.div`
  margin-top: 20px;
  max-height: 300px;
  overflow-y: scroll;
  button {
    padding: 5px 10px;
    font-size: 12px;
    background: #000;
    color: #fff;
    border: none;
    cursor: pointer;
  }
`;

const RuleInput = styled(Input)`
  margin-bottom: 10px;
`;

// Config data types
type Rule = {
  pattern: string;
  action: string;
  description: string;
};

type ConfigData = {
  allowLimiter: boolean;
  rateLimitWindow: number;
  rateLimitMax: number;
  whitelistedIp: Set<string>;
  blacklistedIp: Set<string>;
  unsafeAllowAnyHttpMethod: boolean;
  allowedHttpMethods: Array<string>;
  allowedHostnames: RegExp;
  rules: Rule[];
};

const ConfigTable: React.FC = () => {
  const [configData, setConfigData] = useState<ConfigData>({
    allowLimiter: true,
    rateLimitWindow: 15,
    rateLimitMax: 100,
    whitelistedIp: new Set(),
    blacklistedIp: new Set(),
    unsafeAllowAnyHttpMethod: false,
    allowedHttpMethods: ["GET", "POST", "PUT", "DELETE"],
    allowedHostnames: /^localhost$/,
    rules: [
      {
        pattern: "\\b(hack|exploit|malicious|injection)\\b",
        action: "block",
        description: "Suspected malicious intent",
      },
      {
        pattern: "\\b(eval|exec|system)\\b",
        action: "block",
        description: "Potential code execution attempt",
      },
      {
        pattern: "<script>|javascript:",
        action: "block",
        description: "Potential cross site scripting, xss",
      },
      {
        pattern: "\\bwget|curl|httrack|nikto|sqlmap|nmap|\\b",
        action: "block",
        description: "Potential DOS attack",
      },
      {
        pattern: "\\b(union\\s+select|from\\s+information_schema)\\b",
        action: "block",
        description: "Suspected SQL injection attempt",
      },
      {
        pattern: "\\b(script|iframe|object|embed)\\b",
        action: "log",
        description: "Potential XSS attempt",
      },
      {
        pattern: "\\b(select\\s+\\*|update|delete|drop|truncate)\\b",
        action: "block",
        description: "Potential SQL injection attempt",
      },
      {
        pattern: "\\b(onerror|onload|onmouseover|onmouseout)\\b",
        action: "block",
        description: "Potential XSS attempt",
      },
      {
        pattern: "\\b(base64|eval)\\b",
        action: "block",
        description: "Potential code execution attempt",
      },
      {
        pattern: "\\b(cmd\\.exe|powershell|bash)\\b",
        action: "block",
        description: "Potential shell command execution attempt",
      },
      {
        pattern: "\\b(alert|confirm|prompt)\\b",
        action: "log",
        description: "Potential XSS attempt",
      },
      {
        pattern: "\\b(phpmyadmin|admin|manager)\\b",
        action: "log",
        description: "Potential unauthorized access attempt",
      },
    ],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof ConfigData
  ) => {
    setConfigData({
      ...configData,
      [key]: isNaN(Number(e.target.value))
        ? e.target.value
        : Number(e.target.value),
    });
  };

  const handleSetChange = (
    e: React.KeyboardEvent<HTMLInputElement>,
    key: "whitelistedIp" | "blacklistedIp"
  ) => {
    if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
      setConfigData((prevState) => {
        const newSet = new Set(prevState[key]);
        newSet.add(e.currentTarget.value.trim());
        return { ...prevState, [key]: newSet };
      });
      e.currentTarget.value = "";
    }
  };

  const handleAllowedMethodsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const methods = e.target.value.split(",").map((method) => method.trim());
    setConfigData({
      ...configData,
      allowedHttpMethods: methods,
    });
  };

  const handleRuleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    key: keyof Rule
  ) => {
    const newRules = [...configData.rules];
    newRules[index][key] = e.target.value;
    setConfigData({ ...configData, rules: newRules });
  };
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const updateConfig = async () => {
    try {
      setUpdateLoading(true);
      
      const { data } = await axios.post(
        "http://localhost:8000/update-config",
        configData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setUpdateLoading(false);
      toast.success(data.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setUpdateLoading(false);
      const errMsg =  error?.response?.data?.message ||
      error?.response?.statusText ||
      error?.message;
      toast.error(errMsg);
    }
  };

  return (
    <Container>
      <h2 style={{ display: "flex", alignItems: "center", gap: "3px" }}>
        <IoMdSettings /> Configurations
      </h2>
      <Table>
        <tbody>
          <tr>
            <Th>Allow Limiter</Th>
            <Td>
              <Input
                type="checkbox"
                checked={configData.allowLimiter}
                onChange={(e) =>
                  setConfigData({
                    ...configData,
                    allowLimiter: e.target.checked,
                  })
                }
              />
            </Td>
          </tr>
          {configData.allowLimiter && (
            <>
              <tr>
                <Th>Rate Limit Window (sec)</Th>
                <Td>
                  <Input
                    type="number"
                    value={configData.rateLimitWindow}
                    onChange={(e) => handleInputChange(e, "rateLimitWindow")}
                  />
                </Td>
              </tr>
              <tr>
                <Th>Rate Limit Max</Th>
                <Td>
                  <Input
                    type="number"
                    value={configData.rateLimitMax}
                    onChange={(e) => handleInputChange(e, "rateLimitMax")}
                  />
                </Td>
              </tr>
            </>
          )}
          <tr>
            <Th>Whitelisted IP</Th>
            <Td>
              <Input
                type="text"
                placeholder="Press Enter to add IP"
                onKeyDown={(e) => handleSetChange(e, "whitelistedIp")}
              />
            </Td>
          </tr>
          <tr>
            <Th>Blacklisted IP</Th>
            <Td>
              <Input
                type="text"
                placeholder="Press Enter to add IP"
                onKeyDown={(e) => handleSetChange(e, "blacklistedIp")}
              />
            </Td>
          </tr>
          <tr>
            <Th>Allowed HTTP Methods</Th>
            <Td>
              <Input
                type="text"
                value={configData.allowedHttpMethods.join(", ")}
                onChange={handleAllowedMethodsChange}
              />
            </Td>
          </tr>
          <tr>
            <Th>Allowed Hostnames</Th>
            <Td>
              <Input
                type="text"
                value={configData.allowedHostnames.source}
                onChange={(e) =>
                  setConfigData({
                    ...configData,
                    allowedHostnames: new RegExp(e.target.value),
                  })
                }
              />
            </Td>
          </tr>
        </tbody>
      </Table>

      <RulesContainer>
        <h2>Rules</h2>
        {configData.rules.map((rule, index) => (
          <div key={index}>
            <span style={{ fontWeight: "bold" }}>
              #{index + 1} {rule.description}
            </span>
            <RuleInput
              type="text"
              value={rule.pattern}
              onChange={(e) => handleRuleChange(e, index, "pattern")}
              placeholder="Pattern"
            />
            <RuleInput
              type="text"
              value={rule.action}
              onChange={(e) => handleRuleChange(e, index, "action")}
              placeholder="Action"
            />
            <RuleInput
              type="text"
              value={rule.description}
              onChange={(e) => handleRuleChange(e, index, "description")}
              placeholder="Description"
            />
          </div>
        ))}
        <button onClick={updateConfig}>{updateLoading ?'updating...':'Update Config'}</button>
      </RulesContainer>
    </Container>
  );
};

export default ConfigTable;
