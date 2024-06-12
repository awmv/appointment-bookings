import { AppointmentType } from "../import/api/schemas/appointmentsSchema";

const getRandomDateFromTodayToNextMonth = () => {
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 1);

  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
};

const funnyFirstNames = [
  "Chuckles",
  "Giggles",
  "Wacky",
  "Snickers",
  "Zippy",
  "Bubbles",
  "Scooter",
  "Peppy",
  "Bingo",
  "Doodles",
  "Snappy",
  "Goofy",
  "Tickles",
  "Jumpy",
  "Pogo",
  "Blinky",
  "Smirk",
  "Whizzy",
  "Frolic",
  "Jester",
];

const funnyLastNames = [
  "McSilly",
  "Gigglepants",
  "Wackadoodle",
  "Snickerbottom",
  "Zippydoodle",
  "Bubblebrains",
  "Scooterboot",
  "Peppermint",
  "Bingoberry",
  "Doodlekins",
  "Snappywhisk",
  "Goofypants",
  "Tickletummy",
  "Jumpalot",
  "Pogostick",
  "Blinkersnap",
  "Smirkface",
  "Whizbang",
  "Frolicfoot",
  "Jesterdash",
];

const getRandomName = (arr: string[]): string => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const createFunnyNameCombination = (
  funnyFirstNames: string[],
  funnyLastNames: string[],
) => {
  const randomFirstName = getRandomName(funnyFirstNames);
  const randomLastName = getRandomName(funnyLastNames);

  return { firstName: randomFirstName, lastName: randomLastName };
};

const getAppointmentObject = (
  userId: string,
  name: { firstName: string; lastName: string },
  date: Date,
  allDay = false,
): AppointmentType => {
  return {
    userId,
    date: date.toISOString().split("T")[0],
    firstName: name.firstName,
    lastName: name.lastName,
    allDay,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
  };
};

const createRandomAppointment = (
  userId: string,
  allDay = false,
): AppointmentType => {
  const randomDate = getRandomDateFromTodayToNextMonth();
  const randomName = createFunnyNameCombination(
    funnyFirstNames,
    funnyLastNames,
  );

  return getAppointmentObject(userId, randomName, randomDate, allDay);
};

export const generateAppointmentsForUser = (
  userId: string,
  allDayAppointmentsCount: number,
  noneAllDayAppointmentsCount: number,
) => {
  const appointments: AppointmentType[] = [];
  const allDayAppointmentsDates = new Set<string>();

  for (let i = 0; i < allDayAppointmentsCount; i++) {
    const appointment = createRandomAppointment(userId, true);
    if (allDayAppointmentsDates.has(appointment.date as string)) {
      i--;
      continue;
    }
    allDayAppointmentsDates.add(appointment.date as string);
    appointment.date = new Date(appointment.date);
    appointments.push(appointment);
  }

  for (let i = 0; i < noneAllDayAppointmentsCount; i++) {
    const appointment = createRandomAppointment(userId, false);
    if (allDayAppointmentsDates.has(appointment.date as string)) {
      i--;
      continue;
    }
    appointment.date = new Date(appointment.date);
    appointments.push(appointment);
  }

  return appointments;
};
