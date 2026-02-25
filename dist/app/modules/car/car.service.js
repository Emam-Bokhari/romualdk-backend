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
exports.CarServices = void 0;
const mongoose_1 = require("mongoose");
const user_1 = require("../../../enums/user");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const user_model_1 = require("../user/user.model");
const car_interface_1 = require("./car.interface");
const car_model_1 = require("./car.model");
const queryBuilder_1 = __importDefault(require("../../builder/queryBuilder"));
const favouriteCar_model_1 = require("../favouriteCar/favouriteCar.model");
const review_service_1 = require("../review/review.service");
const review_interface_1 = require("../review/review.interface");
const booking_model_1 = require("../booking/booking.model");
const booking_interface_1 = require("../booking/booking.interface");
const car_utils_1 = require("./car.utils");
const destination_model_1 = require("../destination/destination.model");
const createCarToDB = (userId, payload) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield user_model_1.User.findOne({
      _id: userId,
      hostStatus: user_1.HOST_STATUS.APPROVED,
      role: user_1.USER_ROLES.HOST,
    });
    if (!user) {
      throw new ApiErrors_1.default(400, "No user found by this Id");
    }
    payload.userId = new mongoose_1.Types.ObjectId(userId);
    if (
      (_a = payload.facilities) === null || _a === void 0 ? void 0 : _a.length
    ) {
      payload.facilities.forEach((facility) => {
        if (!facility.label || !facility.value) {
          throw new ApiErrors_1.default(
            400,
            "Each facility must have label and value",
          );
        }
      });
    }
    // const result = await Car.create(payload);
    // if (!result) {
    //   throw new ApiError(400, "Failed to create a car");
    // }
    // return result;
    try {
      const result = yield car_model_1.Car.create(payload);
      return result;
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiErrors_1.default(
          400,
          "Car with this license plate already exists",
        );
      }
      throw new ApiErrors_1.default(
        error.statusCode || 500,
        error.message || "Failed to create a car",
      );
    }
  });
