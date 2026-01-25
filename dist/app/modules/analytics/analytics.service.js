"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsServices = void 0;
const user_1 = require("../../../enums/user");
const car_interface_1 = require("../car/car.interface");
const car_model_1 = require("../car/car.model");
const user_model_1 = require("../user/user.model");
const booking_model_1 = require("../booking/booking.model");
const transaction_model_1 = __importDefault(require("../payment/transaction.model"));
const statCountsFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const [users, cars, bookings, revenue] = yield Promise.all([
        user_model_1.User.countDocuments({
            verified: true,
            status: user_1.STATUS.ACTIVE,
            role: { $in: [user_1.USER_ROLES.HOST, user_1.USER_ROLES.USER] },
        }),
        car_model_1.Car.countDocuments({
            verificationStatus: car_interface_1.CAR_VERIFICATION_STATUS.APPROVED,
        }),
        booking_model_1.Booking.countDocuments({
            status: "paid",
            carStatus: "completed"
        }),
        transaction_model_1.default.aggregate([
            {
                $match: {
                    status: "succeeded", // optional but recommended
                },
            },
            {
                $group: {
                    _id: null,
                    totalCommission: { $sum: "$commissionAmount" },
                },
            },
        ]),
    ]);
    return {
        users,
        cars,
        bookings,
        revenue: revenue[0].totalCommission || 0
    };
});
const getGuestHostYearlyChart = (year) => __awaiter(void 0, void 0, void 0, function* () {
    const currentYear = new Date().getUTCFullYear();
    const targetYear = year || currentYear;
    const startDate = new Date(Date.UTC(targetYear, 0, 1));
    const endDate = new Date(Date.UTC(targetYear + 1, 0, 1));
    const pipeline = [
        {
            $match: {
                createdAt: { $gte: startDate, $lt: endDate },
                $or: [
                    {
                        role: user_1.USER_ROLES.USER,
                        hostStatus: user_1.HOST_STATUS.NONE,
                    },
                    {
                        hostStatus: user_1.HOST_STATUS.APPROVED,
                    },
                ],
            },
        },
        {
            $group: {
                _id: {
                    month: { $month: "$createdAt" },
                    role: "$role",
                },
                total: { $sum: 1 },
            },
        },
        {
            $group: {
                _id: "$_id.month",
                data: {
                    $push: {
                        role: "$_id.role",
                        total: "$total",
                    },
                },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ];
    const raw = yield user_model_1.User.aggregate(pipeline);
    const chart = Array.from({ length: 12 }).map((_, i) => {
        var _a, _b, _c, _d;
        const month = i + 1;
        const row = raw.find((r) => r._id === month);
        return {
            month,
            guest: ((_b = (_a = row === null || row === void 0 ? void 0 : row.data) === null || _a === void 0 ? void 0 : _a.find((d) => d.role === user_1.USER_ROLES.USER)) === null || _b === void 0 ? void 0 : _b.total) || 0,
            host: ((_d = (_c = row === null || row === void 0 ? void 0 : row.data) === null || _c === void 0 ? void 0 : _c.find((d) => d.role === user_1.USER_ROLES.HOST)) === null || _d === void 0 ? void 0 : _d.total) || 0,
        };
    });
    return {
        year: targetYear,
        chart,
    };
});
exports.AnalyticsServices = {
    statCountsFromDB,
    getGuestHostYearlyChart,
};
