import { Types } from "mongoose";
export type TAvailableDays =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface ICar {
  user: Types.ObjectId;
  brand: string;
  model: string;
  year: number;
  transmission: "MANUAL" | "AUTOMATIC";
  fuelType: "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID";
  seatNumber:
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20;
  color: string;
  shortDescription: string;
  licensePlate: string;
  carRegistration: {
    frontImage: string;
    backImage: string;
  };
  photos: string[];
  dailyPrice: number;
  minimumTripDuration: number;
  withDriver: boolean;
  city: string;
  pickupPoint: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  availableDays:  TAvailableDays[];
  availableTimeSlots: string[]; // e.g., ['09:00-12:00', '13:00-16:00']
  createdAt: Date;
  updatedAt: Date;
}
