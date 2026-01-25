"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_controller_1 = require("./auth.controller");
const auth_validation_1 = require("./auth.validation");
const router = express_1.default.Router();
// login
router.post("/login", (0, validateRequest_1.default)(auth_validation_1.AuthValidation.createLoginZodSchema), auth_controller_1.AuthController.loginUser);
// forgot Password (Send OTP)
router.post("/forget-password", (0, validateRequest_1.default)(auth_validation_1.AuthValidation.createForgetPasswordZodSchema), auth_controller_1.AuthController.forgetPassword);
// refresh Token
router.post("/refresh-token", auth_controller_1.AuthController.newAccessToken);
// resend OTP (Phone)
router.post("/resend-otp", (0, validateRequest_1.default)(auth_validation_1.AuthValidation.createResendOTPSchema), auth_controller_1.AuthController.resendPhoneOTP);
// verify Phone OTP
router.post("/verify-phone", (0, validateRequest_1.default)(auth_validation_1.AuthValidation.createVerifyPhoneZodSchema), auth_controller_1.AuthController.verifyPhone);
// reset Password
router.post("/reset-password", (0, validateRequest_1.default)(auth_validation_1.AuthValidation.createResetPasswordZodSchema), auth_controller_1.AuthController.resetPassword);
// change Password
router.post("/change-password", (0, auth_1.default)(user_1.USER_ROLES.SUPER_ADMIN, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.USER, user_1.USER_ROLES.HOST), (0, validateRequest_1.default)(auth_validation_1.AuthValidation.createChangePasswordZodSchema), auth_controller_1.AuthController.changePassword);
// delete Account
router.delete("/delete-account", (0, auth_1.default)(user_1.USER_ROLES.ADMIN), auth_controller_1.AuthController.deleteUser);
exports.AuthRoutes = router;
