"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = require("mongoose");
const booking_interface_1 = require("./booking.interface");
const bookingSchema = new mongoose_1.Schema({
    bookingCode: { type: String, required: true, unique: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    hostId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    carId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Car", required: true },
    transactionId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Transaction" },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: Object.values(booking_interface_1.BOOKING_STATUS),
        default: booking_interface_1.BOOKING_STATUS.PENDING,
    },
    carStatus: { type: String, enum: Object.values(booking_interface_1.CAR_STATUS), default: booking_interface_1.CAR_STATUS.PENDING },
    type: { type: String, enum: Object.values(booking_interface_1.Driver_STATUS), required: false },
    checkIn: { type: Boolean, default: false },
    checkOut: { type: Boolean, default: false },
    isCancelled: { type: Boolean, default: false },
    payoutProcessed: { type: Boolean, default: false },
    payoutAt: { type: Date },
    cancelledAt: { type: Date },
    checkedOutAt: { type: Date },
}, { timestamps: true, versionKey: false });
// Indexes
bookingSchema.index({ userId: 1 });
bookingSchema.index({ hostId: 1 });
bookingSchema.index({ carId: 1 });
exports.Booking = (0, mongoose_1.model)("Booking", bookingSchema);
