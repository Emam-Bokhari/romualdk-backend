"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = require("../modules/user/user.routes");
const auth_routes_1 = require("../modules/auth/auth.routes");
const rule_route_1 = require("../modules/rule/rule.route");
const faq_route_1 = require("../modules/faq/faq.route");
const review_route_1 = require("../modules/review/review.route");
const favouriteCar_route_1 = require("../modules/favouriteCar/favouriteCar.route");
const chat_routes_1 = require("../modules/chat/chat.routes");
const message_routes_1 = require("../modules/message/message.routes");
const car_routes_1 = require("../modules/car/car.routes");
const media_route_1 = require("../modules/media/media.route");
const support_route_1 = require("../modules/support/support.route");
const analytics_route_1 = require("../modules/analytics/analytics.route");
const booking_routes_1 = require("../modules/booking/booking.routes");
const payment_routes_1 = require("../modules/payment/payment.routes");
const stripeCEA_routes_1 = require("../modules/stripeCEA/stripeCEA.routes");
const transaction_routes_1 = require("../modules/transaction/transaction.routes");
const hostDashboard_route_1 = require("../modules/hostDashboard/hostDashboard.route");
const destination_route_1 = require("../modules/destination/destination.route");
const smsLog_route_1 = require("../modules/smsLog/smsLog.route");
const router = express_1.default.Router();
const apiRoutes = [
  {
    path: "/users",
    route: user_routes_1.UserRoutes,
  },
  {
    path: "/auth",
    route: auth_routes_1.AuthRoutes,
  },
  {
    path: "/rules",
    route: rule_route_1.RuleRoutes,
  },
  {
    path: "/faqs",
    route: faq_route_1.FaqRoutes,
  },
  {
    path: "/reviews",
    route: review_route_1.ReviewRoutes,
  },
  {
    path: "/favourites",
    route: favouriteCar_route_1.FavouriteCarRoutes,
  },
  {
    path: "/chats",
    route: chat_routes_1.ChatRoutes,
  },
  {
    path: "/messages",
    route: message_routes_1.MessageRoutes,
  },
  {
    path: "/cars",
    route: car_routes_1.CarRoutes,
  },
  {
    path: "/medias",
    route: media_route_1.MediaRoutes,
  },
  {
    path: "/supports",
    route: support_route_1.SupportRoutes,
  },
  {
    path: "/analytics",
    route: analytics_route_1.AnalyticsRoutes,
  },
  {
    path: "/bookings",
    route: booking_routes_1.bookingRoutes,
  },
  {
    path: "/payments",
    route: payment_routes_1.paymentRoutes,
  },
  {
    path: "/stripe-accounts",
    route: stripeCEA_routes_1.stripeCEARoutes,
  },
  {
    path: "/transactions",
    route: transaction_routes_1.transactionRoutes,
  },
  {
    path: "/host-dashboard",
    route: hostDashboard_route_1.HostDashboardRoutes,
  },
  {
    path: "/destinations",
    route: destination_route_1.DestinationRoutes,
  },
  {
    path: "/sms-logs",
    route: smsLog_route_1.SmsLogRoutes,
  },
];
apiRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
