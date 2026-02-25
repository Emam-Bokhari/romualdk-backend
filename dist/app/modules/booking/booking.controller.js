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
exports.BookingController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const booking_service_1 = require("./booking.service");
const createBooking = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id || req.user.id;
    const payload = req.body;
    console.log("Booking Payload:", payload);
    const result = yield booking_service_1.BookingService.createBooking(
      payload,
      userId,
    );
    (0, sendResponse_1.default)(res, {
      statusCode: 201,
      success: true,
      message: "Booking created successfully!",
      data: result,
    });
  }),
);
/* -------------------- User Bookings -------------------- */
const myBookings = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const status = req.query.status;
    const result = yield booking_service_1.BookingService.getUserBookings(
      userId,
      status,
    );
    (0, sendResponse_1.default)(res, {
      statusCode: 200,
      success: true,
      message: "User bookings retrieved successfully",
      data: result,
    });
  }),
);
/* -------------------- Host Bookings -------------------- */
const hostBookings = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const status = req.query.status;
    const result = yield booking_service_1.BookingService.getHostBookings(
      userId,
      status,
    );
    (0, sendResponse_1.default)(res, {
      statusCode: 200,
      success: true,
      message: "Host bookings retrieved successfully",
      data: result,
    });
  }),
);
/* -------------------- Check-in -------------------- */
const checkInController = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const bookingId = req.params.id;
    const result = yield booking_service_1.BookingService.checkIn(bookingId);
    (0, sendResponse_1.default)(res, {
      statusCode: 200,
      success: true,
      message: "Checked in successfully!",
      data: result,
    });
  }),
);
/* -------------------- Check-out -------------------- */
const checkOutController = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const bookingId = req.params.id;
    const result = yield booking_service_1.BookingService.checkOut(bookingId);
    (0, sendResponse_1.default)(res, {
      statusCode: 200,
      success: true,
      message: "Checked out successfully!",
      data: result,
    });
  }),
);
/* -------------------- Cancel Booking -------------------- */
const isCancelledController = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const bookingId = req.params.id;
    const result =
      yield booking_service_1.BookingService.isCancelled(bookingId);
    (0, sendResponse_1.default)(res, {
      statusCode: 200,
      success: true,
      message: "Booking cancelled & refund processed",
      data: { isCancelled: result },
    });
  }),
);
/* ============ Admin: Get All Bookings (Advanced) ============ */
const getAllBookingsController = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const result =
      yield booking_service_1.BookingService.getAllBookingsForAdmin(req.query);
    (0, sendResponse_1.default)(res, {
      statusCode: 200,
      success: true,
      message: "All bookings retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }),
);
/* ================= Booking By ID ==================== */
const getBookingByIdController = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const bookingId = req.params.id;
    const result =
      yield booking_service_1.BookingService.getBookingById(bookingId);
    (0, sendResponse_1.default)(res, {
      statusCode: 200,
      success: true,
      message: "Booking retrieved successfully",
      data: result,
    });
  }),
);
/* ============ Admin: Update Booking ============ */
const updateBookingByAdminController = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield booking_service_1.BookingService.updateBookingByAdmin(
      id,
      req.body,
    );
    (0, sendResponse_1.default)(res, {
      statusCode: 200,
      success: true,
      message: "Booking updated successfully",
      data: result,
    });
  }),
);
/* ============ Admin: Delete Booking ============ */
const deleteBookingByAdminController = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result =
      yield booking_service_1.BookingService.deleteBookingByAdmin(id);
    (0, sendResponse_1.default)(res, {
      statusCode: 200,
      success: true,
      message: "Booking deleted successfully",
      data: result,
    });
  }),
);
// ========== Get booking status stats for chart ==========
const getBookingStatusStatsController = (0, catchAsync_1.default)((req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    // year optional – string hisebe asbe query te
    const year = req.query.year ? Number(req.query.year) : undefined;
    // Optional validation
    if (year && (isNaN(year) || year < 2000 || year > 2100)) {
      return (0, sendResponse_1.default)(res, {
        statusCode: 400,
        success: false,
        message: "Invalid year provided",
      });
    }
    const result =
      yield booking_service_1.BookingService.getBookingStatusStats(year);
    (0, sendResponse_1.default)(res, {
      statusCode: 200,
      success: true,
      message: "Yearly booking status stats retrieved successfully",
      data: result,
    });
  }),
);
// -------- Export as object ----------
exports.BookingController = {
  createBooking,
  myBookings,
  hostBookings,
  checkInController,
  checkOutController,
  isCancelledController,
  getAllBookingsController,
  getBookingByIdController,
  updateBookingByAdminController,
  deleteBookingByAdminController,
  getBookingStatusStatsController,
};
