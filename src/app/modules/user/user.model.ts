// import { model, Schema } from "mongoose";
// import { GENDER, HOST_STATUS, STATUS, USER_ROLES } from "../../../enums/user";
// import { IUser, UserModal } from "./user.interface";
// import bcrypt from "bcrypt";
// import ApiError from "../../../errors/ApiErrors";
// import { StatusCodes } from "http-status-codes";
// import config from "../../../config";

// const userSchema = new Schema<IUser, UserModal>(
//   {
//     firstName: {
//       type: String,
//       required: true,
//     },
//     lastName: {
//       type: String,
//       required: true,
//     },
//     role: {
//       type: String,
//       enum: Object.values(USER_ROLES),
//       required: true,
//     },
//     hostStatus: {
//       type: String,
//       enum: Object.values(HOST_STATUS),
//       default: HOST_STATUS.NONE,
//     },
//     phone: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     countryCode: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: false,
//       unique: false,
//       lowercase: true,
//     },
//     profileImage: {
//       type: String,
//       required: false,
//       default: "",
//     },
//     nidFrontPic: {
//       type: String,
//       default: "",
//     },
//     nidBackPic: {
//       type: String,
//       default: "",
//     },
//     drivingLicenseFrontPic: {
//       type: String,
//       required: false,
//     },
//     drivingLicenseBackPic: {
//       type: String,
//       required: false,
//     },
//     password: {
//       type: String,
//       required: false,
//       select: 0,
//       minlength: 8,
//     },
//     dateOfBirth: {
//       type: String,
//       required: true,
//     },
//     gender: {
//       type: String,
//       enum: Object.values(GENDER),
//       required: false,
//     },
//     lastSmsResourceId: {
//       type: String,
//       required: false,
//     },
//     isOtpDelivered: {
//       type: Boolean,
//       default: false,
//     },
//     city: {
//       type: String,
//       required: false,
//     },
//     country: {
//       type: String,
//       required: false,
//     },
//     status: {
//       type: String,
//       enum: Object.values(STATUS),
//       default: STATUS.ACTIVE,
//     },
//     verified: {
//       type: Boolean,
//       default: false,
//     },
//     location: {
//       type: {
//         type: String,
//         enum: ["Point"],
//         default: "Point",
//       },
//       coordinates: {
//         type: [Number],
//         default: [0, 0],
//         index: "2dsphere",
//       },
//       address: {
//         type: String,
//         default: "",
//       },
//     },
//     // stripe ....
//     connectedAccountId: {
//       type: String,
//       required: false,
//       default: "",
//     },
//     onboardingCompleted: {
//       type: Boolean,
//       default: false,
//     },
//     payoutsEnabled: {
//       type: Boolean,
//       default: false,
//     },
//     // .... stripe
//     authentication: {
//       type: {
//         isResetPassword: {
//           type: Boolean,
//           default: false,
//         },
//         oneTimeCode: {
//           type: Number,
//           default: null,
//         },
//         expireAt: {
//           type: Date,
//           default: null,
//         },
//       },
//       select: 0,
//     },
//   },
//   {
//     timestamps: true,
//     versionKey: false,
//     toJSON: {
//       virtuals: true,
//       transform: (_doc, ret) => {
//         delete ret.id;
//         return ret;
//       },
//     },
//     toObject: {
//       virtuals: true,
//       transform: (_doc, ret) => {
//         delete ret.id;
//         return ret;
//       },
//     },
//   },
// );

// userSchema.virtual("fullName").get(function (this) {
//   return `${this.firstName} ${this.lastName}`;
// });

// //exist user check
// userSchema.statics.isExistUserById = async (id: string) => {
//   const isExist = await User.findById(id);
//   return isExist;
// };

// userSchema.statics.isExistUserByEmail = async (email: string) => {
//   const isExist = await User.findOne({ email });
//   return isExist;
// };

// //account check
// userSchema.statics.isAccountCreated = async (id: string) => {
//   const isUserExist: any = await User.findById(id);
//   return isUserExist.accountInformation.status;
// };

