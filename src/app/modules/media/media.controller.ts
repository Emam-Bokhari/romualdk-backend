import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { MediaServices } from "./media.service";

const createMedia = catchAsync(async (req, res) => {
    const mediaData = req.body;

    const result = await MediaServices.createMediaToDB(mediaData);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Successfully create a media data",
        data: result,
    })

})

export const MediaControllers={
    createMedia,
}