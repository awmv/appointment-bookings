import { z } from "zod";

export const AppointmentSchema = z.object({
  userId: z.string(),
  date: z.date(),
  firstName: z.string().min(3).max(36),
  lastName: z.string().min(3).max(36),
  allDay: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().nullable().optional(),
  deletedAt: z.date().nullable().optional(),
});

export const AppointmentSchemaWithId = AppointmentSchema.extend({
  _id: z.string(),
});

export type AppointmentType = z.infer<typeof AppointmentSchema>;
export type AppointmentTypeWithId = z.infer<typeof AppointmentSchemaWithId>;
