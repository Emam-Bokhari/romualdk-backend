"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Destination = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const destinationSchema = new mongoose_1.default.Schema({
    image: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true
    },
    pickupPoint: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            required: true,
        }, // [lng, lat]
        address: {
            type: String,
            default: "",
        },
    },
}, {
    timestamps: true,
    versionKey: false
});
exports.Destination = mongoose_1.default.model("Destination", destinationSchema);