// for feed
// const getAllCarsFromDB = async (query: any, userId: string) => {
//   const baseQuery = Car.find({
//     verificationStatus: CAR_VERIFICATION_STATUS.APPROVED,
//   }).populate({
//     path: "userId",
//     select: "firstName lastName fullName role profileImage email phone",
//   });
//   const queryBuilder = new QueryBuilder(baseQuery, query)
//     .search(["brand", "model", "transmission", "color", "city", "licensePlate"])
//     .sort()
//     .fields()
//     .filter()
//     .paginate();
//   const cars = await queryBuilder.modelQuery;
//   const now = new Date();
//   const carsWithBookmark = await Promise.all(
//     cars.map(async (car: any) => {
//       const tripsCountMap = await getCarTripCountMap([car._id]);
//       const availabilityCalendar = await getCarCalendar(car._id.toString());
//       const isBookmarked = await FavouriteCar.exists({
//         userId,
//         referenceId: car._id,
//       });
//       const reviewSummary = await ReviewServices.getReviewSummaryFromDB(
//         car.id,
//         REVIEW_TYPE.CAR,
//       );
//       const isAvailable = await checkCarAvailabilityByDate(car, now);
//       return {
//         ...car.toObject(),
//         isAvailable,
//         availabilityCalendar,
//         trips: tripsCountMap[car._id.toString()] || 0,
//         isFavourite: Boolean(isBookmarked),
//         averageRating: reviewSummary.averageRating,
//         totalReviews: reviewSummary.totalReviews,
//         starCounts: reviewSummary.starCounts,
//         reviews: reviewSummary.reviews,
//       };
//     }),
//   );
//   const meta = await queryBuilder.countTotal();
//   if (!cars || cars.length === 0) {
//     throw new ApiError(404, "No cars are found in the database");
//   }
//   return {
//     data: carsWithBookmark,
//     meta,
//   };
// };
// const getAllCarsFromDB = async (query: any, userId: string) => {
//   // =========================redis========================
//   // const redisKey = `cars:${userId}:${JSON.stringify(query)}`
//   // const cached = await redisClient.get(redisKey)
//   // if (cached) {
//   //   return JSON.parse(cached)
//   // }
//   const {
//     searchTerm,
//     minPrice, maxPrice,
//     transmission,
//     fuelType,
//     color,
//     city,
//     rating,
//     latitude, longitude, maxDistance,
//     date,
//     time,
//     sort,
//     page = 1,
//     limit = 10
//   } = query;
//   // ---------- create dynamic object ----------
//   const filter: any = {
//     verificationStatus: CAR_VERIFICATION_STATUS.APPROVED,
//     isActive: true
//   };
//   // search logic
//   if (searchTerm) {
//     filter.$or = [
//       { brand: { $regex: searchTerm, $options: "i" } },
//       { model: { $regex: searchTerm, $options: "i" } },
//       { city: { $regex: searchTerm, $options: "i" } },
//     ];
//   }
//   // Price Range (Combine logic)
//   if (minPrice || maxPrice) {
//     filter.dailyPrice = {};
//     if (minPrice) filter.dailyPrice.$gte = Number(minPrice);
//     if (maxPrice) filter.dailyPrice.$lte = Number(maxPrice);
//   }
//   // dynamic enum and text filters
//   if (transmission) filter.transmission = transmission;
//   if (fuelType) filter.fuelType = fuelType;
//   if (color) filter.color = { $regex: color, $options: "i" };
//   if (city) filter.city = { $regex: city, $options: "i" };
//   // ---------- create pipeline ----------
//   let pipeline: any[] = [];
//   // if location exists, GeoNear must be first
//   if (latitude && longitude) {
//     pipeline.push({
//       $geoNear: {
//         near: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
//         distanceField: "distance",
//         maxDistance: maxDistance ? Number(maxDistance) * 1000 : 50000,
//         spherical: true,
//         query: filter
//       }
//     });
//   } else {
//     // if do not have geo filter, match stage comes first
//     pipeline.push({ $match: filter });
//   }
//   // sorting
//   let sortObj: any = { createdAt: -1 };
//   if (sort === "priceLowToHigh") sortObj = { dailyPrice: 1 };
//   if (sort === "priceHighToLow") sortObj = { dailyPrice: -1 };
//   if (sort === "distance" && latitude) sortObj = { distance: 1 };
//   pipeline.push({ $sort: sortObj });
//   // Pagination
//   const skip = (Number(page) - 1) * Number(limit);
//   pipeline.push({ $skip: skip }, { $limit: Number(limit) });
//   // fetch data
//   const cars = await Car.aggregate(pipeline);
//   // ---------- Availability & Reviews ----------
//   const targetDate = (date as string) || new Date().toISOString().split("T")[0];
//   const processedCars = await Promise.all(
//     cars.map(async (carData: any) => {
//       const car = await Car.findById(carData._id).populate({
//         path: "userId",
//         select: "firstName lastName fullName role profileImage email phone",
//       });
//       if (!car) return null;
//       // Availability check
//       const availability = await CarServices.getAvailability(car._id.toString(), targetDate);
//       const availabilityCalendar = await getCarCalendar(car._id.toString());
//       let isAvailable = !availability.isFullyBlocked;
//       if (time) {
//         const slot = availability.slots.find((s: any) => s.time === time);
//         isAvailable = slot ? slot.isAvailable : false;
//       }
//       // date or time filter
//       if ((date || time) && !isAvailable) return null;
//       // rating filter
//       const reviewSummary = await ReviewServices.getReviewSummaryFromDB(car._id.toString(), REVIEW_TYPE.CAR);
//       if (rating && reviewSummary.averageRating < Number(rating)) return null;
//       // other data
//       const tripsCountMap = await getCarTripCountMap([car._id]);
//       const isBookmarked = await FavouriteCar.exists({ userId, referenceId: car._id });
//       return {
//         ...car.toObject(),
//         distance: carData.distance ? (carData.distance / 1000).toFixed(1) : null,
//         isAvailable,
//         availabilityCalendar,
//         trips: tripsCountMap[car._id.toString()] || 0,
//         isFavourite: Boolean(isBookmarked),
//         averageRating: reviewSummary.averageRating,
//         totalReviews: reviewSummary.totalReviews,
//         starCounts: reviewSummary.starCounts,
//         reviews: reviewSummary.reviews,
//         availabilitySlots: availability.slots
//       };
//     })
//   );
//   // filter out nulls
//   const finalCars = processedCars.filter(car => car !== null);
//   const result =
//   {
//     data: finalCars,
//     meta: {
//       page: Number(page),
//       limit: Number(limit),
//       total: finalCars.length,
//     },
//   };
//   // await redisClient.set(redisKey, JSON.stringify(result), { EX: 300 })
//   return result;
// };
const getAllCarsFromDB = (query, userId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const {
      searchTerm,
      minPrice,
      maxPrice,
      transmission,
      fuelType,
      color,
      city,
      rating,
      latitude,
      longitude,
      maxDistance,
      withDriver,
      date,
      time,
      sort,
      page = 1,
      limit = 10,
    } = query;
    // reusable function get location
    const { lat, lng } = yield (0, car_utils_1.getTargetLocation)(
      latitude,
      longitude,
      userId,
    );
    // ---------- create dynamic object ----------
    const filter = {
      verificationStatus: car_interface_1.CAR_VERIFICATION_STATUS.APPROVED,
      isActive: true,
    };
    // search logic
    if (searchTerm) {
      filter.$or = [
        { brand: { $regex: searchTerm, $options: "i" } },
        { model: { $regex: searchTerm, $options: "i" } },
        { city: { $regex: searchTerm, $options: "i" } },
      ];
    }
    if (withDriver !== undefined) {
      filter.withDriver = withDriver === "true" || withDriver === true;
    }
    // Price Range
    if (minPrice || maxPrice) {
      filter.dailyPrice = {};
      if (minPrice) filter.dailyPrice.$gte = Number(minPrice);
      if (maxPrice) filter.dailyPrice.$lte = Number(maxPrice);
    }
    // dynamic enum and text filters
    if (transmission) filter.transmission = transmission;
    if (fuelType) filter.fuelType = fuelType;
    if (color) filter.color = { $regex: color, $options: "i" };
    if (city) filter.city = { $regex: city, $options: "i" };
    // ---------- create pipeline ----------
    let pipeline = [];
    //
    pipeline.push({
      $geoNear: {
        near: { type: "Point", coordinates: [lng, lat] },
        distanceField: "distance",
        maxDistance: maxDistance ? Number(maxDistance) * 1000 : 500000, // 500km
        spherical: true,
        query: filter,
      },
    });
    // sorting
    let sortObj = { createdAt: -1 };
    if (sort === "priceLowToHigh") sortObj = { dailyPrice: 1 };
    if (sort === "priceHighToLow") sortObj = { dailyPrice: -1 };
    if (sort === "distance") sortObj = { distance: 1 };
    pipeline.push({ $sort: sortObj });
    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    pipeline.push({ $skip: skip }, { $limit: Number(limit) });
    // fetch data
    const cars = yield car_model_1.Car.aggregate(pipeline);
    // ---------- Availability & Reviews ----------
    const targetDate = date || new Date().toISOString().split("T")[0];
    const processedCars = yield Promise.all(
      cars.map((carData) =>
        __awaiter(void 0, void 0, void 0, function* () {
          const car = yield car_model_1.Car.findById(carData._id).populate({
            path: "userId",
            select: "firstName lastName fullName role profileImage email phone",
          });
          if (!car) return null;
          // Availability check
          const availability = yield exports.CarServices.getAvailability(
            car._id.toString(),
            targetDate,
          );
          const availabilityCalendar = yield (0, car_utils_1.getCarCalendar)(
            car._id.toString(),
          );
          let isAvailable = !availability.isFullyBlocked;
          if (time) {
            const slot = availability.slots.find((s) => s.time === time);
            isAvailable = slot ? slot.isAvailable : false;
          }
          // date or time filter
          if ((date || time) && !isAvailable) return null;
          // rating filter
          const reviewSummary =
            yield review_service_1.ReviewServices.getReviewSummaryFromDB(
              car._id.toString(),
              review_interface_1.REVIEW_TYPE.CAR,
            );
          if (rating && reviewSummary.averageRating < Number(rating))
            return null;
          // other data
          const tripsCountMap = yield (0, car_utils_1.getCarTripCountMap)([
            car._id,
          ]);
          const isBookmarked = yield favouriteCar_model_1.FavouriteCar.exists({
            userId,
            referenceId: car._id,
          });
          return Object.assign(Object.assign({}, car.toObject()), {
            // distance in km
            distance:
              carData.distance !== undefined
                ? (carData.distance / 1000).toFixed(1)
                : "0.0",
            isAvailable,
            availabilityCalendar,
            trips: tripsCountMap[car._id.toString()] || 0,
            isFavourite: Boolean(isBookmarked),
            averageRating: reviewSummary.averageRating,
            totalReviews: reviewSummary.totalReviews,
            starCounts: reviewSummary.starCounts,
            reviews: reviewSummary.reviews,
            availabilitySlots: availability.slots,
          });
        }),
      ),
    );
    // filter out nulls
    const finalCars = processedCars.filter((car) => car !== null);
    const result = {
      data: finalCars,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: finalCars.length,
      },
    };
    return result;
  });
