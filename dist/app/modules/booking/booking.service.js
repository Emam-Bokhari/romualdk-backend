"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
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
exports.BookingService = void 0;
const booking_model_1 = require("./booking.model");
const car_model_1 = require("../car/car.model");
const booking_interface_1 = require("./booking.interface");
const bookingCalculation_1 = require("../../../util/bookingCalculation");
const car_utils_1 = require("../car/car.utils");
const mongoose_1 = __importStar(require("mongoose"));
const review_service_1 = require("../review/review.service");
const review_interface_1 = require("../review/review.interface");
const transaction_model_1 = __importDefault(
  require("../payment/transaction.model"),
);
const refundCalculation_1 = require("../../../util/refundCalculation");
const payment_service_1 = require("../payment/payment.service");
const queryBuilder_1 = __importDefault(require("../../builder/queryBuilder"));
const bookigIdGenarator_1 = require("../../../util/bookigIdGenarator");
// -------- Create Booking ----------
const createBooking = (body, userId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const DRIVER_FIXED_PRICE = 500;
    const { carId, fromDate, toDate, type } = body;
    const car = yield car_model_1.Car.findById(carId)
      .select("dailyPrice hourlyPrice userId")
      .lean();
    if (!car) throw new Error("Car not found");
    const { billableDays } = (0, bookingCalculation_1.calculatePrice)(
      fromDate,
      toDate,
    );
    let totalAmount = billableDays * car.dailyPrice;
    if (type === booking_interface_1.Driver_STATUS.WITHDRIVER) {
      totalAmount += DRIVER_FIXED_PRICE;
    }
    const code = yield (0, bookigIdGenarator_1.getNextBookingCode)();
    const booking = yield booking_model_1.Booking.create({
      bookingCode: code,
      carId,
      userId,
      hostId: car.userId,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      totalAmount,
      status: booking_interface_1.BOOKING_STATUS.PENDING,
      type: type || booking_interface_1.Driver_STATUS.WITHOUTDRIVER,
    });
    return booking;
  });
/*
1. ai agent build korte hobe, arpor nijer eccomerce business run korte hobe
2. ai agent build korte hobe, page a integrate korte hobe, abong ai agent sell korte hobe
*/
// -------- Get user bookings ----------
// const getUserBookings = async (userId: string, status?: string) => {
//   const filter: any = { userId };
//   if (status) filter.carStatus = status;
//   return Booking.find(filter)
//     .populate("carId")
//     .populate("hostId")
//     .populate("transactionId")
//     .sort({ createdAt: -1 });
// };
// =======================MOSHFIQUR RAHMAN====================
const getUserBookings = (userId, status) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { userId };
    if (status) filter.carStatus = status;
    // ---------- STEP 1: Fetch bookings ----------
    const bookings = yield booking_model_1.Booking.find(filter)
      .populate("userId")
      .populate("carId")
      .populate("hostId")
      .populate("transactionId")
      .sort({ createdAt: -1 })
      .lean();
    if (!bookings.length) return bookings;
    // ---------- STEP 2: Extract carIds ----------
    const carIds = bookings
      .map((booking) => {
        var _a;
        return (_a = booking.carId) === null || _a === void 0 ? void 0 : _a._id;
      })
      .filter(Boolean)
      .map((id) => new mongoose_1.Types.ObjectId(id));
    // ---------- STEP 3: Trip count ----------
    const tripCountMap = yield (0, car_utils_1.getCarTripCountMap)(carIds);
    // ---------- STEP 4: Attach trips + rating ----------
    const finalBookings = yield Promise.all(
      bookings.map((booking) =>
        __awaiter(void 0, void 0, void 0, function* () {
          var _a, _b;
          const carId =
            (_b =
              (_a = booking.carId) === null || _a === void 0
                ? void 0
                : _a._id) === null || _b === void 0
              ? void 0
              : _b.toString();
          const reviewSummary =
            yield review_service_1.ReviewServices.getReviewSummaryFromDB(
              carId,
              review_interface_1.REVIEW_TYPE.CAR,
            );
          return Object.assign(Object.assign({}, booking), {
            carId: Object.assign(Object.assign({}, booking.carId), {
              trips: tripCountMap[carId] || 0,
              averageRating: reviewSummary.averageRating,
              totalReviews: reviewSummary.totalReviews,
              starCounts: reviewSummary.starCounts,
              reviews: reviewSummary.reviews,
            }),
          });
        }),
      ),
    );
    return finalBookings;
  });
