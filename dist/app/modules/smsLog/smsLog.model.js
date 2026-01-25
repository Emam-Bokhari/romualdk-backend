"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSLog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const smsLogSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    phone: { type: String, required: true },
    countryCode: { type: String, required: true },
    message: { type: String, required: true },
    resourceId: { type: String },
    status: { type: String, enum: ["PENDING", "DELIVERED", "FAILED"], default: "PENDING" },
    providerCode: { type: String },
    providerMessage: { type: String },
}, { timestamps: true });
exports.SMSLog = mongoose_1.default.model("SMSLog", smsLogSchema);
