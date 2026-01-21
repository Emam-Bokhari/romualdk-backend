import { CounterModel } from "../app/modules/booking/counter.model";

const getNextBookingCode = async () => {
  const counter = await CounterModel.findOneAndUpdate(
    { name: "booking" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  return `BI-${String(counter.seq).padStart(6, "0")}`;
};
export { getNextBookingCode };
