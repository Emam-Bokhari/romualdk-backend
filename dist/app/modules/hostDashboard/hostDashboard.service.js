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
exports.HostDashboardService = void 0;
const mongoose_1 = require("mongoose");
const booking_model_1 = require("../booking/booking.model");
const car_model_1 = require("../car/car.model");
const user_model_1 = require("../user/user.model");
const transaction_model_1 = __importDefault(
  require("../payment/transaction.model"),
);
const getHostDashboardData = (hostId, year) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const objectHostId = new mongoose_1.Types.ObjectId(hostId);
    const currentDate = new Date();
    const currentMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year + 1, 0, 1);
    // Parallel execution for performance
    const [
      profile,
      totalEarnings,
      thisMonthEarnings,
      totalBookings,
      totalVehicles,
      activeVehicles,
      monthlyRevenue,
      recentPayouts,
      upcomingPayouts,
    ] = yield Promise.all([
      // 1. Profile (name + location)
      user_model_1.User.findById(objectHostId, {
        firstName: 1,
        lastName: 1,
        profileImage: 1,
        location: {
          "location.city": 1,
          "location.country": 1,
        },
        city: 1,
        country: 1,
      }).lean(),
      // 2. Total Earnings (all time succeeded hostReceiptAmount)
      transaction_model_1.default.aggregate([
        {
          $lookup: {
            from: "bookings",
            localField: "bookingId",
            foreignField: "_id",
            as: "booking",
          },
        },
        { $unwind: "$booking" },
        {
          $match: { "booking.hostId": objectHostId, payoutStatus: "succeeded" },
        },
        { $group: { _id: null, total: { $sum: "$hostReceiptAmount" } } },
      ]),
      // 3. This month earnings
      transaction_model_1.default.aggregate([
        {
          $lookup: {
            from: "bookings",
            localField: "bookingId",
            foreignField: "_id",
            as: "booking",
          },
        },
        { $unwind: "$booking" },
        {
          $match: {
            "booking.hostId": objectHostId,
            payoutStatus: "succeeded",
            createdAt: { $gte: currentMonthStart },
          },
        },
        { $group: { _id: null, total: { $sum: "$hostReceiptAmount" } } },
      ]),
      // 4. Total bookings for host's cars
      booking_model_1.Booking.countDocuments({ hostId: objectHostId }),
      // 5. Total vehicles owned by host
      car_model_1.Car.countDocuments({ userId: objectHostId }),
      // 6. Active vehicles
      car_model_1.Car.countDocuments({ userId: objectHostId, isActive: true }),
      // 7. Monthly revenue for bar chart
      transaction_model_1.default.aggregate([
        {
          $lookup: {
            from: "bookings",
            localField: "bookingId",
            foreignField: "_id",
            as: "booking",
          },
        },
        { $unwind: "$booking" },
        {
          $match: {
            "booking.hostId": objectHostId,
            payoutStatus: "succeeded",
            createdAt: { $gte: yearStart, $lt: yearEnd },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            earnings: { $sum: "$hostReceiptAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // 8. Recent Payouts (completed)
      getPayouts(objectHostId, "succeeded"),
      // 9. Upcoming Payouts (pending)
      getPayouts(objectHostId, "pending"),
    ]);
    // Fill 12 months with 0 if no data
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const revenueStatistics = months.map((month, index) => {
      const found = monthlyRevenue.find((m) => m._id === index + 1);
      return {
        month,
        earnings:
          (found === null || found === void 0 ? void 0 : found.earnings) || 0,
      };
    });
    console.log(profile);
    return {
      profile: {
        name: profile
          ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
            "Unknown"
          : "Unknown",
        location:
          (profile === null || profile === void 0 ? void 0 : profile.city) &&
          (profile === null || profile === void 0 ? void 0 : profile.country)
            ? `${profile.city}, ${profile.country}`
            : "Unknown",
        profileImage:
          (profile === null || profile === void 0
            ? void 0
            : profile.profileImage) || null,
      },
      summary: {
        totalEarnings:
          ((_a = totalEarnings[0]) === null || _a === void 0
            ? void 0
            : _a.total) || 0,
        earningsThisMonth:
          ((_b = thisMonthEarnings[0]) === null || _b === void 0
            ? void 0
            : _b.total) || 0,
        totalBookings,
        totalVehicles,
        activeVehicles,
      },
      revenueStatistics,
      recentPayouts,
      upcomingPayouts,
    };
  });
// Helper: Recent & Upcoming Payouts
const getPayouts = (hostId, payoutStatus) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield transaction_model_1.default.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "bookingId",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      { $match: { "booking.hostId": hostId, payoutStatus } },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "booking.userId",
          foreignField: "_id",
          as: "renter",
        },
      },
      { $unwind: "$renter" },
      {
        $lookup: {
          from: "cars",
          localField: "booking.carId",
          foreignField: "_id",
          as: "car",
        },
      },
      { $unwind: "$car" },
      {
        $project: {
          renterName: "$renter.name",
          car: "$car.model",
          amount: "$hostReceiptAmount",
          date: { $dateToString: { format: "%b %d, %Y", date: "$createdAt" } },
          status: payoutStatus === "succeeded" ? "completed" : "pending",
        },
      },
    ]);
  });
exports.HostDashboardService = {
  getHostDashboardData,
};
