"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.FavouriteCarServices = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const http_status_codes_1 = require("http-status-codes");
const favouriteCar_model_1 = require("./favouriteCar.model");
const car_utils_1 = require("../car/car.utils");
const review_service_1 = require("../review/review.service");
const review_interface_1 = require("../review/review.interface");
const checkFavouriteCarStatus = (userId, referenceId) => __awaiter(void 0, void 0, void 0, function* () {
    const favourite = yield favouriteCar_model_1.FavouriteCar.findOne({ userId, referenceId });
    return { isFavourite: !!favourite };
});
const toggleFavourite = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, referenceId } = payload;
    const existing = yield favouriteCar_model_1.FavouriteCar.findOne({ userId, referenceId });
    if (existing) {
        yield favouriteCar_model_1.FavouriteCar.deleteOne({ _id: existing._id });
        return { message: "Favourite removed successfully", isFavourite: false };
    }
    const newFavourite = yield favouriteCar_model_1.FavouriteCar.create({
        userId,
        referenceId: new mongoose_1.default.Types.ObjectId(referenceId),
    });
    return {
        message: "Favourite added successfully",
        isFavourite: true,
        data: newFavourite,
    };
});
// const getFavourite = async (userId: string) => {
//   const favourites = await FavouriteCar.find({ userId })
//     .populate({
//       path: "referenceId",
//     })
//     .populate({
//       path: "userId",
//       select: "_id firstName email lastName role profileImage",
//     })
//     .lean();
//   return favourites;
// };
const getFavourite = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const favourites = yield favouriteCar_model_1.FavouriteCar.find({ userId })
        .populate({
        path: "referenceId", // Car
    })
        .populate({
        path: "userId",
        select: "_id firstName email lastName role profileImage",
    })
        .lean();
    if (!favourites.length)
        return favourites;
    // ---------- STEP 1: Extract carIds ----------
    const carIds = favourites
        .map((fav) => { var _a; return (_a = fav.referenceId) === null || _a === void 0 ? void 0 : _a._id; })
        .filter(Boolean)
        .map((id) => new mongoose_1.Types.ObjectId(id));
    // ---------- STEP 2: Get trip count map ----------
    const tripCountMap = yield (0, car_utils_1.getCarTripCountMap)(carIds);
    // ---------- STEP 3: Attach trips + rating ----------
    const finalFavourites = yield Promise.all(favourites.map((fav) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const carId = (_b = (_a = fav.referenceId) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString();
        const reviewSummary = yield review_service_1.ReviewServices.getReviewSummaryFromDB(carId, review_interface_1.REVIEW_TYPE.CAR);
        return Object.assign(Object.assign({}, fav), { referenceId: Object.assign(Object.assign({}, fav.referenceId), { trips: tripCountMap[carId] || 0, averageRating: reviewSummary.averageRating, totalReviews: reviewSummary.totalReviews, starCounts: reviewSummary.starCounts, reviews: reviewSummary.reviews }) });
    })));
    return finalFavourites;
});
const getSingleFavourite = (userId, favouriteId) => __awaiter(void 0, void 0, void 0, function* () {
    const favourite = yield favouriteCar_model_1.FavouriteCar.findOne({
        _id: favouriteId,
        userId,
    })
        .populate({
        path: "referenceId",
    })
        .lean();
    if (!favourite) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Favourite not found");
    }
    return favourite;
});
const deleteFavourite = (userId, referenceId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield favouriteCar_model_1.FavouriteCar.deleteOne({ userId, referenceId });
    if (!result.deletedCount) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Favourite not found");
    }
    return { message: "Favourite removed successfully" };
});
exports.FavouriteCarServices = {
    toggleFavourite,
    checkFavouriteCarStatus,
    getFavourite,
    getSingleFavourite,
    deleteFavourite,
};