// =======================MOSHFIQUR RAHMAN====================
// -------- Get host bookings ----------
// const getHostBookings = async (hostId: string, status?: string) => {
//   const filter: any = { hostId };
//   if (status) filter.carStatus = status;
//   return Booking.find(filter)
//     .populate("carId")
//     .populate("userId")
//     .populate("transactionId")
//     .sort({ createdAt: -1 });
// };
// =======================MOSHFIQUR RAHMAN====================
const getHostBookings = (hostId, status) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const filter = { hostId };
    if (status) filter.carStatus = status;
    // ---------- STEP 1: Fetch bookings ----------
    const bookings = yield booking_model_1.Booking.find(filter)
      .populate("carId")
      .populate("userId")
      .populate("transactionId")
      .sort({ createdAt: -1 })
      .lean();
    if (!bookings.length) return bookings;
    // ---------- STEP 2: Extract carIds ----------
    const carIds = bookings
      .map((booking) => {
        var _a;
        return (_a = booking.carId) === null || _a === void 0 ? void 0 : _a._id;
      })
      .filter(Boolean)
      .map((id) => new mongoose_1.Types.ObjectId(id));
    // ---------- STEP 3: Trip count ----------
    const tripCountMap = yield (0, car_utils_1.getCarTripCountMap)(carIds);
    // ---------- STEP 4: Attach trips + rating ----------
    const finalBookings = yield Promise.all(
      bookings.map((booking) =>
        __awaiter(void 0, void 0, void 0, function* () {
          var _a, _b;
          const carId =
            (_b =
              (_a = booking.carId) === null || _a === void 0
                ? void 0
                : _a._id) === null || _b === void 0
              ? void 0
              : _b.toString();
          const reviewSummary =
            yield review_service_1.ReviewServices.getReviewSummaryFromDB(
              carId,
              review_interface_1.REVIEW_TYPE.CAR,
            );
          return Object.assign(Object.assign({}, booking), {
            carId: Object.assign(Object.assign({}, booking.carId), {
              trips: tripCountMap[carId] || 0,
              averageRating: reviewSummary.averageRating,
              totalReviews: reviewSummary.totalReviews,
              starCounts: reviewSummary.starCounts,
              reviews: reviewSummary.reviews,
            }),
          });
        }),
      ),
    );
    return finalBookings;
  });
// =======================MOSHFIQUR RAHMAN====================
const checkIn = (bookingId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_model_1.Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.status !== booking_interface_1.BOOKING_STATUS.PAID)
      throw new Error("Payment required");
    if (booking.checkIn) throw new Error("Already checked in");
    booking.checkIn = true;
    if (
      booking.status === booking_interface_1.BOOKING_STATUS.PAID &&
      booking.checkIn &&
      !booking.checkOut
    ) {
      booking.carStatus = booking_interface_1.CAR_STATUS.ONGOING;
    }
    return booking.save();
  });
const checkOut = (bookingId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_model_1.Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");
    if (!booking.checkIn) throw new Error("Cannot check-out before check-in");
    if (booking.checkOut) throw new Error("Already checked out");
    booking.checkOut = true;
    if (
      booking.status === booking_interface_1.BOOKING_STATUS.PAID &&
      booking.checkIn &&
      booking.checkOut
    ) {
      booking.carStatus = booking_interface_1.CAR_STATUS.COMPLETED;
    }
    booking.checkedOutAt = new Date();
    return booking.save();
  });
