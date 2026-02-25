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
exports.DestinationControllers = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const destination_service_1 = require("./destination.service");
const createDestination = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result =
      yield destination_service_1.DestinationServices.createDestination(data);
    (0, sendResponse_1.default)(res, {
      success: true,
      statusCode: 200,
      message: "Destination created successfully",
      data: result,
    });
  }),
);
const getDestinations = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const result =
      yield destination_service_1.DestinationServices.getDestinationsFromDB();
    (0, sendResponse_1.default)(res, {
      success: true,
      statusCode: 200,
      message: "Destinations fetched successfully",
      data: result,
    });
  }),
);
exports.DestinationControllers = {
  createDestination,
  getDestinations,
};