// const getRecentCarsFromDB = async (userId?: string) => {
//   const limit = 10;
//   const cars = await Car.find({
//     verificationStatus: CAR_VERIFICATION_STATUS.APPROVED,
//     isActive: true,
//   })
//     .sort({ createdAt: -1 }) // recent first
//     .limit(limit)
//     .populate({
//       path: "userId",
//       select: "firstName lastName fullName profileImage",
//     })
//     .lean();
//   // optional: user-specific favourite check
//   let favouriteMap: Record<string, boolean> = {};
//   if (userId) {
//     const favourites = await FavouriteCar.find({
//       userId,
//       referenceId: { $in: cars.map(c => c._id) },
//     }).select("referenceId");
//     favourites.forEach(fav => {
//       favouriteMap[fav.referenceId.toString()] = true;
//     });
//   }
//   const result = cars.map(car => ({
//     ...car,
//     isFavourite: Boolean(favouriteMap[car._id.toString()]),
//   }));
//   return {
//     data: result,
//     meta: {
//       total: result.length,
//     },
//   };
// };
const getRecentCarsFromDB = (userId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const limit = 10;
    //  get location
    const { lat, lng } = yield (0, car_utils_1.getTargetLocation)(
      undefined,
      undefined,
      userId,
    );
    const cars = yield car_model_1.Car.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distance",
          spherical: true,
          query: {
            verificationStatus:
              car_interface_1.CAR_VERIFICATION_STATUS.APPROVED,
            isActive: true,
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
    ]);
    let favouriteMap = {};
    if (userId) {
      const favourites = yield favouriteCar_model_1.FavouriteCar.find({
        userId,
        referenceId: { $in: cars.map((c) => c._id) },
      }).select("referenceId");
      favourites.forEach((fav) => {
        favouriteMap[fav.referenceId.toString()] = true;
      });
    }
    const result = yield Promise.all(
      cars.map((carData) =>
        __awaiter(void 0, void 0, void 0, function* () {
          const carWithUser = yield car_model_1.Car.findById(carData._id)
            .populate({
              path: "userId",
              select: "firstName lastName fullName profileImage",
            })
            .lean();
          return Object.assign(Object.assign({}, carWithUser), {
            // convert distance to km
            distance:
              carData.distance !== undefined
                ? (carData.distance / 1000).toFixed(1)
                : "0.0",
            isFavourite: Boolean(favouriteMap[carData._id.toString()]),
          });
        }),
      ),
    );
    return {
      data: result,
      meta: {
        total: result.length,
      },
    };
  });
// for verifications, dashboard
const getAllCarsForVerificationsFromDB = (query) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const baseQuery = car_model_1.Car.find({
      verificationStatus: {
        $in: [
          car_interface_1.CAR_VERIFICATION_STATUS.PENDING,
          car_interface_1.CAR_VERIFICATION_STATUS.REJECTED,
          car_interface_1.CAR_VERIFICATION_STATUS.APPROVED,
        ],
      },
    }).populate({
      path: "userId",
      select: "firstName lastName fullName role email phone profileImage",
    });
    const queryBuilder = new queryBuilder_1.default(baseQuery, query)
      .search([
        "brand",
        "model",
        "transmission",
        "color",
        "city",
        "licensePlate",
      ])
      .sort()
      .fields()
      .filter()
      .paginate();
    const cars = yield queryBuilder.modelQuery;
    const meta = yield queryBuilder.countTotal();
    if (!cars || cars.length === 0) {
      throw new ApiErrors_1.default(404, "No cars are found in the database");
    }
    return {
      data: cars,
      meta,
    };
  });
