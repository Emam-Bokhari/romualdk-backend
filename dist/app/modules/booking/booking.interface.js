"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CAR_STATUS = exports.Driver_STATUS = exports.BOOKING_STATUS = void 0;
var BOOKING_STATUS;
(function (BOOKING_STATUS) {
  BOOKING_STATUS["PENDING"] = "pending";
  BOOKING_STATUS["PAID"] = "paid";
  BOOKING_STATUS["ONGOING"] = "ongoing";
  BOOKING_STATUS["COMPLETED"] = "completed";
  BOOKING_STATUS["CANCELLED"] = "cancelled";
})(BOOKING_STATUS || (exports.BOOKING_STATUS = BOOKING_STATUS = {}));
var Driver_STATUS;
(function (Driver_STATUS) {
  Driver_STATUS["WITHDRIVER"] = "withDriver";
  Driver_STATUS["WITHOUTDRIVER"] = "withoutDriver";
})(Driver_STATUS || (exports.Driver_STATUS = Driver_STATUS = {}));
var CAR_STATUS;
(function (CAR_STATUS) {
  CAR_STATUS["UPCOMING"] = "upcoming";
  CAR_STATUS["ONGOING"] = "ongoing";
  CAR_STATUS["COMPLETED"] = "completed";
  CAR_STATUS["CANCELLED"] = "cancelled";
  CAR_STATUS["PENDING"] = "pending";
})(CAR_STATUS || (exports.CAR_STATUS = CAR_STATUS = {}));
