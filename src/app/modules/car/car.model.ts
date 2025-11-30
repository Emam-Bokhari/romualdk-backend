import { Schema, model} from "mongoose";
import { ICar } from "./car.interface";

const carSchema = new Schema<ICar>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        brand: { type: String, required: true },
        model: { type: String, required: true },
        year: { type: Number, required: true },
        transmission: { type: String, enum: ["MANUAL", "AUTOMATIC"], required: true },
        fuelType: { type: String, enum: ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"], required: true },
        seatNumber: { type: Number, required: true, min: 1, max: 20 },
        color: { type: String, required: true },
        shortDescription: { type: String, required: true },
        licensePlate: { type: String, required: true, unique: true },
        carRegistration: {
            frontImage: { type: String, required: true },
            backImage: { type: String, required: true },
        },
        photos: { type: [String], required: true },
        dailyPrice: { type: Number, required: true },
        minimumTripDuration: { type: Number, required: true },
        withDriver: { type: Boolean, required: true },
        city: { type: String, required: true },
        pickupPoint: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
            },
            coordinates: { type: [Number], default: [0,0], required: true },
        },
        availableDays: { type: [String], enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], required: true },
        availableTimeSlots: { type: [String], required: true },
    },
    { timestamps: true }
);
export const Car = model<ICar>("Car", carSchema);