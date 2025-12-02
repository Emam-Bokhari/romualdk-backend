import { Schema, model } from "mongoose";
import { ICarAvailability, ISlot } from "./carAvailability.interface";


const slotSchema = new Schema<ISlot>({
    hour: {
        type: Number,
        required: true,
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    booking: {
        type: Schema.Types.ObjectId,
        ref: "Booking"
    },
    blockedReason: {
        type: String,
        required: false,
    }
});

const carAvailabilitySchema = new Schema<ICarAvailability>({
    car: {
        type: Schema.Types.ObjectId,
        ref: "Car",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    slots: [slotSchema],
    isFullyBlocked: {
        type: Boolean,
        default: false
    },
    blockedReason: {
        type: String,
        required: false,
    }
}, { timestamps: true });

// Compound unique index - very important
carAvailabilitySchema.index({ car: 1, date: 1 }, { unique: true });

export const CarAvailability = model<ICarAvailability>("CarAvailability", carAvailabilitySchema);