const updateCarVerificationStatusByIdToDB = (carId, carVerificationStatus) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (
      ![
        car_interface_1.CAR_VERIFICATION_STATUS.PENDING,
        car_interface_1.CAR_VERIFICATION_STATUS.APPROVED,
        car_interface_1.CAR_VERIFICATION_STATUS.REJECTED,
      ].includes(carVerificationStatus)
    ) {
      throw new ApiErrors_1.default(
        400,
        "Car verification status must be either 'PENDING','APPROVED' or 'REJECTED'",
      );
    }
    console.log(carVerificationStatus, "STATUS");
    const result = yield car_model_1.Car.findByIdAndUpdate(
      carId,
      { verificationStatus: carVerificationStatus },
      { new: true },
    );
    if (!result) {
      throw new ApiErrors_1.default(
        400,
        "Failed to change car verification status by this car ID",
      );
    }
    return result;
  });
// const getOwnCarsFromDB = async ({
//   userId,
//   verificationStatus,
// }: GetOwnCarsParams) => {
//   const user = await User.findOne({
//     _id: userId,
//     role: USER_ROLES.HOST,
//   });
//   if (!user) {
//     throw new ApiError(404, "No hosts are found by this ID");
//   }
//   const carQuery: Record<string, any> = { userId };
//   //  enum-safe filter
//   if (verificationStatus) {
//     carQuery.verificationStatus = verificationStatus;
//   }
//   const cars = await Car.find(carQuery).populate({
//     path: "userId",
//     select: "firstName lastName fullName role profileImage email phone",
//   });
//   if (!cars.length) {
//     return [];
//   }
//   const carsWithMeta = await Promise.all(
//     cars.map(async (car) => {
//       const isBookmarked = await FavouriteCar.exists({
//         userId,
//         referenceId: car._id,
//       });
//       const reviewSummary =
//         await ReviewServices.getReviewSummaryFromDB(
//           car._id.toString(),
//           REVIEW_TYPE.CAR
//         );
//       return {
//         ...car.toObject(),
//         isFavourite: Boolean(isBookmarked),
//         averageRating: reviewSummary.averageRating,
//         totalReviews: reviewSummary.totalReviews,
//         starCounts: reviewSummary.starCounts,
//         reviews: reviewSummary.reviews,
//       };
//     })
//   );
//   return carsWithMeta;
// };
// const getCarByIdFromDB = async (id: string, userId: string) => {
//   const result = await Car.findById(id).populate({
//     path: "userId",
//     select: "firstName lastName fullName role profileImage email phone",
//   });
//   const isBookmarked = await FavouriteCar.exists({
//     userId,
//     referenceId: id,
//   });
//   const now = new Date();
//   const isAvailable = await checkCarAvailabilityByDate(result, now);
//   const availabilityCalendar = await getCarCalendar(id.toString());
//   const reviewSummary = await ReviewServices.getReviewSummaryFromDB(
//     id,
//     REVIEW_TYPE.CAR,
//   );
//   const trips = await getCarTripCount(id)
//   if (!result) {
//     return {};
//   }
//   return {
//     ...result.toObject(),
//     trips: trips || 0,
//     isAvailable,
//     availabilityCalendar,
//     isFavourite: Boolean(isBookmarked),
//     averageRating: reviewSummary.averageRating,
//     totalReviews: reviewSummary.totalReviews,
//     starCounts: reviewSummary.starCounts,
//     reviews: reviewSummary.reviews,
//   };
// };
const getOwnCarsFromDB = (_a) =>
  __awaiter(void 0, [_a], void 0, function* ({ userId, verificationStatus }) {
    const user = yield user_model_1.User.findOne({
      _id: userId,
      role: user_1.USER_ROLES.HOST,
    });
    if (!user) {
      throw new ApiErrors_1.default(404, "No hosts are found by this ID");
    }
    //  get location
    const { lat, lng } = yield (0, car_utils_1.getTargetLocation)(
      undefined,
      undefined,
      userId,
    );
    const carQuery = {
      userId: new mongoose_1.Types.ObjectId(userId),
    };
    if (verificationStatus) {
      carQuery.verificationStatus = verificationStatus;
    }
    const cars = yield car_model_1.Car.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distance",
          spherical: true,
          query: carQuery,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    if (!cars.length) {
      return [];
    }
    const carsWithMeta = yield Promise.all(
      cars.map((carData) =>
        __awaiter(void 0, void 0, void 0, function* () {
          const car = yield car_model_1.Car.findById(carData._id).populate({
            path: "userId",
            select: "firstName lastName fullName role profileImage email phone",
          });
          if (!car) return null;
          const isBookmarked = yield favouriteCar_model_1.FavouriteCar.exists({
            userId,
            referenceId: car._id,
          });
          const reviewSummary =
            yield review_service_1.ReviewServices.getReviewSummaryFromDB(
              car._id.toString(),
              review_interface_1.REVIEW_TYPE.CAR,
            );
          return Object.assign(Object.assign({}, car.toObject()), {
            // convert distance to km
            distance:
              carData.distance !== undefined
                ? (carData.distance / 1000).toFixed(1)
                : "0.0",
            isFavourite: Boolean(isBookmarked),
            averageRating: reviewSummary.averageRating,
            totalReviews: reviewSummary.totalReviews,
            starCounts: reviewSummary.starCounts,
            reviews: reviewSummary.reviews,
          });
        }),
      ),
    );
    // null filter
    return carsWithMeta.filter((car) => car !== null);
  });
