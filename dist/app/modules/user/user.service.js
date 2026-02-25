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
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (
          e.indexOf(p[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(s, p[i])
        )
          t[p[i]] = s[p[i]];
      }
    return t;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_1 = require("../../../enums/user");
const user_model_1 = require("./user.model");
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const unlinkFile_1 = __importDefault(require("../../../shared/unlinkFile"));
const jwtHelper_1 = require("../../../helpers/jwtHelper");
const config_1 = __importDefault(require("../../../config"));
const queryBuilder_1 = __importDefault(require("../../builder/queryBuilder"));
const mongoose_1 = require("mongoose");
const afrikSms_service_1 = require("../../../helpers/afrikSms.service");
const car_utils_1 = require("../car/car.utils");
const smsLog_model_1 = require("../smsLog/smsLog.model");
const createAdminToDB = (payload) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (payload.phone) {
      delete payload.phone;
    }
    // check admin is exist or not;
    const isExistAdmin = yield user_model_1.User.findOne({
      email: payload.email,
    });
    if (isExistAdmin) {
      throw new ApiErrors_1.default(
        http_status_codes_1.StatusCodes.CONFLICT,
        "This Email already taken",
      );
    }
    // create admin to db
    const createAdmin = yield user_model_1.User.create(payload);
    if (!createAdmin) {
      throw new ApiErrors_1.default(
        http_status_codes_1.StatusCodes.BAD_REQUEST,
        "Failed to create Admin",
      );
    } else {
      yield user_model_1.User.findByIdAndUpdate(
        {
          _id:
            createAdmin === null || createAdmin === void 0
              ? void 0
              : createAdmin._id,
        },
        { verified: true },
        { new: true },
      );
    }
    return createAdmin;
  });
const getAdminFromDB = (query) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const baseQuery = user_model_1.User.find({
      role: { $in: [user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN] },
    }).select(
      "firstName lastName email role profileImage createdAt updatedAt status",
    );
    const queryBuilder = new queryBuilder_1.default(baseQuery, query)
      .search(["firstName", "lastName", "fullName", "email"])
      .sort()
      .fields()
      .paginate();
    const admins = yield queryBuilder.modelQuery;
    const meta = yield queryBuilder.countTotal();
    return {
      data: admins,
      meta,
    };
  });
const deleteAdminFromDB = (id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const isExistAdmin = yield user_model_1.User.findByIdAndDelete(id);
    if (!isExistAdmin) {
      throw new ApiErrors_1.default(
        http_status_codes_1.StatusCodes.BAD_REQUEST,
        "Failed to delete Admin",
      );
    }
    return isExistAdmin;
  });
