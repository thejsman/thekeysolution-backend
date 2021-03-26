import { Mongo } from "meteor/mongo";

export const Downloads = new Mongo.Collection("downloads");
export const RequestStatus = new Mongo.Collection("requeststatus");
