import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { AppointmentsCollection } from "../collections/appointments";
import {
  AppointmentSchema,
  AppointmentType,
} from "../schemas/appointmentsSchema";

Meteor.methods({
  "appointments.insert"(appointment: Partial<Omit<AppointmentType, "_id">>) {
    const parsed = AppointmentSchema.safeParse(appointment);

    if (!parsed.success) {
      throw new Meteor.Error("Validation Error", parsed.error.message);
    }

    if (!this.userId) {
      throw new Meteor.Error("Not authorized");
    }

    const newAppointment = {
      ...parsed.data,
      userId: appointment.userId,
      allDay: appointment.allDay,
      date: appointment.date,
      createdAt: new Date(),
    };

    try {
      AppointmentsCollection.insertAsync(newAppointment);
    } catch (error) {
      throw new Meteor.Error("Error inserting appointment", error);
    }
  },

  async "appointments.update"(
    appointmentId: string,
    appointment: Partial<AppointmentType>,
  ) {
    check(appointmentId, String);

    const parsed = AppointmentSchema.partial().safeParse(appointment);

    if (!parsed.success) {
      throw new Meteor.Error("Validation Error", parsed.error.message);
    }

    if (!this.userId) {
      throw new Meteor.Error("Not authorized");
    }

    const existingAppointment =
      await AppointmentsCollection.findOneAsync(appointmentId);
    if (!existingAppointment || existingAppointment.userId !== this.userId) {
      throw new Meteor.Error("Not authorized");
    }

    const updatedAppointment = {
      ...parsed.data,
      updatedAt: new Date(),
    };

    try {
      await AppointmentsCollection.updateAsync(appointmentId, {
        $set: updatedAppointment,
      });
    } catch (error) {
      throw new Meteor.Error("Error updating appointment", error);
    }
  },
});