// const createUserToDB = async (payload: Partial<IUser>) => {
//   const requiredFields = [
//     "firstName",
//     "lastName",
//     "countryCode",
//     "dateOfBirth",
//     "phone",
//     "password",
//   ];
//   const missingFields = requiredFields.filter(
//     (field) => !payload[field as keyof IUser],
//   );
//   if (missingFields.length > 0) {
//     throw new ApiError(
//       400,
//       `Missing required fields: ${missingFields.join(", ")}`,
//     );
//   }
//   const createUser = await User.create(payload);
//   console.log(payload, "Payload");
//   if (!createUser)
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create user");
//   // Send OTP using Twilio Verify
//   await twilioService.sendOTPWithVerify(
//     createUser.phone,
//     createUser.countryCode,
//   );
//   const createToken = jwtHelper.createToken(
//     {
//       id: createUser._id,
//       phone: createUser.phone,
//       role: createUser.role,
//     },
//     config.jwt.jwt_secret as Secret,
//     config.jwt.jwt_expire_in as string,
//   );
//   const result = {
//     token: createToken,
//     user: createUser,
//   };
//   return result;
// };
// const createUserToDB = async (payload: Partial<IUser>) => {
//   const requiredFields = [
//     // "firstName",
//     "countryCode",
//     "phone",
//     // "password",
//   ];
//   const missingFields = requiredFields.filter(
//     (field) => !payload[field as keyof IUser]
//   );
//   if (missingFields.length > 0) {
//     throw new ApiError(400, `Missing required fields: ${missingFields.join(", ")}`);
//   }
//   // generate numeric OTP
//   const otp = afrikSmsService.generateOTP();
//   const expireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
//   payload.authentication = {
//     oneTimeCode: otp,
//     expireAt: expireAt,
//     isResetPassword: false
//   };
//   const createUser = await User.create(payload);
//   if (!createUser)
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create user");
//   const smsMessage = `Your verification code is ${otp}. Valid for 5 minutes.`;
//   try {
//     await afrikSmsService.sendSMS(
//       createUser.phone,
//       createUser.countryCode,
//       smsMessage
//     );
//   } catch (error) {
//     console.error("SMS Sending failed:", error);
//   }
//   const createToken = jwtHelper.createToken(
//     {
//       id: createUser._id,
//       phone: createUser.phone,
//       role: createUser.role,
//     },
//     config.jwt.jwt_secret as Secret,
//     config.jwt.jwt_expire_in as string,
//   );
//   return {
//     token: createToken,
//     user: createUser,
//   };
// };
const createUserToDB = (payload) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const requiredFields = ["countryCode", "phone"];
    const missingFields = requiredFields.filter((field) => !payload[field]);
    if (missingFields.length > 0) {
      throw new ApiErrors_1.default(
        400,
        `Missing required fields: ${missingFields.join(", ")}`,
      );
    }
    const otp = afrikSms_service_1.afrikSmsService.generateOTP();
    const expireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    payload.authentication = {
      oneTimeCode: otp,
      expireAt,
      isResetPassword: false,
    };
    const createUser = yield user_model_1.User.create(payload);
    if (!createUser)
      throw new ApiErrors_1.default(
        http_status_codes_1.StatusCodes.BAD_REQUEST,
        "Failed to create user",
      );
    const smsMessage = `Your verification code is ${otp}. Valid for 5 minutes.`;
    try {
      // Send SMS + save log
      const smsLog = yield afrikSms_service_1.afrikSmsService.sendSMS(
        createUser.phone,
        createUser.countryCode,
        smsMessage,
        createUser._id.toString(),
      );
      // optionally save in DB if you want separate log collection
      yield smsLog_model_1.SMSLog.create(smsLog);
    } catch (error) {
      console.error("SMS sending failed:", error);
    }
    const createToken = jwtHelper_1.jwtHelper.createToken(
      { id: createUser._id, phone: createUser.phone, role: createUser.role },
      config_1.default.jwt.jwt_secret,
      config_1.default.jwt.jwt_expire_in,
    );
    return {
      token: createToken,
      user: createUser,
    };
  });
const getUserProfileFromDB = (user) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield user_model_1.User.isExistUserById(id);
    if (!isExistUser) {
      throw new ApiErrors_1.default(
        http_status_codes_1.StatusCodes.BAD_REQUEST,
        "User doesn't exist!",
      );
    }
    return isExistUser;
  });
const updateProfileToDB = (user, payload) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield user_model_1.User.isExistUserById(id);
    if (!isExistUser) {
      throw new ApiErrors_1.default(
        http_status_codes_1.StatusCodes.BAD_REQUEST,
        "User doesn't exist!",
      );
    }
    //unlink file here
    if (payload.profileImage && isExistUser.profileImage) {
      (0, unlinkFile_1.default)(isExistUser.profileImage);
    }
    const updateDoc = yield user_model_1.User.findOneAndUpdate(
      { _id: id },
      payload,
      {
        new: true,
      },
    );
    return updateDoc;
  });
const switchProfileToDB = (userId, role) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user)
      throw new ApiErrors_1.default(
        404,
        "This user is not found in the database",
      );
    if (![user_1.USER_ROLES.USER, user_1.USER_ROLES.HOST].includes(role))
      throw new ApiErrors_1.default(
        400,
        "Role is must be either 'USER' or 'HOST'",
      );
    // if (role === USER_ROLES.HOST && user.hostStatus !== HOST_STATUS.APPROVED) {
    //   throw new ApiError(400, "User cannot switch to host before admin approval");
    // }
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    );
    if (!updatedUser)
      throw new ApiErrors_1.default(400, "Failed to update role");
    const createToken = jwtHelper_1.jwtHelper.createToken(
      {
        id: updatedUser._id,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
      config_1.default.jwt.jwt_secret,
      config_1.default.jwt.jwt_expire_in,
    );
    const result = {
      token: createToken,
      user: updatedUser,
    };
    return result;
  });
