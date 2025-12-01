import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { MessageController } from './message.controller';
import fileUploadHandler from '../../middlewares/fileUploaderHandler';
import parseAllFilesData from '../../middlewares/parseAllFileData';
const router = express.Router();

router.post(
  '/',
  fileUploadHandler(),
  parseAllFilesData({ fieldName: "image", forceSingle: true }),
  auth(USER_ROLES.USER, USER_ROLES.HOST),
  MessageController.sendMessage
);
router.get(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.HOST),
  MessageController.getMessage
);

export const MessageRoutes = router;