// const isCancelled = async (bookingId: string) => {
//   const booking = await Booking.findById(bookingId);
//   if (!booking) throw new Error("Booking not found");
//   if (booking.isCancelled)
//     throw new Error("Booking already cancelled");
//   if (booking.checkIn)
//     throw new Error("Cannot cancel after check-in");
//   // ---------- PAID BOOKING → REFUND ----------
//   if (booking.status === BOOKING_STATUS.PAID) {
//     if (booking.payoutProcessed)
//       throw new Error("Refund not allowed after host payout");
//     const transaction = await Transaction.findById(booking.transactionId);
//     if (!transaction)
//       throw new Error("Transaction not found");
//     const refundPercentage = calculateRefundPercentage(booking.fromDate);
//     if (refundPercentage === 0)
//       throw new Error("Refund not applicable");
//     await PaymentService.refundBookingPayment(
//       booking,
//       transaction,
//       refundPercentage
//     );
//   }
//   // ---------- CANCEL BOOKING (ONLY ONCE) ----------
//   booking.isCancelled = true;
//   booking.status = BOOKING_STATUS.CANCELLED;
//   booking.carStatus = CAR_STATUS.CANCELLED;
//   await booking.save();
//   return booking;
// };
const isCancelled = (bookingId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
      const booking =
        yield booking_model_1.Booking.findById(bookingId).session(session);
      if (!booking) throw new Error("Booking not found");
      if (booking.isCancelled) throw new Error("Booking already cancelled");
      if (booking.checkIn) throw new Error("Cannot cancel after check-in");
      if (booking.status === booking_interface_1.BOOKING_STATUS.PAID) {
        if (booking.payoutProcessed)
          throw new Error("Refund not allowed after host payout");
        const transaction = yield transaction_model_1.default
          .findById(booking.transactionId)
          .session(session);
        if (!transaction) throw new Error("Transaction not found");
        const refundPercentage = (0,
        refundCalculation_1.calculateRefundPercentage)(booking.fromDate);
        if (refundPercentage === 0) throw new Error("Refund not applicable");
        // Stripe call
        yield payment_service_1.PaymentService.refundBookingPayment(
          booking,
          transaction,
          refundPercentage,
          session,
        );
      }
      booking.isCancelled = true;
      booking.status = booking_interface_1.BOOKING_STATUS.CANCELLED;
      booking.carStatus = booking_interface_1.CAR_STATUS.CANCELLED;
      booking.cancelledAt = new Date();
      yield booking.save({ session });
      yield session.commitTransaction();
      session.endSession();
      return booking;
    } catch (error) {
      yield session.abortTransaction();
      session.endSession();
      throw error;
    }
  });
//  ==========Admin: Get all bookings ==========
const getAllBookingsForAdmin = (query) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const baseQuery = booking_model_1.Booking.find()
      .populate("carId")
      .populate("userId")
      .populate("hostId")
      .populate("transactionId");
    const qb = new queryBuilder_1.default(baseQuery, query);
    qb
      // 🔍 ONLY string / enum fields
      .search(["status", "carStatus", "type"])
      //exact filters
      .filter()
      .sort()
      .paginate()
      .fields();
    const data = yield qb.modelQuery;
    const meta = yield qb.countTotal();
    return { data, meta };
  });
// ============Get booking by ID ============
const getBookingById = (bookingId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_model_1.Booking.findById(bookingId)
      .populate("carId")
      .populate("userId")
      .populate("hostId")
      .populate("transactionId");
    if (!booking) throw new Error("Booking not found");
    return booking;
  });
// ===========Update booking by ID ===========
const updateBookingByAdmin = (bookingId, payload) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(bookingId))
      throw new Error("Invalid booking id");
    const booking = yield booking_model_1.Booking.findByIdAndUpdate(
      bookingId,
      payload,
      {
        new: true,
      },
    )
      .populate("carId")
      .populate("userId")
      .populate("hostId")
      .populate("transactionId");
    if (!booking) throw new Error("Booking not found");
    return booking;
  });