const createHostRequestToDB = (userId, payload) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user)
      throw new ApiErrors_1.default(404, "No user is found for this ID");
    if (user.hostStatus === user_1.HOST_STATUS.APPROVED)
      throw new ApiErrors_1.default(400, "User is already a host");
    if (!payload.nidFrontPic || !payload.nidBackPic) {
      throw new ApiErrors_1.default(
        400,
        "Nid front picture and nid back picture is required",
      );
    }
    if (!payload.drivingLicenseFrontPic || !payload.drivingLicenseBackPic) {
      throw new ApiErrors_1.default(
        400,
        "Driving license front and back picture is required",
      );
    }
    user.nidFrontPic = payload.nidFrontPic;
    user.nidBackPic = payload.nidBackPic;
    if (payload.drivingLicenseFrontPic)
      user.drivingLicenseFrontPic = payload.drivingLicenseFrontPic;
    if (payload.drivingLicenseBackPic)
      user.drivingLicenseBackPic = payload.drivingLicenseBackPic;
    // host PENDING
    user.hostStatus = user_1.HOST_STATUS.PENDING;
    yield user.save();
    return user;
  });
const getAllHostRequestsFromDB = (query) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const baseQuery = user_model_1.User.find({
      hostStatus: {
        $in: [
          user_1.HOST_STATUS.PENDING,
          user_1.HOST_STATUS.APPROVED,
          user_1.HOST_STATUS.REJECTED,
        ],
      },
    });
    const queryBuilder = new queryBuilder_1.default(baseQuery, query)
      .search(["firstName", "lastName", "fullName", "email", "phone"])
      .sort()
      .fields()
      .filter()
      .paginate();
    const hosts = yield queryBuilder.modelQuery;
    const meta = yield queryBuilder.countTotal();
    if (!hosts)
      throw new ApiErrors_1.default(
        404,
        "Host requests are not found in the database",
      );
    return {
      data: hosts,
      meta,
    };
  });
const getHostRequestByIdFromDB = (id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findOne({
      _id: id,
      hostStatus: {
        $in: [
          user_1.HOST_STATUS.PENDING,
          user_1.HOST_STATUS.APPROVED,
          user_1.HOST_STATUS.REJECTED,
        ],
      },
    });
    if (!result)
      throw new ApiErrors_1.default(
        404,
        "No host request is found in the database by this ID",
      );
    return result;
  });
const changeHostRequestStatusByIdFromDB = (id, hostStatus) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({
      _id: id,
      hostStatus: {
        $in: [
          user_1.HOST_STATUS.PENDING,
          user_1.HOST_STATUS.APPROVED,
          user_1.HOST_STATUS.REJECTED,
        ],
      },
    });
    const userId = user === null || user === void 0 ? void 0 : user._id;
    if (!user)
      throw new ApiErrors_1.default(
        404,
        "No user is found host requst by this ID",
      );
    const result = yield user_model_1.User.findByIdAndUpdate(
      userId,
      { hostStatus },
      { new: true },
    );
    if (!result)
      throw new ApiErrors_1.default(
        404,
        "Failed to change host request status",
      );
    return result;
  });
const deleteHostRequestByIdFromDB = (id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    console.log(user, "USER");
    if (!user)
      throw new ApiErrors_1.default(404, "No user is found by this ID");
    if (
      (user === null || user === void 0 ? void 0 : user.hostStatus) ===
      user_1.HOST_STATUS.NONE
    )
      throw new ApiErrors_1.default(404, "No host request found by this ID");
    user.hostStatus = user_1.HOST_STATUS.NONE;
    user.nidFrontPic = "";
    user.nidBackPic = "";
    if (user.drivingLicenseFrontPic) user.drivingLicenseFrontPic = "";
    if (user.drivingLicenseBackPic) user.drivingLicenseBackPic = "";
    yield user.save();
    return user;
  });
