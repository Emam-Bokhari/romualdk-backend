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

const getMediaByType = catchAsync(async (req, res) => {
    const { type } = req.query
    console.log(type, "Type")
    const result = await MediaServices.getMediaByTypeFromDB(type);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Successfully get media by types",
        data: result,
    })
})

const updateMediaById = catchAsync(async (req, res) => {
    const { mediaId } = req.params;
    const updatedData = req.body;
    const result = await MediaServices.updateMediaByIdToDB(mediaId, updatedData);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Successfully updated media by ID",
        data: result,
    })

})

export const MediaControllers = {
    createMedia,
    getMediaByType,
    updateMediaById,
}