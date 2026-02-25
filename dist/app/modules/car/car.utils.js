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
exports.getTargetLocation =
  exports.normalizeCarVerificationStatus =
  exports.getCarCalendar =
  exports.checkCarAvailabilityByDate =
  exports.getCarTripCountMap =
  exports.getCarTripCount =
    void 0;
const mongoose_1 = require("mongoose");
const booking_model_1 = require("../booking/booking.model");
const booking_interface_1 = require("../booking/booking.interface");
const car_service_1 = require("./car.service");
const car_interface_1 = require("./car.interface");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const user_model_1 = require("../user/user.model");
const getCarTripCount = (carId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const count = yield booking_model_1.Booking.countDocuments({
      carId: new mongoose_1.Types.ObjectId(carId),
      carStatus: booking_interface_1.CAR_STATUS.COMPLETED,
      isCancelled: { $ne: true },
    });
    return count;
  });
exports.getCarTripCount = getCarTripCount;
// bulk car trip
const getCarTripCountMap = (carIds) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const result = yield booking_model_1.Booking.aggregate([
      {
        $match: {
          carId: { $in: carIds },
          carStatus: booking_interface_1.CAR_STATUS.COMPLETED,
          isCancelled: { $ne: true },
        },
      },
      {
        $group: {
          _id: "$carId",
          count: { $sum: 1 },
        },
      },
    ]);
    const map = {};
    for (const item of result) {
      map[item._id.toString()] = item.count;
    }
    return map;
  });
exports.getCarTripCountMap = getCarTripCountMap;
// car.utils.ts
const checkCarAvailabilityByDate = (car, targetDate) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!car.isActive) return false;
    const dayName = targetDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();
    if (
      ((_a = car.availableDays) === null || _a === void 0
        ? void 0
        : _a.length) &&
      !car.availableDays.includes(dayName)
    ) {
      return false;
    }
    const dateString = targetDate.toISOString().split("T")[0];
    const isBlocked =
      (_b = car.blockedDates) === null || _b === void 0
        ? void 0
        : _b.some(
            (b) => new Date(b.date).toISOString().split("T")[0] === dateString,
          );
    if (isBlocked) return false;
    const bookingConflict = yield booking_model_1.Booking.findOne({
      carId: car._id,
      status: { $in: ["PAID", "ONGOING"] },
      fromDate: { $lte: targetDate },
      toDate: { $gte: targetDate },
    });
    return !bookingConflict;
  });
exports.checkCarAvailabilityByDate = checkCarAvailabilityByDate;
const getCarCalendar = (carId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const calendar = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateString = targetDate.toISOString().split("T")[0];
      // if any slot is available for that date
      const availability = yield car_service_1.CarServices.getAvailability(
        carId,
        dateString,
      );
      // if at least `1` slot is available
      const isAnySlotAvailable = availability.slots.some(
        (slot) => slot.isAvailable === true,
      );
      calendar.push({
        date: dateString,
        available: isAnySlotAvailable,
        reason:
          availability.blockedReason ||
          (isAnySlotAvailable ? "" : "Fully Booked"),
      });
    }
    return calendar;
  });
exports.getCarCalendar = getCarCalendar;
const normalizeCarVerificationStatus = (status) => {
  if (!status) return undefined;
  const normalized = status.toUpperCase();
  if (
    !Object.values(car_interface_1.CAR_VERIFICATION_STATUS).includes(normalized)
  ) {
    throw new ApiErrors_1.default(
      400,
      `Invalid car verification status: ${status}`,
    );
  }
  return normalized;
};
exports.normalizeCarVerificationStatus = normalizeCarVerificationStatus;
const getTargetLocation = (queryLat, queryLng, userId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let lat = queryLat ? Number(queryLat) : null;
    let lng = queryLng ? Number(queryLng) : null;
    if ((!lat || !lng) && userId) {
      const user = yield user_model_1.User.findById(userId).select("location");
      if (
        (_a = user === null || user === void 0 ? void 0 : user.location) ===
          null || _a === void 0
          ? void 0
          : _a.coordinates
      ) {
        lng = user.location.coordinates[0];
        lat = user.location.coordinates[1];
      }
    }
    // default dhaka
    if (!lat || !lng) {
      lng = 90.4125;
      lat = 21.8103;
    }
    return { lat, lng };
  });
exports.getTargetLocation = getTargetLocation;
