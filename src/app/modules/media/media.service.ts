import ApiError from "../../../errors/ApiErrors";
import { IMedia, MEDIA_TYPE } from "./media.interface";
import { Media } from "./media.model";

const createMediaToDB = {
    createMedia: async (payload: IMedia) => {
        const { type, description } = payload;

        if (![MEDIA_TYPE.BANNER, MEDIA_TYPE.FEED].includes(payload.type)) {
            throw new ApiError(400, "Media type must be 'BANNER' or 'FEED'");
        };

        // if description is provided, ensure this type doesn't already have one
        if (description) {
            const exist = await Media.findOne({
                type,
                description: { $ne: null },
            });

            if (exist) {
                throw new ApiError(
                    400,
                    `A description already exists for media type: ${type}`
                );
            }
        }

        // switch is used to allow future type-specific logic
        switch (type) {
            case MEDIA_TYPE.BANNER:
                return await Media.create({ ...payload });

            case MEDIA_TYPE.FEED:
                return await Media.create({ ...payload });

            default:
                throw new ApiError(400, "Invalid media type");
        }
    },
};

export const MediaServices = {
    createMediaToDB
}