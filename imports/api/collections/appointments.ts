import { Mongo } from "meteor/mongo";
import { AppointmentTypeWithId } from "../schemas/appointmentsSchema";

export const AppointmentsCollection =
  new Mongo.Collection<AppointmentTypeWithId>("appointments");
