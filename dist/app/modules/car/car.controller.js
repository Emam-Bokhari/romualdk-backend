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
exports.CarControllers = void 0;
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const car_service_1 = require("./car.service");
const car_utils_1 = require("./car.utils");
const createCar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const carData = req.body;
    const result = yield car_service_1.CarServices.createCarToDB(userId, carData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: "Successfully created a car",
        data: result,
    });
}));
const getAllCars = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const { brand, model, transmission, fuelType, color, city, minPrice, maxPrice, rating, latitude, longitude, withDriver, maxDistance, date, time, sort, page, limit, searchTerm, } = req.query;
    const query = {
        brand,
        model,
        transmission,
        fuelType,
        color,
        city,
        minPrice,
        maxPrice,
        rating,
        latitude,
        longitude,
        withDriver,
        maxDistance,
        date,
        time,
        sort,
        page,
        limit,
        searchTerm,
    };
    const result = yield car_service_1.CarServices.getAllCarsFromDB(query, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: "Cars data are retrieved successfully",
        data: result,
    });
}));
const getRecentCars = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const result = yield car_service_1.CarServices.getRecentCarsFromDB(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Recent cars retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
}));
const getOwnCars = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { verificationStatus } = req.query;
    const result = yield car_service_1.CarServices.getOwnCarsFromDB({
        userId: req.user.id,
        verificationStatus: (0, car_utils_1.normalizeCarVerificationStatus)(verificationStatus),
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Cars retrieved successfully",
        data: result,
    });
}));
const getAllCarsForVerifications = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield car_service_1.CarServices.getAllCarsForVerificationsFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: "Car verifications data are retrieved successfully",
        data: result,
    });
}));
const getCarById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { id: userId } = req.user;
    const result = yield car_service_1.CarServices.getCarByIdFromDB(id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: "Car data is retrieved successfully",
        data: result,
    });
}));
const updateCarById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { id: userId } = req.user;
    const updatedPayload = req.body;
    const result = yield car_service_1.CarServices.updateCarByIdToDB(userId, id, updatedPayload);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: "Car data is updated successfully",
        data: result,
    });
}));
const deleteCarById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { id: userId } = req.user;
    const result = yield car_service_1.CarServices.deleteCarByIdFromDB(userId, id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: "Car data is deleted successfully",
        data: result,
    });
}));
const getAvailability = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { carId } = req.params;
    const { date } = req.query;
    // Validation
    if (!carId) {
        throw new ApiErrors_1.default(400, "Car ID is required");
    }
    if (!date || typeof date !== "string") {
        throw new ApiErrors_1.default(400, "Date query parameter is required (e.g., ?date=2025-12-12)");
    }
    // YYYY-MM-DD format check
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new ApiErrors_1.default(400, "Invalid date format. Use YYYY-MM-DD");
    }
    const availability = yield car_service_1.CarServices.getAvailability(carId, date);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Car availability fetched successfully",
        data: Object.assign({ carId }, availability),
    });
}));
const createCarBlockedDates = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { carId } = req.params;
    const { id: userId } = req.user;
    const { blockedDates } = req.body;
    const result = yield car_service_1.CarServices.createCarBlockedDatesToDB(carId, userId, blockedDates);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: "Successfully blocked the car",
        data: result,
    });
}));
const updateCarVerificationStatusById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { verificationStatus } = req.body;
    const { carId } = req.params;
    const result = yield car_service_1.CarServices.updateCarVerificationStatusByIdToDB(carId, verificationStatus);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: "Car verification status is updated successfully",
        data: result,
    });
}));
const getSuggestedCars = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const limit = parseInt(req.query.limit) || 10;
    const cars = yield car_service_1.CarServices.getSuggestedCarsFromDB(userId, limit);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Suggested cars fetched successfully",
        data: cars,
    });
}));
const getCarsByDestination = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { destinationId } = req.params;
    if (!destinationId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: 400,
            success: false,
            message: "Destination ID is required",
        });
    }
    // fetch destination & cars
    const result = yield car_service_1.CarServices.getCarsByDestinationFromDB(destinationId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Cars fetched successfully by destination",
        data: result,
    });
}));
exports.CarControllers = {
    createCar,
    getAllCars,
    getOwnCars,
    getCarById,
    updateCarById,
    deleteCarById,
    getAvailability,
    createCarBlockedDates,
    getAllCarsForVerifications,
    updateCarVerificationStatusById,
    getSuggestedCars,
    getRecentCars,
    getCarsByDestination,
};
