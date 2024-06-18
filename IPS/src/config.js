const Config = {
  port: 8000,
  rateLimitWindow: 15,
  rateLimitMax: 100,
  whitelist: new Set(),
  blacklist: new Set(),
  rules: [
    {
      pattern: "/\b(hack|exploit|malicious|injection)\b/i",
      action: "block",
      description: "Suspected malicious intent",
    },
    {
      pattern: "/\b(eval|exec|system)\b/i",
      action: "block",
      description: "Potential code execution attempt",
    },
    {
      pattern: "/<script>|javascript:/i",
      action: "block",
      description: "Potential cross site scripting, xss",
    },

    {
      pattern: "/\\bwget|curl|httrack|nikto|sqlmap|nmap|/\\b/i",
      action: "block",
      description: "Potential DOS attack",
    },
    {
      pattern: "/\b(union\\s+select|from\\s+information_schema)\b/i",
      action: "block",
      description: "Suspected SQL injection attempt",
    },
    {
      pattern: "/\b(script|iframe|object|embed)\b/i",
      action: "log",
      description: "Potential XSS attempt",
    },
    {
      pattern: "/\b(select\\s+\\*|update|delete|drop|truncate)\b/i",
      action: "block",
      description: "Potential SQL injection attempt",
    },
    {
      pattern: "/\b(onerror|onload|onmouseover|onmouseout)\b/i",
      action: "block",
      description: "Potential XSS attempt",
    },
    {
      pattern: "/\b(base64|eval)\b/i",
      action: "block",
      description: "Potential code execution attempt",
    },
    {
      pattern: "/\b(cmd\\.exe|powershell|bash)\b/i",
      action: "block",
      description: "Potential shell command execution attempt",
    },
    {
      pattern: "/\b(alert|confirm|prompt)\b/i",
      action: "log",
      description: "Potential XSS attempt",
    },
    {
      pattern: "/\b(phpmyadmin|admin|manager)\b/i",
      action: "log",
      description: "Potential unauthorized access attempt",
    },
  ],
};

export default Config;
