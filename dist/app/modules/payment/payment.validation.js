"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiatePaymentSchema = void 0;
const zod_1 = require("zod");
exports.initiatePaymentSchema = zod_1.z.object({ body: zod_1.z.object({
        bookingId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid booking ID"),
        customerEmail: zod_1.z.string().email("Valid email required"),
        customerName: zod_1.z.string().min(2, "Name must be at least 2 characters"),
        customerPhone: zod_1.z.string().optional(),
    }),
});
