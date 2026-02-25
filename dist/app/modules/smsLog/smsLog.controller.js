"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsCallback = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const smsLog_model_1 = require("./smsLog.model");
exports.smsCallback = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    // Logging for debugging
    console.log("SMS Callback Hit:", req.method, {
      query: req.query,
      body: req.body,
    });
    // Handle both GET and POST parameters
    const resourceId =
      ((_a = req.query.resourceId) === null || _a === void 0
        ? void 0
        : _a.toString()) ||
      ((_b = req.query.resource_id) === null || _b === void 0
        ? void 0
        : _b.toString()) ||
      req.body.resourceId ||
      req.body.resource_id;
    const code =
      ((_c = req.query.code) === null || _c === void 0
        ? void 0
        : _c.toString()) ||
      ((_d = req.query.status_code) === null || _d === void 0
        ? void 0
        : _d.toString()) ||
      req.body.code ||
      req.body.status_code;
    const message =
      ((_e = req.query.message) === null || _e === void 0
        ? void 0
        : _e.toString()) || req.body.message;
    if (!resourceId || !code) {
      console.warn("SMS Callback missing parameters:", { resourceId, code });
      return res.status(400).send("Invalid request parameters");
    }
    const sms = yield smsLog_model_1.SMSLog.findOne({ resourceId });
    if (!sms) {
      console.warn(
        `AfrikSMS callback received for unknown resourceId: ${resourceId}`,
      );
      return res.status(404).send("SMS log not found");
    }
    // Update SMS status
    if (code === "000") sms.status = "DELIVERED";
    else sms.status = "FAILED";
    sms.providerCode = code.toString();
    sms.providerMessage = message || sms.providerMessage;
    yield sms.save();
    console.log(`SMS log updated: ${sms._id} status -> ${sms.status}`);
    return res.send("OK");
  }),
);