const getCarByIdFromDB = (id, userId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    // get location
    const { lat, lng } = yield (0, car_utils_1.getTargetLocation)(
      undefined,
      undefined,
      userId,
    );
    const cars = yield car_model_1.Car.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distance",
          spherical: true,
          query: { _id: new mongoose_1.Types.ObjectId(id) },
        },
      },
    ]);
    const carData = cars[0];
    if (!carData) {
      return {};
    }
    const car = yield car_model_1.Car.findById(carData._id).populate({
      path: "userId",
      select: "firstName lastName fullName role profileImage email phone",
    });
    if (!car) return {};
    const isBookmarked = yield favouriteCar_model_1.FavouriteCar.exists({
      userId,
      referenceId: id,
    });
    const now = new Date();
    const isAvailable = yield (0, car_utils_1.checkCarAvailabilityByDate)(
      car,
      now,
    );
    const availabilityCalendar = yield (0, car_utils_1.getCarCalendar)(
      id.toString(),
    );
    const reviewSummary =
      yield review_service_1.ReviewServices.getReviewSummaryFromDB(
        id,
        review_interface_1.REVIEW_TYPE.CAR,
      );
    const trips = yield (0, car_utils_1.getCarTripCount)(id);
    return Object.assign(Object.assign({}, car.toObject()), {
      // convert distance to km
      distance:
        carData.distance !== undefined
          ? (carData.distance / 1000).toFixed(1)
          : "0.0",
      trips: trips || 0,
      isAvailable,
      availabilityCalendar,
      isFavourite: Boolean(isBookmarked),
      averageRating: reviewSummary.averageRating,
      totalReviews: reviewSummary.totalReviews,
      starCounts: reviewSummary.starCounts,
      reviews: reviewSummary.reviews,
    });
  });
const removeUndefined = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null),
  );
var ACTION;
(function (ACTION) {
  ACTION["ADD"] = "ADD";
  ACTION["DELETE"] = "DELETE";
})(ACTION || (ACTION = {}));
const updateCarByIdToDB = (userId, carId, payload) =>
  __awaiter(void 0, void 0, void 0, function* () {
    // -------------------------- Check host --------------------------
    const user = yield user_model_1.User.findOne({
      _id: userId,
      role: user_1.USER_ROLES.HOST,
      hostStatus: user_1.HOST_STATUS.APPROVED,
    });
    if (!user) {
      throw new ApiErrors_1.default(404, "No approved host found by this ID");
    }
    // -------------------------- Handle array actions --------------------------
    let updateQuery = {};
    if (payload.arrayAction) {
      const { field, action, value } = payload.arrayAction;
      const allowedFields = ["images", "availableDays", "facilities"];
      if (!allowedFields.includes(field)) {
        throw new ApiErrors_1.default(400, "Invalid array field");
      }
      // -------------------------- Build update query --------------------------
      if (field === "facilities") {
        const isFacilityPayload = (val) => {
          return (
            typeof val === "object" &&
            val !== null &&
            "label" in val &&
            "value" in val
          );
        };
        if (action === ACTION.ADD) {
          if (!isFacilityPayload(value)) {
            throw new ApiErrors_1.default(400, "Invalid facility payload");
          }
          updateQuery = {
            $addToSet: {
              facilities: {
                label: value.label,
                value: value.value.toLowerCase(),
                icon: value.icon,
              },
            },
          };
        }
        if (action === ACTION.DELETE) {
          if (typeof value !== "string") {
            throw new ApiErrors_1.default(400, "Facility value must be string");
          }
          updateQuery = {
            $pull: {
              facilities: { value },
            },
          };
        }
      } else {
        if (action === ACTION.ADD) {
          updateQuery = { $addToSet: { [field]: value } };
        }
        if (action === ACTION.DELETE) {
          updateQuery = { $pull: { [field]: value } };
        }
      }
      delete payload.arrayAction;
      const updated = yield car_model_1.Car.findOneAndUpdate(
        { _id: carId, userId },
        updateQuery,
        { new: true },
      );
      if (!updated) {
        throw new ApiErrors_1.default(
          404,
          "Car not found or not owned by user",
        );
      }
      return updated;
    }
    // -------------------------- Handle normal updates --------------------------
    const cleanPayload = removeUndefined(payload);
    delete cleanPayload.userId;
    const updated = yield car_model_1.Car.findOneAndUpdate(
      { _id: carId, userId },
      cleanPayload,
      { new: true },
    );
    if (!updated) {
      throw new ApiErrors_1.default(404, "Car not found or not owned by user");
    }
    return updated;
  });
const deleteCarByIdFromDB = (userId, id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    // -------------------------- Check host --------------------------
    const user = yield user_model_1.User.findOne({
      _id: userId,
      role: user_1.USER_ROLES.HOST,
      hostStatus: user_1.HOST_STATUS.APPROVED,
    });
    if (!user) {
      throw new ApiErrors_1.default(404, "No approved host found by this ID");
    }
    const result = yield car_model_1.Car.findByIdAndDelete(id);
    if (!result) {
      throw new ApiErrors_1.default(400, "Failed to delete car by this ID");
    }
    return result;
  });