const getAllUsersFromDB = (query) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const baseQuery = user_model_1.User.find({
      hostStatus: user_1.HOST_STATUS.NONE,
      role: user_1.USER_ROLES.USER,
    });
    const queryBuilder = new queryBuilder_1.default(baseQuery, query)
      .search(["firstName", "lastName", "fullName", "email", "phone"])
      .sort()
      .fields()
      .filter()
      .paginate();
    const users = yield queryBuilder.modelQuery;
    const meta = yield queryBuilder.countTotal();
    if (!users)
      throw new ApiErrors_1.default(404, "No users are found in the database");
    return {
      data: users,
      meta,
    };
  });
const getUserByIdFromDB = (id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findOne({
      _id: id,
      hostStatus: user_1.HOST_STATUS.NONE,
      role: user_1.USER_ROLES.USER,
    });
    if (!result)
      throw new ApiErrors_1.default(
        404,
        "No user is found in the database by this ID",
      );
    return result;
  });
const updateUserStatusByIdToDB = (id, status) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (![user_1.STATUS.ACTIVE, user_1.STATUS.INACTIVE].includes(status)) {
      throw new ApiErrors_1.default(
        400,
        "Status must be either 'ACTIVE' or 'INACTIVE'",
      );
    }
    const user = yield user_model_1.User.findOne({
      _id: id,
      role: user_1.USER_ROLES.USER,
      hostStatus: user_1.HOST_STATUS.NONE,
    });
    if (!user) {
      throw new ApiErrors_1.default(404, "No user is found by this user ID");
    }
    const result = yield user_model_1.User.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!result) {
      throw new ApiErrors_1.default(
        400,
        "Failed to change status by this user ID",
      );
    }
    return result;
  });
const updateAdminStatusByIdToDB = (id, status) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (![user_1.STATUS.ACTIVE, user_1.STATUS.INACTIVE].includes(status)) {
      throw new ApiErrors_1.default(
        400,
        "Status must be either 'ACTIVE' or 'INACTIVE'",
      );
    }
    const user = yield user_model_1.User.findOne({
      _id: id,
      role: user_1.USER_ROLES.ADMIN,
    });
    if (!user) {
      throw new ApiErrors_1.default(404, "No admin is found by this user ID");
    }
    const result = yield user_model_1.User.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!result) {
      throw new ApiErrors_1.default(
        400,
        "Failed to change status by this user ID",
      );
    }
    return result;
  });
const deleteUserByIdFromD = (id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({
      _id: id,
      hostStatus: user_1.HOST_STATUS.NONE,
      role: user_1.USER_ROLES.USER,
    });
    if (!user) {
      throw new ApiErrors_1.default(
        404,
        "User doest not exist in the database",
      );
    }
    const result = yield user_model_1.User.findByIdAndDelete(id);
    if (!result) {
      throw new ApiErrors_1.default(400, "Failed to delete user by this ID");
    }
    return result;
  });
const deleteProfileFromDB = (id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.User.isExistUserById(id);
    if (!isExistUser) {
      throw new ApiErrors_1.default(
        http_status_codes_1.StatusCodes.BAD_REQUEST,
        "User doesn't exist!",
      );
    }
    const result = yield user_model_1.User.findByIdAndDelete(id);
    if (!result) {
      throw new ApiErrors_1.default(400, "Failed to delete this user");
    }
    return result;
  });
