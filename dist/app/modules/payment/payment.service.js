"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const stripe_1 = __importDefault(require("../../../config/stripe"));
const config_1 = __importDefault(require("../../../config"));
const booking_model_1 = require("../booking/booking.model");
const transaction_model_1 = require("./transaction.model");
const booking_interface_1 = require("../booking/booking.interface");
const user_model_1 = require("../user/user.model");
const COMMISSION_RATE = 0.15; // 15% commission
const createCheckoutSession = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId, customerEmail, customerName, customerPhone } = input;
    const booking = yield booking_model_1.Booking.findById(bookingId).populate("carId");
    if (!booking)
        throw new Error("Booking not found");
    if (booking.status !== booking_interface_1.BOOKING_STATUS.PENDING)
        throw new Error("Booking already paid or canceled");
    const session = yield stripe_1.default.checkout.sessions.create({
        payment_method_types: [transaction_model_1.PaymentMethod.CARD],
        mode: "payment",
        success_url: `${process.env.BASE_URL}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}/api/payments/cancel`,
        customer_email: customerEmail,
        client_reference_id: bookingId,
        metadata: { booking_id: bookingId },
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `${booking.carId.brand} ${booking.carId.model} (${booking.carId.licensePlate})`,
                        description: `Booking ID is #${bookingId} for ${booking.carId.brand}, ${booking.carId.model}, ${booking.carId.year}, ${booking.carId.color}`,
                    },
                    unit_amount: Math.round(booking.totalAmount * 100),
                },
                quantity: 1,
            },
        ],
        phone_number_collection: { enabled: true },
        billing_address_collection: "required",
    });
    // await Transaction.create({
    //   bookingId: booking._id,
    //   amount: booking.totalAmount,
    //   method: PaymentMethod.CARD,
    //   stripeSessionId: session.id,
    //   status: TransactionStatus.PENDING,
    // });
    yield transaction_model_1.Transaction.create({
        bookingId: booking._id,
        amount: booking.totalAmount,
        method: transaction_model_1.PaymentMethod.CARD,
        stripeSessionId: session.id,
        status: transaction_model_1.TransactionStatus.PENDING,
    }).then((trx) => __awaiter(void 0, void 0, void 0, function* () {
        yield booking_model_1.Booking.findByIdAndUpdate(booking._id, {
            transactionId: trx._id,
        });
    }));
    // 29,30 ai 2 diner vitore ai agents site ar kaj complete korte hobe frontend
    // 29, 30 ai 2 diner maje final plan korte hobe agami 1year ar
    // 2026 -> per week a 2 days martial arts practice abong noton kiso sikhte hobe
    // 2026 -> jan ar vitore frontend sesh korte hobe
    // 2026 -> jan ar 1 weak ar vitore fb page ready korte hobe khuv e professional vabe
    const readBooks = () => {
        console.log("Reading books...");
        console.log("dashboard overview page, customer managements,order management,product management,chat,admin management,settings");
    };
    console.log("Stripe Checkout Session created:", session.id);
    console.log("stripe account ID:");
    return {
        success: true,
        paymentUrl: session.url,
        sessionId: session.id,
    };
});
const handleWebhook = (rawBody, sig) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let event;
    try {
        event = stripe_1.default.webhooks.constructEvent(rawBody, sig, config_1.default.stripe.webhookSecret);
    }
    catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return false;
    }
    // ================= PAYMENT SUCCESS =================
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const bookingId = session.client_reference_id || ((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.booking_id);
        if (!bookingId)
            return false;
        const booking = yield booking_model_1.Booking.findById(bookingId);
        if (booking && booking.status === booking_interface_1.BOOKING_STATUS.PENDING) {
            booking.status = booking_interface_1.BOOKING_STATUS.PAID;
            // --------- CAR STATUS LOGIC (Rules) --------- //
            if (!booking.checkIn && !booking.checkOut) {
                booking.carStatus = booking_interface_1.CAR_STATUS.UPCOMING;
            }
            yield booking.save();
            const paymentIntentId = session.payment_intent;
            const paymentIntent = yield stripe_1.default.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] });
            const chargeId = typeof paymentIntent.latest_charge === "string"
                ? paymentIntent.latest_charge
                : (_b = paymentIntent.latest_charge) === null || _b === void 0 ? void 0 : _b.id;
            if (!chargeId) {
                throw new Error("Stripe charge not generated");
            }
            yield transaction_model_1.Transaction.findOneAndUpdate({ stripeSessionId: session.id }, {
                status: transaction_model_1.TransactionStatus.SUCCEEDED,
                stripePaymentIntentId: paymentIntentId,
                stripeChargeId: chargeId,
            });
            return true;
        }
    }
    // ================= REFUND CONFIRMATION =================
    if (event.type === "charge.refunded") {
        const charge = event.data.object;
        yield transaction_model_1.Transaction.findOneAndUpdate({ stripeChargeId: charge.id }, {
            refundStatus: transaction_model_1.RefundStatus.SUCCEEDED,
            refundedAt: new Date(),
        });
        return true;
    }
    // ================= STRIPE CONNECT ONBOARDING =================
    if (event.type === "account.updated") {
        const account = event.data.object;
        yield user_model_1.User.findOneAndUpdate({ connectedAccountId: account.id }, {
            onboardingCompleted: account.details_submitted,
            payoutsEnabled: account.payouts_enabled,
        });
        return true;
    }
    return false;
});
// ================= PAYOUT TO HOST =================
// const payoutToHost = async (bookingId: string) => {
//   const booking = await Booking.findById(bookingId);
//   if (!booking || booking.payoutProcessed || !booking.checkOut) return;
//   const host = await User.findById(booking.hostId);
//   console.log("Host info:", host);
//   if (!host?.connectedAccountId || !host.payoutsEnabled) {
//     throw new Error("Host payout not enabled");
//   }
//   const transaction = await Transaction.findById(booking.transactionId);
//   if (!transaction || transaction.status !== TransactionStatus.SUCCEEDED) {
//     throw new Error("Payment not completed");
//   }
//   if (!transaction.stripeChargeId) {
//     throw new Error("Stripe charge not found");
//   }
//   // const commission = Math.round(transaction.amount * COMMISSION_RATE);
//   // const payoutAmount = transaction.amount - commission;
//   const commission = Math.round(transaction.amount * COMMISSION_RATE * 100);
//   const payoutAmount = transaction.amount * 100 - commission;
//   const transfer = await stripe.transfers.create({
//     amount: payoutAmount,
//     currency: transaction.currency,
//     destination: host.connectedAccountId,
//     // source_transaction: transaction.stripePaymentIntentId!,
//     source_transaction: transaction.stripeChargeId,
//   });
//   await Transaction.findByIdAndUpdate(transaction._id, {
//     commissionAmount: commission,
//     payoutStatus: PayoutStatus.SUCCEEDED,
//     stripeTransferId: transfer.id,
//     hostReceiptAmount: payoutAmount,
//   });
//   await Booking.findByIdAndUpdate(bookingId, {
//     payoutProcessed: true,
//     payoutAt: new Date(),
//   });
// };
const payoutToHost = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const booking = yield booking_model_1.Booking.findById(bookingId);
    if (!booking || booking.payoutProcessed)
        return;
    const transaction = yield transaction_model_1.Transaction.findById(booking.transactionId);
    if (!transaction || transaction.status !== transaction_model_1.TransactionStatus.SUCCEEDED)
        return;
    const isEligibleForPayout = booking.checkOut === true ||
        (booking.status === booking_interface_1.BOOKING_STATUS.CANCELLED &&
            ((_a = transaction.refundAmount) !== null && _a !== void 0 ? _a : 0) > 0);
    if (!isEligibleForPayout)
        return;
    const host = yield user_model_1.User.findById(booking.hostId);
    if (!(host === null || host === void 0 ? void 0 : host.connectedAccountId) || !host.payoutsEnabled) {
        throw new Error("Host payout not enabled");
    }
    const refundedAmount = (_b = transaction.refundAmount) !== null && _b !== void 0 ? _b : 0; // USD
    const effectiveAmount = transaction.amount - refundedAmount;
    // Full refund → host gets nothing
    if (effectiveAmount <= 0) {
        yield booking_model_1.Booking.findByIdAndUpdate(bookingId, { payoutProcessed: true });
        yield transaction_model_1.Transaction.findByIdAndUpdate(transaction._id, {
            payoutStatus: transaction_model_1.PayoutStatus.SUCCEEDED,
        });
        return;
    }
    const commission = Math.round(effectiveAmount * COMMISSION_RATE * 100); // cents
    const payoutAmount = Math.round(effectiveAmount * 100) - commission;
    const transfer = yield stripe_1.default.transfers.create({
        amount: payoutAmount,
        currency: transaction.currency,
        destination: host.connectedAccountId,
        source_transaction: transaction.stripeChargeId,
    });
    yield transaction_model_1.Transaction.findByIdAndUpdate(transaction._id, {
        commissionAmount: Math.round(effectiveAmount * COMMISSION_RATE),
        payoutStatus: transaction_model_1.PayoutStatus.SUCCEEDED,
        stripeTransferId: transfer.id,
        hostReceiptAmount: payoutAmount / 100,
    });
    yield booking_model_1.Booking.findByIdAndUpdate(bookingId, {
        payoutProcessed: true,
        payoutAt: new Date(),
    });
});
// ================ Refund  =================
const refundBookingPayment = (booking, transaction, refundPercentage, session) => __awaiter(void 0, void 0, void 0, function* () {
    if (!transaction.stripeChargeId) {
        throw new Error("Stripe charge not found");
    }
    const refundAmountInCents = Math.round(transaction.amount * refundPercentage * 100);
    //  Stripe call (EXTERNAL)
    const refund = yield stripe_1.default.refunds.create({
        charge: transaction.stripeChargeId,
        amount: refundAmountInCents,
    }, {
        idempotencyKey: `refund_${booking._id}`,
    });
    //  DB update (ATOMIC via session)
    transaction.refundId = refund.id;
    transaction.refundAmount = refundAmountInCents / 100;
    transaction.refundStatus = transaction_model_1.RefundStatus.PENDING;
    transaction.status = transaction_model_1.TransactionStatus.CANCELED;
    yield transaction.save({ session });
    //  Optional but useful response
    return {
        refundId: refund.id,
        refundAmount: refundAmountInCents / 100,
        refundPercentage: refundPercentage * 100,
    };
});
// -------- Export as object ----------
exports.PaymentService = {
    createCheckoutSession,
    handleWebhook,
    payoutToHost,
    refundBookingPayment,
};
