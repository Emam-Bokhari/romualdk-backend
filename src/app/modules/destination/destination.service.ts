import { TDestination } from "./destination.interface";
import destinationModel from "./destination.model";

const createDestination = async (payload: TDestination) => {
    const destination = await destinationModel.create(payload);
    if (!destination) {
        throw new Error("Failed to create destination");
    }
    return destination;
}

export const DestinationServices = {
    createDestination,
}