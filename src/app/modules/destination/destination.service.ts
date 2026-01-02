import { TDestination } from "./destination.interface";
import { Destination } from "./destination.model";


const createDestination = async (payload: TDestination) => {
    const destination = await Destination.create(payload);
    if (!destination) {
        throw new Error("Failed to create destination");
    }
    return destination;
}

const getDestinationsFromDB = async () => {
    const result = await Destination.find();
    if (!result || result.length === 0) {
        return []
    }
    return result;
}

export const DestinationServices = {
    createDestination,
    getDestinationsFromDB,
}