// const getAllHostsFromDB = async (query: any) => {
//   const baseQuery = User.find({ hostStatus: HOST_STATUS.APPROVED });
//   const queryBuilder = new QueryBuilder(baseQuery, query)
//   .search(["firstName", "lastName", "fullName", "email", "phone"])
//   .sort()
//   .fields()
//   .filter()
//   .paginate();
//   const hosts = await queryBuilder.modelQuery;
//   const meta = await queryBuilder.countTotal();
//   if (!hosts) throw new ApiError(404, "No hosts are found in the database");
//   return {
//     data: hosts,
//     meta,
//   };
// };
const getAllHostsFromDB = (query) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const { searchTerm, sortBy = "createdAt", sortOrder = "desc" } = query,
      filters = __rest(query, ["searchTerm", "sortBy", "sortOrder"]);
    /* -------------------- MATCH (BASE FILTER) -------------------- */
    const matchStage = {
      hostStatus: user_1.HOST_STATUS.APPROVED,
    };
    /* -------------------- SEARCH -------------------- */
    if (searchTerm) {
      matchStage.$or = [
        { firstName: { $regex: searchTerm, $options: "i" } },
        { lastName: { $regex: searchTerm, $options: "i" } },
        { fullName: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
      ];
    }
    /* -------------------- FILTER -------------------- */
    Object.keys(filters).forEach((key) => {
      if (!["page", "limit", "search", "sortBy", "sortOrder"].includes(key)) {
        matchStage[key] = filters[key];
      }
    });
    /* -------------------- SORT -------------------- */
    const sortStage = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };
    /* -------------------- PIPELINE -------------------- */
    const pipeline = [
      { $match: matchStage },
      /* Join cars */
      {
        $lookup: {
          from: "cars",
          localField: "_id",
          foreignField: "userId",
          as: "cars",
        },
      },
      /*  Filter cars + count */
      {
        $addFields: {
          cars: {
            $filter: {
              input: "$cars",
              as: "car",
              cond: {
                $and: [
                  { $eq: ["$$car.verificationStatus", "APPROVED"] },
                  { $eq: ["$$car.isActive", true] },
                ],
              },
            },
          },
          totalCars: {
            $size: {
              $filter: {
                input: "$cars",
                as: "car",
                cond: {
                  $and: [
                    { $eq: ["$$car.verificationStatus", "APPROVED"] },
                    { $eq: ["$$car.isActive", true] },
                  ],
                },
              },
            },
          },
        },
      },
      /* Sort */
      { $sort: sortStage },
      /*  Pagination */
      { $skip: skip },
      { $limit: limit },
      /*  Cleanup */
      {
        $project: {
          password: 0,
          __v: 0,
        },
      },
    ];
    const data = yield user_model_1.User.aggregate(pipeline);
    /* -------------------- META COUNT -------------------- */
    const total = yield user_model_1.User.countDocuments(matchStage);
    if (!data.length) {
      throw new ApiErrors_1.default(404, "No hosts found");
    }
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
    };
  });
// const getHostByIdFromDB = async (id: string) => {
//   const result = await User.findOne({
//     _id: id,
//     hostStatus: HOST_STATUS.APPROVED,
//   });
//   if (!result)
//     throw new ApiError(404, "No host is found in the database by this ID");
//   return result;
// };
const getHostByIdFromDB = (id) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
      throw new ApiErrors_1.default(400, "Invalid host ID");
    }
    const pipeline = [
      {
        $match: {
          _id: new mongoose_1.Types.ObjectId(id),
          hostStatus: user_1.HOST_STATUS.APPROVED,
        },
      },
      /*  Join cars */
      {
        $lookup: {
          from: "cars",
          localField: "_id",
          foreignField: "userId",
          as: "cars",
        },
      },
      /* Filter approved + active cars */
      {
        $addFields: {
          cars: {
            $filter: {
              input: "$cars",
              as: "car",
              cond: {
                $and: [
                  { $eq: ["$$car.verificationStatus", "APPROVED"] },
                  { $eq: ["$$car.isActive", true] },
                ],
              },
            },
          },
          totalCars: {
            $size: {
              $filter: {
                input: "$cars",
                as: "car",
                cond: {
                  $and: [
                    { $eq: ["$$car.verificationStatus", "APPROVED"] },
                    { $eq: ["$$car.isActive", true] },
                  ],
                },
              },
            },
          },
        },
      },
      /*  Cleanup */
      {
        $project: {
          password: 0,
          __v: 0,
        },
      },
    ];
    const result = yield user_model_1.User.aggregate(pipeline);
    if (!result.length) {
      throw new ApiErrors_1.default(
        404,
        "No host is found in the database by this ID",
      );
    }
    return result[0];
  });
