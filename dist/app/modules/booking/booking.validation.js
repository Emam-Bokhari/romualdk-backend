"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingSchema = void 0;
const zod_1 = require("zod");
exports.createBookingSchema = zod_1.z.object({
  body: zod_1.z
    .object({
      carId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Car ID"),
      fromDate: zod_1.z
        .string()
        .datetime({ message: "Invalid fromDate format" }),
      toDate: zod_1.z.string().datetime({ message: "Invalid toDate format" }),
      type: zod_1.z.enum(["withDriver", "withoutDriver"]),
    })
    //  toDate > fromDate
    .refine((data) => new Date(data.toDate) > new Date(data.fromDate), {
      message: "toDate must be after fromDate",
      path: ["toDate"],
    })
    //  fromDate >= current exact time
    .refine((data) => new Date(data.fromDate).getTime() >= Date.now(), {
      message: "fromDate cannot be in the past",
      path: ["fromDate"],
    }),
});