// const getAvailability = async (carId: string, dateString: string) => {
//   const targetDate = new Date(dateString);
//   const normalizedDate = new Date(
//     Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate())
//   );
//   const car = await Car.findById(carId).select(
//     "isActive availableDays availableHours defaultStartTime defaultEndTime blockedDates"
//   );
//   if (!car) throw new ApiError(404, "Car not found");
//   if (!car.isActive) return generateBlockedResponse(normalizedDate, "Car is not active");
//   // manual block with host reason
//   const blockedEntry = car.blockedDates?.find((b: any) =>
//     new Date(b.date).toISOString().split("T")[0] === normalizedDate.toISOString().split("T")[0]
//   );
//   if (blockedEntry) return generateBlockedResponse(normalizedDate, blockedEntry.reason || "Blocked by host");
//   // days check
//   const dayName = normalizedDate.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase() as AVAILABLE_DAYS;
//   if (!car.availableDays.includes(dayName)) {
//     return generateBlockedResponse(normalizedDate, "Car not available on this day");
//   }
//   // availableHours string[] → number[] convert
//   let openHoursSet = new Set<number>();
//   if (car.availableHours && car.availableHours.length > 0) {
//     car.availableHours.forEach((timeStr: string) => {
//       const hour = parseInt(timeStr.split(":")[0], 10);
//       if (!isNaN(hour) && hour >= 0 && hour <= 23) {
//         openHoursSet.add(hour);
//       }
//     });
//   }
//   // defaultStartTime/endTime
//   else if (car.defaultStartTime && car.defaultEndTime) {
//     const start = parseInt(car.defaultStartTime.split(":")[0], 10);
//     let end = parseInt(car.defaultEndTime.split(":")[0], 10);
//     const endHour = end === 0 ? 24 : end;
//     for (let h = start; h < endHour; h++) {
//       openHoursSet.add(h % 24);
//     }
//   }
//   // fallback 24 hour slots
//   else {
//     for (let i = 0; i < 24; i++) openHoursSet.add(i);
//   }
//   // final slots
//   const slots = Array.from({ length: 24 }, (_, hour) => {
//     const isAvailable = openHoursSet.has(hour);
//     return {
//       hour,
//       time: `${String(hour).padStart(2, "0")}:00`,
//       isAvailable,
//       blocked: !isAvailable,
//       blockedReason: isAvailable ? null : "Outside operating hours",
//     };
//   });
//   return {
//     date: normalizedDate.toISOString().split("T")[0],
//     isFullyBlocked: false,
//     blockedReason: null,
//     slots,
//   };
// };
// const generateBlockedResponse = (date: Date, reason: string) => ({
//   date: date.toISOString().split("T")[0],
//   isFullyBlocked: true,
//   blockedReason: reason,
//   slots: Array.from({ length: 24 }, (_, hour) => ({
//     hour,
//     time: `${String(hour).padStart(2, "0")}:00`,
//     isAvailable: false,
//     blocked: true,
//     blockedReason: reason,
//   })),
// });
const getAvailability = (carId, dateString) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    // ---------- Normalize Date (UTC Day) ----------
    const targetDate = new Date(dateString);
    const normalizedDate = new Date(
      Date.UTC(
        targetDate.getUTCFullYear(),
        targetDate.getUTCMonth(),
        targetDate.getUTCDate(),
      ),
    );
    // ---------- Fetch Car ----------
    const car = yield car_model_1.Car.findById(carId).select(
      "isActive availableDays availableHours defaultStartTime defaultEndTime blockedDates",
    );
    if (!car) throw new ApiErrors_1.default(404, "Car not found");
    if (!car.isActive) {
      return generateBlockedResponse(normalizedDate, "Car is not active");
    }
    // ---------- Priority 1: Manual Full Day Block ----------
    const blockedEntry =
      (_a = car.blockedDates) === null || _a === void 0
        ? void 0
        : _a.find(
            (b) =>
              new Date(b.date).toISOString().split("T")[0] ===
              normalizedDate.toISOString().split("T")[0],
          );
    if (blockedEntry) {
      return generateBlockedResponse(
        normalizedDate,
        blockedEntry.reason || "Blocked by host",
      );
    }
    // ---------- Day Availability Check ----------
    const dayName = normalizedDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();
    if (
      ((_b = car.availableDays) === null || _b === void 0
        ? void 0
        : _b.length) &&
      !car.availableDays.includes(dayName)
    ) {
      return generateBlockedResponse(
        normalizedDate,
        "Car not available on this day",
      );
    }
    // ---------- Priority 2: Define Operating Hours ----------
    const openHoursSet = new Set();
    if (
      (_c = car.availableHours) === null || _c === void 0 ? void 0 : _c.length
    ) {
      car.availableHours.forEach((t) => {
        const h = parseInt(t.split(":")[0], 10);
        if (!isNaN(h) && h >= 0 && h <= 23) {
          openHoursSet.add(h);
        }
      });
    } else if (car.defaultStartTime && car.defaultEndTime) {
      const start = parseInt(car.defaultStartTime.split(":")[0], 10);
      const end = parseInt(car.defaultEndTime.split(":")[0], 10) || 24;
      for (let h = start; h < end; h++) {
        openHoursSet.add(h % 24);
      }
    } else {
      for (let i = 0; i < 24; i++) openHoursSet.add(i);
    }
    // ---------- Priority 3: Booking Conflict ----------
    const bookings = yield booking_model_1.Booking.find({
      carId: new mongoose_1.Types.ObjectId(carId),
      status: {
        $in: [
          booking_interface_1.BOOKING_STATUS.PAID,
          booking_interface_1.BOOKING_STATUS.ONGOING,
        ],
      },
      fromDate: { $lt: new Date(normalizedDate.getTime() + 86400000) },
      toDate: { $gt: normalizedDate },
    }).select("fromDate toDate");
    const bookingBlockedHours = getBookingBlockedHours(
      bookings,
      normalizedDate,
    );
    // ---------- Final Slot Generation ----------
    const slots = Array.from({ length: 24 }, (_, hour) => {
      // Outside operating hours
      if (!openHoursSet.has(hour)) {
        return {
          hour,
          time: `${String(hour).padStart(2, "0")}:00`,
          isAvailable: false,
          blocked: true,
          blockedReason: "Outside operating hours",
        };
      }
      // Already booked (only if operating hour)
      if (bookingBlockedHours.has(hour)) {
        return {
          hour,
          time: `${String(hour).padStart(2, "0")}:00`,
          isAvailable: false,
          blocked: true,
          blockedReason: "Already booked",
        };
      }
      // Available
      return {
        hour,
        time: `${String(hour).padStart(2, "0")}:00`,
        isAvailable: true,
        blocked: false,
        blockedReason: "",
      };
    });
    return {
      carId,
      date: normalizedDate.toISOString().split("T")[0],
      isFullyBlocked: false,
      blockedReason: "",
      slots,
    };
  });