// //is match password
// userSchema.statics.isMatchPassword = async (
//   password: string,
//   hashPassword: string,
// ): Promise<boolean> => {
//   return await bcrypt.compare(password, hashPassword);
// };

// //check user
// userSchema.pre("save", async function (next) {
//   if (this.isNew) {
//     if (this.phone) {
//       const isExist = await User.findOne({ phone: this.phone });
//       if (isExist) {
//         throw new ApiError(
//           StatusCodes.BAD_REQUEST,
//           "Phone number already exists!",
//         );
//       }
//     }

//     // password hash
//     if (this.password) {
//       this.password = await bcrypt.hash(
//         this.password,
//         Number(config.bcrypt_salt_rounds),
//       );
//     }
//   } else {
//     if (this.isModified("password") && this.password) {
//       this.password = await bcrypt.hash(
//         this.password,
//         Number(config.bcrypt_salt_rounds),
//       );
//     }
//   }
//   next();
// });

// export const User = model<IUser, UserModal>("User", userSchema);

import { model, Schema } from "mongoose";
import { GENDER, HOST_STATUS, STATUS, USER_ROLES } from "../../../enums/user";
import { IUser, UserModal } from "./user.interface";
import bcrypt from "bcrypt";
import config from "../../../config";

const authenticationSchema = new Schema(
  {
    isResetPassword: {
      type: Boolean,
      default: false,
    },
    oneTimeCode: {
      type: Number,
      default: null,
    },
    expireAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const userSchema = new Schema<IUser, UserModal>(
  {
    firstName: {
      type: String,
      required: function () {
        return this.role !== USER_ROLES.ADMIN;
      },
    },

    lastName: {
      type: String,
      required: function () {
        return this.role !== USER_ROLES.ADMIN;
      },
    },

    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },

    hostStatus: {
      type: String,
      enum: Object.values(HOST_STATUS),
      default: HOST_STATUS.NONE,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      required: function () {
        return this.role !== USER_ROLES.ADMIN;
      },
    },

    countryCode: {
      type: String,
      required: function () {
        return this.role !== USER_ROLES.ADMIN;
      },
    },

    email: {
      type: String,
      lowercase: true,
      unique: true,
      sparse: true,
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    nidFrontPic: {
      type: String,
      default: "",
    },

    nidBackPic: {
      type: String,
      default: "",
    },

    drivingLicenseFrontPic: String,
    drivingLicenseBackPic: String,

    password: {
      type: String,
      select: 0,
      minlength: 8,
    },

    dateOfBirth: {
      type: String,
      required: function () {
        return this.role !== USER_ROLES.ADMIN;
      },
    },

    gender: {
      type: String,
      enum: Object.values(GENDER),
    },

    lastSmsResourceId: String,

    isOtpDelivered: {
      type: Boolean,
      default: false,
    },

    city: String,
    country: String,

    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
      index: true,
    },

    verified: {
      type: Boolean,
      default: false,
      index: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: undefined,
        index: "2dsphere",
      },
      address: {
        type: String,
        default: "",
      },
    },

    // Stripe
    connectedAccountId: {
      type: String,
      default: "",
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    payoutsEnabled: {
      type: Boolean,
      default: false,
    },

    authentication: {
      type: authenticationSchema,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.id;
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.id;
        delete ret.password;
        return ret;
      },
    },
  },
);

// =========================
// Virtual
// =========================
userSchema.virtual("fullName").get(function () {
  return `${this.firstName ?? ""} ${this.lastName ?? ""}`.trim();
});

// =========================
// Static Methods
// =========================
userSchema.statics.isExistUserById = async function (id: string) {
  return await this.findById(id);
};

userSchema.statics.isExistUserByEmail = async function (email: string) {
  return await this.findOne({ email }).select("+password");
};

userSchema.statics.isMatchPassword = async function (
  password: string,
  hashPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashPassword);
};

// =========================
// Pre Save Hook
// =========================
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds),
    );
  }
  next();
});

export const User = model<IUser, UserModal>("User", userSchema);