// const getHostDetailsByIdFromDB = async (id: string) => {
//   if (!Types.ObjectId.isValid(id)) {
//     throw new ApiError(400, "Invalid host ID");
//   }
//   const pipeline: PipelineStage[] = [
//     {
//       $match: {
//         _id: new Types.ObjectId(id),
//         hostStatus: HOST_STATUS.APPROVED,
//       },
//     },
//     /* Join Cars & Reviews */
//     {
//       $lookup: {
//         from: "cars",
//         localField: "_id",
//         foreignField: "userId",
//         as: "cars",
//       },
//     },
//     {
//       $lookup: {
//         from: "reviews",
//         let: { host_id: "$_id" },
//         pipeline: [
//           { $match: { $expr: { $eq: ["$hostId", "$$host_id"] } } },
//           { $sort: { createdAt: -1 } },
//           {
//             $lookup: {
//               from: "users",
//               localField: "fromUserId",
//               foreignField: "_id",
//               as: "fromUser"
//             }
//           },
//           { $unwind: "$fromUser" },
//           {
//             $project: {
//               reviewId: "$_id",
//               ratingValue: 1,
//               feedback: 1,
//               fromUser: {
//                 _id: 1,
//                 firstName: 1,
//                 lastName: 1,
//                 role: 1,
//                 email: 1,
//                 phone: 1,
//                 profileImage: 1,
//                 location: 1,
//               }
//             }
//           }
//         ],
//         as: "reviews",
//       },
//     },
//     /*  Calculation Stage (Filter & Stats) */
//     {
//       $addFields: {
//         cars: {
//           $filter: {
//             input: "$cars",
//             as: "car",
//             cond: {
//               $and: [
//                 { $eq: ["$$car.verificationStatus", "APPROVED"] },
//                 { $eq: ["$$car.isActive", true] },
//               ],
//             },
//           },
//         },
//         totalReviews: { $size: "$reviews" },
//         averageRating: {
//           $cond: [
//             { $gt: [{ $size: "$reviews" }, 0] },
//             { $round: [{ $avg: "$reviews.ratingValue" }, 1] },
//             0
//           ]
//         },
//         starCounts: {
//           "1": { $size: { $filter: { input: "$reviews", as: "r", cond: { $eq: ["$$r.ratingValue", 1] } } } },
//           "2": { $size: { $filter: { input: "$reviews", as: "r", cond: { $eq: ["$$r.ratingValue", 2] } } } },
//           "3": { $size: { $filter: { input: "$reviews", as: "r", cond: { $eq: ["$$r.ratingValue", 3] } } } },
//           "4": { $size: { $filter: { input: "$reviews", as: "r", cond: { $eq: ["$$r.ratingValue", 4] } } } },
//           "5": { $size: { $filter: { input: "$reviews", as: "r", cond: { $eq: ["$$r.ratingValue", 5] } } } },
//         }
//       },
//     },
//     /*  Get total count of filtered cars */
//     {
//       $addFields: {
//         totalCars: { $size: "$cars" }
//       }
//     },
//     //  strict projection
//     {
//       $project: {
//         _id: 1,
//         firstName: 1,
//         lastName: 1,
//         countryCode: 1,
//         phone: 1,
//         hostStatus: 1,
//         location: 1,
//         cars: 1,
//         totalCars: 1,
//         totalReviews: 1,
//         averageRating: 1,
//         starCounts: 1,
//         reviews: 1,
//       },
//     },
//   ];
//   const result = await User.aggregate(pipeline);
//   if (!result.length) {
//     throw new ApiError(404, "No host is found in the database by this ID");
//   }
//   return result[0];
// };
// Updated function signature to accept location context
const getHostDetailsByIdFromDB = (id, visitorId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
      throw new ApiErrors_1.default(400, "Invalid host ID");
    }
    // 1. Get the visitor's location (same logic as getAllCars)
    const { lat, lng } = yield (0, car_utils_1.getTargetLocation)(
      undefined,
      undefined,
      visitorId,
    );
    const pipeline = [
      // 2. $geoNear MUST be first. It calculates distance and filters by ID simultaneously.
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distance", // This adds the distance field
          spherical: true,
          query: {
            _id: new mongoose_1.Types.ObjectId(id),
            hostStatus: user_1.HOST_STATUS.APPROVED,
          },
        },
      },
      /* Join Cars & Reviews */
      {
        $lookup: {
          from: "cars",
          localField: "_id",
          foreignField: "userId",
          as: "cars",
        },
      },
      {
        $lookup: {
          from: "reviews",
          let: { host_id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$hostId", "$$host_id"] } } },
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: "users",
                localField: "fromUserId",
                foreignField: "_id",
                as: "fromUser",
              },
            },
            { $unwind: "$fromUser" },
            {
              $project: {
                reviewId: "$_id",
                ratingValue: 1,
                feedback: 1,
                createdAt: 1,
                fromUser: {
                  _id: 1,
                  firstName: 1,
                  lastName: 1,
                  role: 1,
                  email: 1,
                  phone: 1,
                  profileImage: 1,
                  location: 1,
                },
              },
            },
          ],
          as: "reviews",
        },
      },
      /* Calculation Stage */
      {
        $addFields: {
          // Convert distance from meters to kilometers (and fix to 1 decimal)
          distance: {
            $concat: [
              { $toString: { $round: [{ $divide: ["$distance", 1000] }, 1] } },
              // " km"
            ],
          },
          cars: {
            $filter: {
              input: "$cars",
              as: "car",
              cond: {
                $and: [
                  { $eq: ["$$car.verificationStatus", "APPROVED"] },
                  { $eq: ["$$car.isActive", true] },
                ],
              },
            },
          },
          totalReviews: { $size: "$reviews" },
          averageRating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $round: [{ $avg: "$reviews.ratingValue" }, 1] },
              0,
            ],
          },
          starCounts: {
            1: {
              $size: {
                $filter: {
                  input: "$reviews",
                  as: "r",
                  cond: { $eq: ["$$r.ratingValue", 1] },
                },
              },
            },
            2: {
              $size: {
                $filter: {
                  input: "$reviews",
                  as: "r",
                  cond: { $eq: ["$$r.ratingValue", 2] },
                },
              },
            },
            3: {
              $size: {
                $filter: {
                  input: "$reviews",
                  as: "r",
                  cond: { $eq: ["$$r.ratingValue", 3] },
                },
              },
            },
            4: {
              $size: {
                $filter: {
                  input: "$reviews",
                  as: "r",
                  cond: { $eq: ["$$r.ratingValue", 4] },
                },
              },
            },
            5: {
              $size: {
                $filter: {
                  input: "$reviews",
                  as: "r",
                  cond: { $eq: ["$$r.ratingValue", 5] },
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          totalCars: { $size: "$cars" },
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          countryCode: 1,
          phone: 1,
          hostStatus: 1,
          location: 1,
          distance: 1, // Include distance in final output
          cars: 1,
          totalCars: 1,
          totalReviews: 1,
          averageRating: 1,
          starCounts: 1,
          reviews: 1,
        },
      },
    ];
    const result = yield user_model_1.User.aggregate(pipeline);
    if (!result.length) {
      throw new ApiErrors_1.default(
        404,
        "No host is found in the database by this ID",
      );
    }
    return result[0];
  });
