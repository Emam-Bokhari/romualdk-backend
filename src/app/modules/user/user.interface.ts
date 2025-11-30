import { Model, Types } from 'mongoose';
import { GENDER, USER_ROLES } from '../../../enums/user';


export type IUser = {
    firstName: string;
    lastName: string;
    role: USER_ROLES;
    countryCode: string;
    phone: string;
    email?: string;
    profileImage?: string;
    password: string;
    dateOfBirth: string;
    gender?: GENDER;
    verified: boolean;
    authentication?: {
        isResetPassword: boolean;
        oneTimeCode: number;
        expireAt: Date;
    };
};

export type UserModal = {
    isExistUserById(id: string): any;
    isExistUserByEmail(email: string): any;
    isAccountCreated(id: string): any;
    isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;