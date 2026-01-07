import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import Auth Schema
export * from "./models/auth";

// === DEPARTMENTS ===
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
});

export const departmentsRelations = relations(departments, ({ many }) => ({
  doctors: many(doctors),
  beds: many(beds),
}));

// === DOCTORS ===
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  departmentId: integer("department_id").notNull(),
  specialty: text("specialty").notNull(),
  availableDays: jsonb("available_days").$type<string[]>().notNull(), // e.g. ["Monday", "Wednesday"]
  consultationFee: integer("consultation_fee").notNull(),
});

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  department: one(departments, {
    fields: [doctors.departmentId],
    references: [departments.id],
  }),
  appointments: many(appointments),
}));

// === PATIENTS ===
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // Male, Female, Other
  contact: text("contact").notNull(),
  address: text("address").notNull(),
  medicalHistory: text("medical_history"),
});

export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  admissions: many(admissions),
}));

// === APPOINTMENTS / OPD QUEUE ===
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, checked-in, completed, cancelled
  queueNumber: integer("queue_number"), // Assigned when status becomes 'scheduled' or 'checked-in'
  symptoms: text("symptoms"),
  diagnosis: text("diagnosis"),
});

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
  }),
}));

// === BEDS ===
export const beds = pgTable("beds", {
  id: serial("id").primaryKey(),
  ward: text("ward").notNull(),
  bedNumber: text("bed_number").notNull(),
  type: text("type").notNull(), // ICU, General, Private
  status: text("status").notNull().default("available"), // available, occupied, maintenance
  departmentId: integer("department_id"),
});

export const bedsRelations = relations(beds, ({ one, many }) => ({
  department: one(departments, {
    fields: [beds.departmentId],
    references: [departments.id],
  }),
  admissions: many(admissions),
}));

// === ADMISSIONS ===
export const admissions = pgTable("admissions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  bedId: integer("bed_id").notNull(),
  admissionDate: timestamp("admission_date").defaultNow().notNull(),
  dischargeDate: timestamp("discharge_date"),
  status: text("status").notNull().default("active"), // active, discharged
  diagnosis: text("diagnosis").notNull(),
});

export const admissionsRelations = relations(admissions, ({ one }) => ({
  patient: one(patients, {
    fields: [admissions.patientId],
    references: [patients.id],
  }),
  bed: one(beds, {
    fields: [admissions.bedId],
    references: [beds.id],
  }),
}));

// === INVENTORY ===
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // Medicine, Consumable
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull(), // strips, bottles, boxes
  reorderLevel: integer("reorder_level").notNull().default(10),
  expiryDate: timestamp("expiry_date").notNull(),
});

// === SCHEMAS ===
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true });
export const insertDoctorSchema = createInsertSchema(doctors).omit({ id: true });
export const insertPatientSchema = createInsertSchema(patients).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, queueNumber: true });
export const insertBedSchema = createInsertSchema(beds).omit({ id: true });
export const insertAdmissionSchema = createInsertSchema(admissions).omit({ id: true, admissionDate: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true });

// === TYPES ===
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Bed = typeof beds.$inferSelect;
export type InsertBed = z.infer<typeof insertBedSchema>;

export type Admission = typeof admissions.$inferSelect;
export type InsertAdmission = z.infer<typeof insertAdmissionSchema>;

export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventorySchema>;

// API Request/Response Types
export type CreateAppointmentRequest = InsertAppointment;
export type UpdateAppointmentRequest = Partial<InsertAppointment> & { status?: string };
export type CreateAdmissionRequest = InsertAdmission;
export type DischargeRequest = { dischargeDate: Date };