const updateHostStatusByIdToDB = (id, status) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (![user_1.STATUS.ACTIVE, user_1.STATUS.INACTIVE].includes(status)) {
      throw new ApiErrors_1.default(
        400,
        "Status must be either 'ACTIVE' or 'INACTIVE'",
      );
    }
    const host = yield user_model_1.User.findOne({
      _id: id,
      hostStatus: user_1.HOST_STATUS.APPROVED,
    });
    if (!host) {
      throw new ApiErrors_1.default(404, "No host is found by this host ID");
    }
    const result = yield user_model_1.User.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!result) {
      throw new ApiErrors_1.default(
        400,
        "Failed to change status by this host ID",
      );
    }
    return result;
  });
exports.UserService = {
  createUserToDB,
  getAdminFromDB,
  deleteAdminFromDB,
  getUserProfileFromDB,
  updateProfileToDB,
  createAdminToDB,
  switchProfileToDB,
  createHostRequestToDB,
  getAllHostRequestsFromDB,
  getHostRequestByIdFromDB,
  changeHostRequestStatusByIdFromDB,
  deleteHostRequestByIdFromDB,
  getAllUsersFromDB,
  getUserByIdFromDB,
  updateUserStatusByIdToDB,
  updateAdminStatusByIdToDB,
  deleteUserByIdFromD,
  deleteProfileFromDB,
  getAllHostsFromDB,
  getHostByIdFromDB,
  updateHostStatusByIdToDB,
  getHostDetailsByIdFromDB,
};
