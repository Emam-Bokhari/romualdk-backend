import { USER_ROLES } from "../../../enums/user";
import { IUser } from "./user.interface";
import { JwtPayload, Secret } from "jsonwebtoken";
import { User } from "./user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import unlinkFile from "../../../shared/unlinkFile";
import { twilioService } from "../twilioService/sendOtpWithVerify";
import { jwtHelper } from "../../../helpers/jwtHelper";
import config from "../../../config";

const createAdminToDB = async (payload: any): Promise<IUser> => {

    // check admin is exist or not;
    const isExistAdmin = await User.findOne({ email: payload.email });
    if (isExistAdmin) {
        throw new ApiError(StatusCodes.CONFLICT, "This Email already taken");
    }

    // create admin to db
    const createAdmin = await User.create(payload);
    if (!createAdmin) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Admin");
    } else {
        await User.findByIdAndUpdate(
            { _id: createAdmin?._id },
            { verified: true },
            { new: true }
        );
    }

    return createAdmin;
};

const createUserToDB = async (payload: Partial<IUser>) => {

    const createUser = await User.create(payload);
    console.log(payload, "Payload")
    if (!createUser) throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');

    // Send OTP using Twilio Verify
    await twilioService.sendOTPWithVerify(createUser.phone, createUser.countryCode);

    const createToken = jwtHelper.createToken(
        {
            id: createUser._id,
            email: createUser.email,
            role: createUser.role,
        },
        config.jwt.jwt_secret as Secret,
        config.jwt.jwt_expire_in as string
    );

    const result = {
        token: createToken,
        user: createUser,
    };

    return result;

};


const getUserProfileFromDB = async (user: JwtPayload): Promise<Partial<IUser>> => {
    const { id } = user;
    const isExistUser: any = await User.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    return isExistUser;
};

const updateProfileToDB = async (
    user: JwtPayload,
    payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
    const { id } = user;
    const isExistUser = await User.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    //unlink file here
    if (payload.profileImage && isExistUser.profileImage) {
        unlinkFile(isExistUser.profileImage);
    }

    const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    });
    return updateDoc;
};

export const UserService = {
    createUserToDB,
    getUserProfileFromDB,
    updateProfileToDB,
    createAdminToDB
};