/**
 * =========================
 * HELPER: BOOKING HOURS
 * =========================
 */
const getBookingBlockedHours = (bookings, date) => {
  const blockedHours = new Set();
  const dayStart = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
    ),
  );
  const dayEnd = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
    ),
  );
  bookings.forEach((booking) => {
    const start = new Date(
      Math.max(booking.fromDate.getTime(), dayStart.getTime()),
    );
    const end = new Date(Math.min(booking.toDate.getTime(), dayEnd.getTime()));
    let current = new Date(start);
    while (current < end) {
      blockedHours.add(current.getUTCHours());
      current.setUTCHours(current.getUTCHours() + 1);
    }
  });
  return blockedHours;
};
/**
 * =========================
 * HELPER: FULL DAY BLOCK
 * =========================
 */
const generateBlockedResponse = (date, reason) => ({
  date: date.toISOString().split("T")[0],
  isFullyBlocked: true,
  blockedReason: reason,
  slots: Array.from({ length: 24 }, (_, hour) => ({
    hour,
    time: `${String(hour).padStart(2, "0")}:00`,
    isAvailable: false,
    blocked: true,
    blockedReason: reason,
  })),
});
const createCarBlockedDatesToDB = (carId, userId, payload) =>
  __awaiter(void 0, void 0, void 0, function* () {
    // Ensure host exists
    const user = yield user_model_1.User.findOne({
      _id: userId,
      role: user_1.USER_ROLES.HOST,
    }).select("_id");
    if (!user) throw new ApiErrors_1.default(400, "No user found by this Id");
    // Ensure car belongs to this host
    const car = yield car_model_1.Car.findOne({ _id: carId, userId }).select(
      "blockedDates",
    );
    if (!car) throw new ApiErrors_1.default(404, "No car found by this ID");
    // Merge old + new
    const combined = [...(car.blockedDates || []), ...payload];
    // Normalize & remove duplicates by date
    const normalized = Array.from(
      new Map(
        combined.map((item) => [
          new Date(item.date).toISOString().split("T")[0], // unique key YYYY-MM-DD
          { date: new Date(item.date), reason: item.reason || "" },
        ]),
      ).values(),
    );
    // Update DB
    const result = yield car_model_1.Car.findByIdAndUpdate(
      carId,
      { blockedDates: normalized },
      { new: true },
    );
    if (!result)
      throw new ApiErrors_1.default(400, "Failed to update blocked dates");
    return result;
  });
