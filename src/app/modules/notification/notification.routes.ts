import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { NotificationController } from "./notification.controller";
const router = express.Router();

router.route("/")
  .get(
    auth(USER_ROLES.USER),
    NotificationController.getNotificationFromDB,
  )
  .patch(
    auth(USER_ROLES.USER),
    NotificationController.readNotification,
  );
router.route("/admin")
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    NotificationController.adminNotificationFromDB,
  )
  .patch(
    auth(USER_ROLES.USER),
    NotificationController.adminReadNotification,
  );

// booking related - booking pending, approved, canceled, refunded => admin host, user 
// user account creation related - user, admin 
// user account delete related




export const NotificationRoutes = router;
