import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { AppointmentsCollection } from "../imports/api/collections/appointments";
import { AppointmentType } from "../imports/api/schemas/appointmentsSchema";
import { generateAppointmentsForUser } from "./generateAppointments";
import "/imports/api/methods/appointmentsMethods.ts";

Meteor.publish("appointments", function publishAppointments() {
  if (!this.userId) {
    return this.ready();
  }
  return AppointmentsCollection.find({ userId: this.userId });
});

Meteor.startup(async () => {
  const users: {
    username: string;
    password: string;
    userId?: string | undefined;
  }[] = [
    { username: "test1", password: "password1", userId: undefined },
    { username: "test2", password: "password2", userId: undefined },
  ];

  for (const { username, password } of users) {
    // TODO: Figure out why users already exist after `meteor reset`
    const existingUser = Accounts.findUserByUsername(username);

    if (existingUser) {
      await Meteor.users.removeAsync(existingUser._id);
      console.log(`User ${username} removed.`);
    }
    const userId = await Accounts.createUserAsync({ username, password });

    users[users.findIndex((user) => user.username === username)].userId =
      userId;

    console.log(`User ${username} created with ID ${userId}.`);
  }

  const emptyAppointmentCollection =
    (await AppointmentsCollection.find().countAsync()) === 0;

  if (!emptyAppointmentCollection) {
    console.log("Appointments already exist in the database.");
    return;
  }

  console.log("No appointments found. Generating fake appointments...");

  const appointments: AppointmentType[] = [];
  const ALL_DAY_APPOINTMENTS_COUNT = 5;
  const NONE_ALL_DAY_APPOINTMENTS_COUNT = 15;

  users.forEach((user) => {
    appointments.push(
      ...generateAppointmentsForUser(
        user.userId as string,
        ALL_DAY_APPOINTMENTS_COUNT,
        NONE_ALL_DAY_APPOINTMENTS_COUNT,
      ),
    );
  });

  appointments.forEach((appointment) =>
    AppointmentsCollection.insertAsync(appointment),
  );

  console.log("Fake appointments generated and inserted into the database.");
});
