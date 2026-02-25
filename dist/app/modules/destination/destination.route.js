"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const destination_controller_1 = require("./destination.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const fileUploaderHandler_1 = __importDefault(
  require("../../middlewares/fileUploaderHandler"),
);
const parseAllFileData_1 = __importDefault(
  require("../../middlewares/parseAllFileData"),
);
const files_1 = require("../../../enums/files");
const router = express_1.default.Router();
router.post(
  "/",
  (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN),
  (0, fileUploaderHandler_1.default)(),
  (0, parseAllFileData_1.default)({
    fieldName: files_1.FOLDER_NAMES.IMAGE,
    forceSingle: true,
  }),
  destination_controller_1.DestinationControllers.createDestination,
);
router.get(
  "/",
  destination_controller_1.DestinationControllers.getDestinations,
);
exports.DestinationRoutes = router;
