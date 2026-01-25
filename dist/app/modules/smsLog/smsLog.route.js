"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsLogRoutes = void 0;
const express_1 = __importDefault(require("express"));
const smsLog_controller_1 = require("./smsLog.controller");
const router = express_1.default.Router();
router.get("/afrik-sms/callback", smsLog_controller_1.smsCallback);
router.post("/afrik-sms/callback", smsLog_controller_1.smsCallback);
exports.SmsLogRoutes = router;
