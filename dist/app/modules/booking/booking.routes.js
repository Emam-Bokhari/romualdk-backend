"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRoutes = void 0;
const express_1 = require("express");
const booking_controller_1 = require("./booking.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const validateRequest_1 = __importDefault(
  require("../../middlewares/validateRequest"),
);
const booking_validation_1 = require("./booking.validation");
const router = (0, express_1.Router)();
router.get(
  "/status-stats",
  (0, auth_1.default)(
    user_1.USER_ROLES.ADMIN,
    user_1.USER_ROLES.SUPER_ADMIN,
    user_1.USER_ROLES.HOST,
  ),
  booking_controller_1.BookingController.getBookingStatusStatsController,
);
router.post(
  "/",
  (0, auth_1.default)(
    user_1.USER_ROLES.ADMIN,
    user_1.USER_ROLES.HOST,
    user_1.USER_ROLES.SUPER_ADMIN,
    user_1.USER_ROLES.USER,
  ),
  (0, validateRequest_1.default)(booking_validation_1.createBookingSchema),
  booking_controller_1.BookingController.createBooking,
);
router.get(
  "/my",
  (0, auth_1.default)(),
  booking_controller_1.BookingController.myBookings,
);
router.get(
  "/host",
  (0, auth_1.default)(),
  booking_controller_1.BookingController.hostBookings,
);
router.patch(
  "/check-in/:id",
  (0, auth_1.default)(
    user_1.USER_ROLES.ADMIN,
    user_1.USER_ROLES.HOST,
    user_1.USER_ROLES.SUPER_ADMIN,
    user_1.USER_ROLES.USER,
  ),
  booking_controller_1.BookingController.checkInController,
);
router.patch(
  "/check-out/:id",
  (0, auth_1.default)(
    user_1.USER_ROLES.ADMIN,
    user_1.USER_ROLES.HOST,
    user_1.USER_ROLES.SUPER_ADMIN,
    user_1.USER_ROLES.USER,
  ),
  booking_controller_1.BookingController.checkOutController,
);
router.patch(
  "/is-cancelled/:id",
  (0, auth_1.default)(
    user_1.USER_ROLES.ADMIN,
    user_1.USER_ROLES.HOST,
    user_1.USER_ROLES.SUPER_ADMIN,
    user_1.USER_ROLES.USER,
  ),
  booking_controller_1.BookingController.isCancelledController,
);
router.get(
  "/",
  (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN),
  booking_controller_1.BookingController.getAllBookingsController,
);
router.get(
  "/:id",
  (0, auth_1.default)(
    user_1.USER_ROLES.SUPER_ADMIN,
    user_1.USER_ROLES.ADMIN,
    user_1.USER_ROLES.HOST,
    user_1.USER_ROLES.USER,
  ),
  booking_controller_1.BookingController.getBookingByIdController,
);
router.patch(
  "/:id",
  (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN),
  booking_controller_1.BookingController.updateBookingByAdminController,
);
router.delete(
  "/:id",
  (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN),
  booking_controller_1.BookingController.deleteBookingByAdminController,
);
router.get(
  "/status-stats",
  (0, auth_1.default)(
    user_1.USER_ROLES.ADMIN,
    user_1.USER_ROLES.SUPER_ADMIN,
    user_1.USER_ROLES.HOST,
  ),
  booking_controller_1.BookingController.getBookingStatusStatsController,
);
exports.bookingRoutes = router;
