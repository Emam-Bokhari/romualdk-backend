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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinationServices = void 0;
const mongoose_1 = require("mongoose");
const destination_model_1 = require("./destination.model");
const createDestination = (payload) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const destination = yield destination_model_1.Destination.create(payload);
    if (!destination) {
      throw new Error("Failed to create destination");
    }
    return destination;
  });
const getDestinationsFromDB = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const result = yield destination_model_1.Destination.find();
    if (!result || result.length === 0) {
      return [];
    }
    return result;
  });
const updateDestinationById = (destinationId, payload) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(destinationId)) {
      throw new Error("Invalid destination ID");
    }
    const updatedDestination =
      yield destination_model_1.Destination.findByIdAndUpdate(
        destinationId,
        payload,
        {
          new: true,
          runValidators: true,
        },
      );
    if (!updatedDestination) {
      throw new Error("Destination not found");
    }
    return updatedDestination;
  });
const deleteDestinationById = (destinationId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(destinationId)) {
      throw new Error("Invalid destination ID");
    }
    const deletedDestination =
      yield destination_model_1.Destination.findByIdAndDelete(destinationId);
    if (!deletedDestination) {
      throw new Error("Destination not found");
    }
    return deletedDestination;
  });
exports.DestinationServices = {
  createDestination,
  getDestinationsFromDB,
  updateDestinationById,
  deleteDestinationById,
};
