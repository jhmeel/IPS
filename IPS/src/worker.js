import { logger } from "./index.js";
import rateLimit from "express-rate-limit";


class RequestRejectedError extends Error {
  constructor(message) {
    super(message);
    this.name = `<REQUEST_REJECT_ERR>`;
    logger.error(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

class IPS {
  #ALLOWED_HTTP_METHODS = [];
  #ALLOWED_HOST_NAMES = [];
  #ALLOW_ANY_HTTP_METHOD = [];
  #FORBIDDEN_NULL = ["\0", "%00"];
  #FORBIDDEN_LF = ["\n", "%0a", "%0A"];
  #FORBIDDEN_CR = ["\r", "%0d", "%0D"];
  #FORBIDDEN_LINE_SEPARATOR = ["\u2028"];
  #FORBIDDEN_PARAGRAPH_SEPARATOR = ["\u2029"];
  #FORBIDDEN_SEMICOLON = [';', '%3b', '%3B'];
  #FORBIDDEN_ENCODED_PERIOD = ['%2e', '%2E'];
  #ASSIGNED_AND_NOT_ISO_CONTROL_PATTERN = new RegExp(
    '[\\p{IsAssigned}&&[^\\p{IsControl}]]*',
    'g'
  );
  #ASSIGNED_AND_NOT_ISO_CONTROL_PREDICATE = ((testName) => this.#ASSIGNED_AND_NOT_ISO_CONTROL_PATTERN.test(testName));
  #ALLOWED_HEADER_NAMES = this.#ASSIGNED_AND_NOT_ISO_CONTROL_PREDICATE;
  #ALLOW_HEADER_VALUES = this.#ASSIGNED_AND_NOT_ISO_CONTROL_PREDICATE;
  
  urlBlocklistsAddAll = [];
  decodedUrlBlocklist = [];
  encodedUrlBlocklist = [];
  allowUrlEncodedDoubleSlash = [];

  logging = false;

  constructor(server, config) {
    this.config = config;
    this.server = server;

    this.urlBlocklistsAddAll.push(...this.#FORBIDDEN_NULL);
    this.urlBlocklistsAddAll.push(...this.#FORBIDDEN_LF);
    this.urlBlocklistsAddAll.push(...this.#FORBIDDEN_CR);

    this.encodedUrlBlocklist.push(...this.#FORBIDDEN_LINE_SEPARATOR);
    this.encodedUrlBlocklist.push(...this.#FORBIDDEN_PARAGRAPH_SEPARATOR);

    if (this.config !== undefined) {
      if (this.config.logging === true) {
        this.logging = true;
      }

      this.#ALLOWED_HTTP_METHODS =
        this.config.unsafeAllowAnyHttpMethod === true
          ? this.#ALLOW_ANY_HTTP_METHOD
          : this.createDefaultAllowedHttpMethods();

      if (this.config.allowedHttpMethods !== undefined) {
        this.#ALLOWED_HTTP_METHODS =
          this.config.allowedHttpMethods.length !== 0
            ? this.config.allowedHttpMethods
            : this.#ALLOW_ANY_HTTP_METHOD;
      }

      if (this.config.allowLimiter) {
        const limiter = rateLimit({
          windowMs: this.config.rateLimitWindow * 60 * 1000,
          max: this.config.rateLimitMax,
        });

        this.server.use(limiter);
      }

      if (this.config.allowSemicolon === true) {
        this.urlBlocklistsRemoveAll(this.#FORBIDDEN_SEMICOLON);
      }

      if (this.config.allowUrlEncodedSlash === true) {
        this.urlBlocklistsRemoveAll(this.FORBIDDEN_FORWARDSLASH);
      }

      if (this.config.allowUrlEncodedDoubleSlash === true) {
        this.urlBlocklistsRemoveAll(this.FORBIDDEN_DOUBLE_FORWARDSLASH);
      }

      if (this.config.allowUrlEncodedPeriod === true) {
        this.removeItems(this.encodedUrlBlocklist, this.#FORBIDDEN_ENCODED_PERIOD);
      }

      if (this.config.allowNull === true) {
        this.urlBlocklistsRemoveAll(this.#FORBIDDEN_NULL);
      }

      if (this.config.allowUrlEncodedCarriageReturn === true) {
        this.urlBlocklistsRemoveAll(this.#FORBIDDEN_CR);
      }

      if (this.config.allowUrlEncodedLineFeed === true) {
        this.urlBlocklistsRemoveAll(this.#FORBIDDEN_LF);
      }

      if (this.config.allowUrlEncodedParagraphSeparator === true) {
        this.removeItems(this.encodedUrlBlocklist, this.#FORBIDDEN_PARAGRAPH_SEPARATOR);
      }

      if (this.config.allowUrlEncodedLineSeparator === true) {
        this.removeItems(this.encodedUrlBlocklist, this.#FORBIDDEN_LINE_SEPARATOR);
      }

      if (this.config.allowedHeaderNames !== undefined) {
        this.#ALLOWED_HEADER_NAMES = this.config.allowedHeaderNames;
      }

      if (this.config.allowedHeaderValues !== undefined) {
        this.#ALLOW_HEADER_VALUES = this.config.allowedHeaderValues;
      }

      if (this.config.allowedHostnames !== undefined) {
        this.#ALLOWED_HOST_NAMES = this.config.allowedHostnames;
      }

      if (this.config.decodedUrlBlockList !== undefined && this.config.decodedUrlBlockList.length !== 0) {
        this.decodedUrlBlocklist.push(...this.config.decodedUrlBlockList);
      }

      if (this.config.encodedUrlBlockList !== undefined && this.config.encodedUrlBlockList.length !== 0) {
        this.encodedUrlBlocklist.push(...this.config.encodedUrlBlockList);
      }
    }
  }

  ips = async (req, res, next) => {
    await this.rejectForbiddenHttpMethod(req)
      .then(() => this.rejectedBlocklistedUrls(req))
      .then(() => this.rejectedUntrustedHosts(req))
      .then(() => this.rejectNonNormalizedRequests(req))
      .then(() => this.validateRequestPropsForAttackPatterns(req))
      .then(() => this.validateIp(req))
      .then(() => this.rejectNonPrintableAsciiCharactersInFieldName(req, req.url, "requestURI"))
      .then(() => next())
      .catch((error) => {
        if (this.logging === true) {
          logger.warn(error.message);
        }
        this.reject(req, res);
      });
  };

  isNormalizedRequest = (req) => {
    if (!this.isNormalized(req.url)) {
      return false;
    }
    if (!this.isNormalized(req.originalUrl)) {
      return false;
    }
    if (!this.isNormalized(req.path)) {
      return false;
    }
    return this.isNormalized(req.route);
  };

  static containsOnlyPrintableAsciiCharacters = (uri) => {
    if (uri === undefined || uri === null) {
      return true;
    }
    const length = uri.length;

    for (let i = 0; i < length; i++) {
      const ch = uri.charAt(i);
      if (ch < "\u0020" || ch > "\u007e") {
        return false;
      }
    }
    return true;
  };

  static valueContains = (value, contains) => {
    return (
      value !== undefined &&
      value !== null &&
      value.length > 0 &&
      value.indexOf(contains) !== -1
    );
  };

  validateRequestPropsForAttackPatterns(req) {
    const url = req.url;
    const method = req.method;
    const userAgent = req.headers["user-agent"];
    const requestData = `${method} ${url} (User-Agent: ${userAgent})(req-body: ${req.body})`;
    let ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    if (["::ffff:127.0.0.1", "::1"].includes(ipAddress)) {
      ipAddress = "127.0.0.1";
    }

    for (const rule of this.config.rules) {
        //TODO: remove ipAddress !== "127.0.0.1" in production env 
      if (new RegExp(rule.pattern).test(requestData) && ipAddress !== "127.0.0.1") {
        const logEntry = `[${new Date().toISOString()}] ${ipAddress} ${requestData} - ${rule.description}`;
        logger.info(logEntry);

        if (rule.action === "block") {
          throw new RequestRejectedError(`Request was rejected due to Matching attack pattern:${rule.pattern}`);
        }
      }
    }
  }

  validateIp(req) {
    let ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    if (["::ffff:127.0.0.1", "::1"].includes(ipAddress)) {
      ipAddress = "127.0.0.1";
    }
    if (this.config.blacklistedIp.has(ipAddress)) {
      throw new RequestRejectedError(`Blocked request from blacklisted IP: ${ipAddress}`);
    }
  }

  isNormalized = (path) => {
    if (path === undefined || path === null) {
      return true;
    }

    for (let i = path.length; i > 0;) {
      let slashIndex = path.lastIndexOf("/", i - 1);
      let gap = i - slashIndex;
      if (gap === 2 && path.charAt(slashIndex + 1) === ".") {
        return false; // ".", "/./" or "/."
      }
      if (gap === 3 && path.charAt(slashIndex + 1) === "." && path.charAt(slashIndex + 2) === ".") {
        return false;
      }
      i = slashIndex;
    }
    return true;
  };

 
  rejectNonNormalizedRequests = async (req) => {
    if (!this.isNormalizedRequest(req)) {
      throw new RequestRejectedError(
        `The request was rejected because the URL was not normalized.`
      );
    }
  };

  rejectNonPrintableAsciiCharactersInFieldName = async (req, toCheck, propertyName) => {
    if (!IPS.containsOnlyPrintableAsciiCharacters(toCheck)) {
      throw new RequestRejectedError(
        `The ${propertyName} was rejected because it can only contain printable ASCII characters.`
      );
    }
  };

  urlBlocklistsAddAll(values) {
    this.encodedUrlBlocklist.push(...values);
    this.decodedUrlBlocklist.push(...values);
  }

  urlBlocklistsRemoveAll(values) {
    this.removeItems(this.encodedUrlBlocklist, values);
    this.removeItems(this.decodedUrlBlocklist, values);
  }

  removeItems(originalArray, itemsTobeRemoved) {
    for (const item of itemsTobeRemoved) {
      const index = originalArray.indexOf(item);
      if (index !== -1) {
        originalArray.splice(index, 1);
      }
    }
  }

  rejectedBlocklistedUrls = async (req) => {
    const errorMessage = `The request was rejected because the URL contained a potentially malicious string: ${req.url}`;
    const error = new RequestRejectedError(errorMessage);

    for (const forbidden of this.encodedUrlBlocklist) {
      if (IPS.valueContains(req.url, forbidden) && !['/ips-log',"/update-config",'/getIPSConfig'].include(req.url)) {
        throw error;
      }
    }

    for (const forbidden of this.decodedUrlBlocklist) {
      if (IPS.valueContains(decodeURIComponent(req.url), forbidden)) {
        throw error;
      }
    }
  };

  rejectedUntrustedHosts = async (req) => {
    const serverName = req.hostname;
    if (
      serverName !== undefined &&
      serverName !== null &&
      !this.#ALLOWED_HOST_NAMES.test(serverName)
    ) {
      throw new RequestRejectedError(
        `The request was rejected because the domain ${serverName} is untrusted.`
      );
    }
  };

  rejectForbiddenHttpMethod = async (req) => {
    if (this.#ALLOWED_HTTP_METHODS === this.#ALLOW_ANY_HTTP_METHOD) {
      return;
    }

    const method = req.method.toUpperCase();
    if (this.#ALLOWED_HTTP_METHODS.indexOf(method) === -1) {
      throw new RequestRejectedError(
        `The request was rejected because the HTTP method ${method} was not included within the list of allowed HTTP methods: ${this.#ALLOWED_HTTP_METHODS}`
      );
    }
  };

  reject = (req, res) => {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("FORBIDDEN");
  };

  createDefaultAllowedHttpMethods() {
    return ["DELETE", "GET", "HEAD", "PATCH", "POST", "PUT"];
  }
}

export default IPS;