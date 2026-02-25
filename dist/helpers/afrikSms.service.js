"use strict";
// import axios from "axios";
// import config from "../config";
// import ApiError from "../errors/ApiErrors";
// import { StatusCodes } from "http-status-codes";
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
exports.afrikSmsService = void 0;
// class AfrikSmsService {
// //  AfrikSMS API URL
//   private baseUrl: string = "https://api.afriksms.com/api/web/web_v1/outbounds/send";
//   private formatPhoneNumber(phone: string, countryCode: string): string {
//     // phone number replace and format
//     let cleanCode = countryCode.replace(/\+/g, "").replace(/^00/, "");
//     let cleanPhone = phone.trim().replace(/\s+/g, "");
//     if (cleanPhone.startsWith("0")) {
//       cleanPhone = cleanPhone.substring(1);
//     }
//     // if phone number already starts with country code, return as is
//     if (cleanPhone.startsWith(cleanCode)) {
//       return cleanPhone;
//     }
//     return `${cleanCode}${cleanPhone}`;
//   }
//   public generateOTP(): number {
//     return Math.floor(100000 + Math.random() * 900000);
//   }
//   async sendSMS(phoneNumber: string, countryCode: string, message: string): Promise<any> {
//     try {
//       const mobileNumbers = this.formatPhoneNumber(phoneNumber, countryCode);
//       // Logging for Debugging
//       console.log("Constructing AfrikSMS Request...");
//       const params = {
//         ClientId: config.afrikSms.clientId,
//         ApiKey: config.afrikSms.apiKey,
//         SenderId: config.afrikSms.senderId || "AFRIKSMS",
//         notifyURL: config.afrikSms.callbackUrl, // ← callback URL
//         TypeNotification: 2, // GET method
//         Message: message,
//         MobileNumbers: mobileNumbers,
//       };
//       const response = await axios.get(this.baseUrl, {
//         params,
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         }
//       });
//       console.log("AfrikSMS Response:", response.data);
//       if (response.data.code === 100) {
//         return response.data;
//       } else {
//         throw new Error(response.data.message || "Failed to send SMS");
//       }
//     } catch (error: any) {
//       if (error.response) {
//         console.error("AfrikSMS Error Detail:", {
//           status: error.response.status,
//           data: error.response.data,
//           fullUrl: error.config.url,
//           params: error.config.params
//         });
//       }
//       throw new ApiError(
//         StatusCodes.EXPECTATION_FAILED,
//         `SMS failed: ${error.message}`
//       );
//     }
//   }
// }
// export const afrikSmsService = new AfrikSmsService();
const axios_1 = __importDefault(require("axios"));
const ApiErrors_1 = __importDefault(require("../errors/ApiErrors"));
const http_status_codes_1 = require("http-status-codes");
const config_1 = __importDefault(require("../config"));
class AfrikSmsService {
  constructor() {
    this.baseUrl = "https://api.afriksms.com/api/web/web_v1/outbounds/send";
  }
  formatPhoneNumber(phone, countryCode) {
    let cleanCode = countryCode.replace(/\+/g, "").replace(/^00/, "");
    let cleanPhone = phone.trim().replace(/\s+/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = cleanPhone.substring(1);
    if (cleanPhone.startsWith(cleanCode)) return cleanPhone;
    return `${cleanCode}${cleanPhone}`;
  }
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
  }
  // Single SMS GET
  sendSMS(phoneNumber, countryCode, message, userId) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const mobileNumbers = this.formatPhoneNumber(phoneNumber, countryCode);
        const params = {
          ClientId: config_1.default.afrikSms.clientId,
          ApiKey: config_1.default.afrikSms.apiKey,
          SenderId: config_1.default.afrikSms.senderId,
          notifyURL: config_1.default.afrikSms.callbackUrl,
          TypeNotification: 2,
          Message: message,
          MobileNumbers: mobileNumbers,
        };
        const response = yield axios_1.default.get(this.baseUrl, {
          params,
          headers: { Accept: "application/json" },
        });
        console.log("Sending SMS to:", mobileNumbers, "Message:", message);
        console.log("AfrikSMS response:", response.data);
        if (response.data.code === 100) {
          return {
            userId,
            phone: phoneNumber,
            countryCode,
            message,
            resourceId: response.data.resourceId,
            status: "PENDING",
            providerCode: response.data.code.toString(),
            providerMessage: response.data.message,
          };
        } else {
          throw new Error(response.data.message || "Failed to send SMS");
        }
      } catch (error) {
        throw new ApiErrors_1.default(
          http_status_codes_1.StatusCodes.EXPECTATION_FAILED,
          `SMS failed: ${error.message}`,
        );
      }
    });
  }
}
exports.afrikSmsService = new AfrikSmsService();