// const getSuggestedCarsFromDB = async (userId: string, limit: number = 10) => {
//   console.log("===== START getSuggestedCarsFromDB =====");
//   const user = await User.findById(userId).select("location").lean();
//   console.log("User fetched:", user);
//   let userLocation: [number, number] | undefined;
//   if (
//     user?.location?.coordinates &&
//     Array.isArray(user.location.coordinates) &&
//     user.location.coordinates.length === 2
//   ) {
//     const [lng, lat] = user.location.coordinates;
//     if (lng !== 0 && lat !== 0) {
//       userLocation = [lng, lat];
//     }
//   }
//   // Default Dhaka location
//   const defaultLocation: [number, number] = [90.4074, 23.8103];
//   const location = userLocation || defaultLocation;
//   console.log("Using location:", location);
//   const maxDistance = 50000; // 50 km
//   // ---------- STEP 1: Geo query ----------
//   const rawCars = await Car.aggregate([
//     {
//       $geoNear: {
//         near: { type: "Point", coordinates: location },
//         distanceField: "distance", // original in meters
//         maxDistance,
//         spherical: true,
//         query: {
//           isActive: true,
//           verificationStatus: CAR_VERIFICATION_STATUS.APPROVED,
//         },
//       },
//     },
//     // convert distance to km with 1 decimal place
//     {
//       $addFields: {
//         distance: { $round: [{ $divide: ["$distance", 1000] }, 1] },
//       },
//     },
//     { $sort: { distance: 1 } },
//     { $limit: limit * 3 },
//   ]);
//   console.log("Raw cars fetched:", rawCars.length);
//   const targetDate = new Date(); // today (UTC)
//   const suggestedCars: any[] = [];
//   for (const car of rawCars) {
//     console.log("Checking car:", car._id);
//     // ================OLD CODE===================
//     //   const isBookable = await isCarBookableForDay(car, targetDate);
//     //   console.log(`Car ${car._id} bookable?`, isBookable);
//     //   if (isBookable) {
//     //     suggestedCars.push(car);
//     //   }
//     //   if (suggestedCars.length === limit) break;
//     // }
//     // ================NEW CODE===================
//     const isAvailable = await checkCarAvailabilityByDate(car, targetDate);
//     const availabilityCalendar = await getCarCalendar(car._id.toString());
//     if (isAvailable) {
//       suggestedCars.push({
//         ...car,
//         isAvailable: true,
//         availabilityCalendar,
//       });
//     }
//     if (suggestedCars.length === limit) break;
//   }
//   console.log("Suggested cars after availability check:", suggestedCars.length);
//   const populatedCars = await Car.populate(suggestedCars, {
//     path: "userId",
//     select: "firstName lastName email phone role profileImage",
//   });
//   // ---------- STEP 5: Add trip count ----------
//   const carIds = populatedCars.map((car: any) => car._id);
//   console.log("Car IDs for trip count:", carIds);
//   const tripCountMap = await getCarTripCountMap(carIds);
//   const finalCars = await Promise.all(
//     populatedCars.map(async (car: any) => {
//       const reviewSummary =
//         await ReviewServices.getReviewSummaryFromDB(
//           car._id,
//           REVIEW_TYPE.CAR
//         );
//       return {
//         ...car,
//         trips: tripCountMap[car._id.toString()] || 0,
//         averageRating: reviewSummary.averageRating,
//         totalReviews: reviewSummary.totalReviews,
//         starCounts: reviewSummary.starCounts,
//         reviews: reviewSummary.reviews,
//       };
//     })
//   );
//   console.log("===== END getSuggestedCarsFromDB =====");
//   return finalCars;
// };
const getSuggestedCarsFromDB = (userId_1, ...args_1) =>
  __awaiter(
    void 0,
    [userId_1, ...args_1],
    void 0,
    function* (userId, limit = 10) {
      console.log("===== START getSuggestedCarsFromDB =====");
      const { lat, lng } = yield (0, car_utils_1.getTargetLocation)(
        undefined,
        undefined,
        userId,
      );
      const location = [lng, lat];
      console.log("Using location:", location);
      const maxDistance = 500000; // 500 km default for testing purpose
      // ---------- STEP 1: Geo query ----------
      const rawCars = yield car_model_1.Car.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: location },
            distanceField: "distance", // original in meters
            maxDistance,
            spherical: true,
            query: {
              isActive: true,
              verificationStatus:
                car_interface_1.CAR_VERIFICATION_STATUS.APPROVED,
            },
          },
        },
        {
          $addFields: {
            distance: { $round: [{ $divide: ["$distance", 1000] }, 1] },
          },
        },
        { $sort: { distance: 1 } },
        { $limit: limit * 3 },
      ]);
      console.log("Raw cars fetched:", rawCars.length);
      const targetDate = new Date(); // today (UTC)
      const suggestedCars = [];
      for (const car of rawCars) {
        console.log("Checking car:", car._id);
        const isAvailable = yield (0, car_utils_1.checkCarAvailabilityByDate)(
          car,
          targetDate,
        );
        const availabilityCalendar = yield (0, car_utils_1.getCarCalendar)(
          car._id.toString(),
        );
        if (isAvailable) {
          suggestedCars.push(
            Object.assign(Object.assign({}, car), {
              isAvailable: true,
              availabilityCalendar,
            }),
          );
        }
        if (suggestedCars.length === limit) break;
      }
      console.log(
        "Suggested cars after availability check:",
        suggestedCars.length,
      );
      const populatedCars = yield car_model_1.Car.populate(suggestedCars, {
        path: "userId",
        select: "firstName lastName email phone role profileImage",
      });
      // ---------- STEP 5: Add trip count ----------
      const carIds = populatedCars.map((car) => car._id);
      console.log("Car IDs for trip count:", carIds);
      const tripCountMap = yield (0, car_utils_1.getCarTripCountMap)(carIds);
      const finalCars = yield Promise.all(
        populatedCars.map((car) =>
          __awaiter(void 0, void 0, void 0, function* () {
            const reviewSummary =
              yield review_service_1.ReviewServices.getReviewSummaryFromDB(
                car._id,
                review_interface_1.REVIEW_TYPE.CAR,
              );
            return Object.assign(Object.assign({}, car), {
              trips: tripCountMap[car._id.toString()] || 0,
              averageRating: reviewSummary.averageRating,
              totalReviews: reviewSummary.totalReviews,
              starCounts: reviewSummary.starCounts,
              reviews: reviewSummary.reviews,
            });
          }),
        ),
      );
      console.log("===== END getSuggestedCarsFromDB =====");
      return finalCars;
    },
  );
// =====================================================
// HELPER: CHECK IF CAR IS BOOKABLE FOR A DAY
// =====================================================
const isCarBookableForDay = (car, date) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const dayStart = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    // Manual full-day block
    const isManuallyBlocked =
      (_a = car.blockedDates) === null || _a === void 0
        ? void 0
        : _a.some((b) => {
            return (
              new Date(b.date).toISOString().split("T")[0] ===
              dayStart.toISOString().split("T")[0]
            );
          });
    if (isManuallyBlocked) return false;
    // AvailableDays check
    if (
      (_b = car.availableDays) === null || _b === void 0 ? void 0 : _b.length
    ) {
      const dayName = dayStart
        .toLocaleDateString("en-US", { weekday: "long" })
        .toUpperCase();
      if (!car.availableDays.includes(dayName)) return false;
    }
    // Booking overlap
    const bookingExists = yield booking_model_1.Booking.exists({
      carId: car._id,
      status: {
        $in: [
          booking_interface_1.BOOKING_STATUS.PAID,
          booking_interface_1.BOOKING_STATUS.ONGOING,
        ],
      },
      fromDate: { $lt: dayEnd },
      toDate: { $gt: dayStart },
    });
    return !bookingExists;
  });
const getCarsByDestinationFromDB = (destinationId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    // destination find
    const destination =
      yield destination_model_1.Destination.findById(destinationId);
    if (!destination) {
      throw new ApiErrors_1.default(404, "Destination not found");
    }
    // cars by city (basic + fast)
    const result = yield car_model_1.Car.find({
      city: destination.city,
      isActive: true,
      verificationStatus: car_interface_1.CAR_VERIFICATION_STATUS.APPROVED,
    }).sort({ createdAt: -1 });
    return result;
  });
exports.CarServices = {
  createCarToDB,
  getAllCarsFromDB,
  getOwnCarsFromDB,
  getCarByIdFromDB,
  updateCarByIdToDB,
  deleteCarByIdFromDB,
  getAvailability,
  createCarBlockedDatesToDB,
  getAllCarsForVerificationsFromDB,
  updateCarVerificationStatusByIdToDB,
  getSuggestedCarsFromDB,
  getRecentCarsFromDB,
  getCarsByDestinationFromDB,
};
