import { TDestination } from "./destination.interface";
import destinationModel from "./destination.model";

const createDestination = async (payload: TDestination) => {
    const destination = await destinationModel.create(payload);
    if (!destination) {
        throw new Error("Failed to create destination");
    }
    return destination;
}

const getDestinationsFromDB = async () => {
    const result = await destinationModel.find();
    if (!result || result.length === 0) {
        return []
    }
    return result;
}

export const DestinationServices = {
    createDestination,
    getDestinationsFromDB,
}