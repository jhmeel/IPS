import Config from "./config.js";
import winston from "winston";
import express from "express";
import rateLimit from "express-rate-limit";
import { existsSync, promises as fsPromises,  } from "fs";
import cors from 'cors'
import bodyParser from "body-parser";
const app = express();
const logger = winston.createLogger({
  level: "debug",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: `./ips.log` }),
    new winston.transports.Console(),
  ],
});

const limiter = rateLimit({
  windowMs: Config.rateLimitWindow * 60 * 1000,
  max: Config.rateLimitMax,
});

const idpsMiddleware = (req, res, next) => {
  const url = req.url;
  const method = req.method;
  const userAgent = req.headers["user-agent"];
  const requestData = `${method} ${url} (User-Agent: ${userAgent})`;
  let ipAddress =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (["::ffff:127.0.0.1", "::1"].includes(ipAddress)) {
    ipAddress = "127.0.0.1";
  }
  if (Config.blacklist.has(ipAddress)) {
    logger.info("Blocked request from blacklisted IP:", ipAddress);
    return res.status(403).send("Access denied");
  }

  for (const rule of Config.rules) {
    if (rule.pattern.match(requestData)) {
      const logEntry = `[${new Date().toISOString()}] ${ipAddress} ${requestData} - ${
        rule.description
      }`;
      logger.info(logEntry);

      if (rule.action === "block") {
        res.status(403).send("Forbidden");
        return;
      }
    }
  }

  next();
};

app.use(limiter);
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true, parameterLimit: 50000 }));
app.use(idpsMiddleware);
app.use((req, res, next)=>{
  logger.info(req.headers)
  next()
})

app.post("/updateWhitelist", (req, res) => {
  const { ipAddress } = req.body;
  Config.whitelist.add(ipAddress);
  res.send("Whitelist updated successfully");
});

// Endpoint to update the blacklist
app.post("/updateBlacklist", (req, res) => {
  const { ipAddress } = req.body;
  Config.blacklist.add(ipAddress);
  res.send("Blacklist updated successfully");
});

// Endpoint to get the current IPS configuration
app.get("/getIPSConfig", (req, res) => {
  res.json({
    attackPatterns: Config.attackPatterns,
    whitelist: Array.from(Config.whitelist),
    blacklist: Array.from(Config.blacklist),
  });
});

const readFileAsync = fsPromises.readFile;
app.get("/ips-logs", async (req, res) => {
  if (!existsSync("./ips.log")) return;
  const fileContent = await readFileAsync('./ips.log', "utf-8");
  res.status(200).json({
    logs: fileContent,
    suspiciousPacket:0,

  })
});

app.listen(Config.port, () => {
  logger.info(`server running on port ${Config.port}`);
});
