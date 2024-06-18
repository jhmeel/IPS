import Config from "./config.js";
import winston from "winston";
import express from "express";
import IPS from "./worker.js";
import { existsSync, promises as fsPromises,  } from "fs";
import cors from 'cors'
import bodyParser from "body-parser";

const app = express();
const ips = new IPS(app, Config);


export const logger = winston.createLogger({
  level: "debug",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: `./ips.log` }),
    new winston.transports.Console(),
  ],
});




app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true, parameterLimit: 50000 }));
app.use(ips.ips);
app.use((req, res, next)=>{
  logger.info(req.headers)
  next()
})


// Endpoint to get the current IPS configuration
app.get("/getIPSConfig", (req, res) => {
  res.json({
    attackPatterns: Config.attackPatterns,
    whitelist: Array.from(Config.whitelist),
    blacklist: Array.from(Config.blacklist),
  });
});
app.post("/update-config", (req, res) => {
  const updates = req.body;
  if(!updates){

  for (const key in updates) {
    if (Object.prototype.hasOwnProperty.call(Config, key)) {
      if (key === "whitelistedIp" || key === "blacklistedIp") {
        // expecting it to be an array
        Config[key] = new Set(updates[key]);
      } else if (key === "allowedHttpMethods") {
 
        Config[key] = updates[key];
      } else if (key === "allowedHostnames") {
         
        Config[key] = new RegExp(updates[key]);
      } else if (key === "rules") {
        //  expecting it to be an array of rule objects
        Config[key] = updates[key];
      } else {
        Config[key] = updates[key];
      }
    }
  }
  res.status(200).send({ message: "Configuration updated successfully", Config });
  }
  res.status(400).send({ message: "Invalid configuraton", Config });
 
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