// ==========Delete booking by ID ===========
const deleteBookingByAdmin = (bookingId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(bookingId))
      throw new Error("Invalid booking id");
    const booking = yield booking_model_1.Booking.findByIdAndDelete(bookingId);
    if (!booking) throw new Error("Booking not found");
    return booking;
  });
// ========== Get booking status stats for chart ==========
const getBookingStatusStats = (year) =>
  __awaiter(void 0, void 0, void 0, function* () {
    // Default to current year if not provided
    const targetYear =
      year !== null && year !== void 0 ? year : new Date().getFullYear();
    const start = new Date(targetYear, 0, 1); // January 1, targetYear
    const end = new Date(targetYear + 1, 0, 1); // January 1, next year
    const stats = yield booking_model_1.Booking.aggregate([
      {
        $addFields: {
          analyticsDate: {
            $switch: {
              branches: [
                // Cancelled → cancelledAt
                {
                  case: {
                    $eq: [
                      "$carStatus",
                      booking_interface_1.CAR_STATUS.CANCELLED,
                    ],
                  },
                  then: "$cancelledAt",
                },
                // Completed → checkOut / toDate
                {
                  case: {
                    $eq: [
                      "$carStatus",
                      booking_interface_1.CAR_STATUS.COMPLETED,
                    ],
                  },
                  then: "$checkedOutAt",
                },
                // Upcoming / Active → fromDate
                {
                  case: {
                    $in: [
                      "$carStatus",
                      [
                        booking_interface_1.CAR_STATUS.UPCOMING,
                        booking_interface_1.CAR_STATUS.ONGOING,
                      ],
                    ],
                  },
                  then: "$fromDate",
                },
              ],
              default: "$fromDate",
            },
          },
        },
      },
      // Now filter by correct analytics date
      {
        $match: {
          analyticsDate: { $gte: start, $lt: end },
        },
      },
      {
        $addFields: {
          chartStatus: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$carStatus",
                      booking_interface_1.CAR_STATUS.COMPLETED,
                    ],
                  },
                  then: "Completed",
                },
                {
                  case: {
                    $eq: ["$carStatus", booking_interface_1.CAR_STATUS.ONGOING],
                  },
                  then: "Active",
                },
                {
                  case: {
                    $eq: [
                      "$carStatus",
                      booking_interface_1.CAR_STATUS.CANCELLED,
                    ],
                  },
                  then: "Cancelled",
                },
                {
                  case: {
                    $and: [
                      {
                        $eq: [
                          "$status",
                          booking_interface_1.BOOKING_STATUS.PAID,
                        ],
                      },
                      { $eq: ["$checkIn", false] },
                    ],
                  },
                  then: "Upcoming",
                },
              ],
              default: "Other",
            },
          },
        },
      },
      {
        $group: {
          _id: "$chartStatus",
          count: { $sum: 1 },
        },
      },
    ]);
    const total = stats.reduce((sum, item) => sum + item.count, 0) || 1; // avoid divide by zero
    const result = {};
    stats.forEach((item) => {
      if (item._id !== "Other") {
        const percentage = Math.round((item.count / total) * 100);
        result[item._id] = percentage + "%";
      }
    });
    // Always return all 4 categories (even if 0%)
    const categories = ["Completed", "Upcoming", "Active", "Cancelled"];
    categories.forEach((cat) => {
      if (!result[cat]) result[cat] = "0%";
    });
    return {
      year: targetYear,
      stats: result,
    };
  });
// -------- Export as object ----------
exports.BookingService = {
  createBooking,
  getUserBookings,
  getHostBookings,
  checkIn,
  checkOut,
  isCancelled,
  getAllBookingsForAdmin,
  getBookingById,
  updateBookingByAdmin,
  deleteBookingByAdmin,
  getBookingStatusStats,
};
