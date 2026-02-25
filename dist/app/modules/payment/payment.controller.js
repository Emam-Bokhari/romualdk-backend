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
exports.PaymentController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const payment_service_1 = require("./payment.service");
const initiatePayment = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const result =
      yield payment_service_1.PaymentService.createCheckoutSession(payload);
    (0, sendResponse_1.default)(res, {
      statusCode: 200,
      success: true,
      message: "Payment session initiated successfully!",
      data: result,
    });
  }),
);
const stripeWebhook = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return res.status(400).send("Missing stripe-signature");
    }
    const result = yield payment_service_1.PaymentService.handleWebhook(
      req.body,
      sig,
    );
    (0, sendResponse_1.default)(res, {
      statusCode: 200,
      success: true,
      message: "Webhook received",
      data: { received: true, success: result },
    });
  }),
);
const success = (0, catchAsync_1.default)((_req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    res.redirect("myapp://payment-success");
  }),
);
const cancel = (0, catchAsync_1.default)((_req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    res.redirect("myapp://payment-failed");
  }),
);
const payoutToHostController = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    const result =
      yield payment_service_1.PaymentService.payoutToHost(bookingId);
    (0, sendResponse_1.default)(res, {
      statusCode: 200,
      success: true,
      message: "Host payout completed successfully",
      data: result,
    });
  }),
);
// -------- Export as object ----------
exports.PaymentController = {
  initiatePayment,
  stripeWebhook,
  success,
  cancel,
  payoutToHostController,
};
