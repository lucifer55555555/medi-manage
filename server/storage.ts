import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import { 
  departments, doctors, patients, appointments, beds, admissions, inventory,
  type Department, type InsertDepartment,
  type Doctor, type InsertDoctor,
  type Patient, type InsertPatient,
  type Appointment, type InsertAppointment, type UpdateAppointmentRequest,
  type Bed, type InsertBed,
  type Admission, type InsertAdmission,
  type InventoryItem, type InsertInventoryItem
} from "@shared/schema";

export interface IStorage {
  // Departments
  getDepartments(): Promise<Department[]>;
  createDepartment(dept: InsertDepartment): Promise<Department>;

  // Doctors
  getDoctors(): Promise<Doctor[]>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  getDoctor(id: number): Promise<Doctor | undefined>;

  // Patients
  getPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient>;
  getPatient(id: number): Promise<Patient | undefined>;

  // Appointments
  getAppointments(): Promise<Appointment[]>;
  createAppointment(appt: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appt: UpdateAppointmentRequest): Promise<Appointment>;

  // Beds
  getBeds(): Promise<Bed[]>;
  createBed(bed: InsertBed): Promise<Bed>;
  updateBed(id: number, bed: Partial<InsertBed>): Promise<Bed>;
  getBed(id: number): Promise<Bed | undefined>;

  // Admissions
  getAdmissions(): Promise<Admission[]>;
  createAdmission(admission: InsertAdmission): Promise<Admission>;
  updateAdmission(id: number, admission: Partial<InsertAdmission>): Promise<Admission>;
  getAdmission(id: number): Promise<Admission | undefined>;

  // Inventory
  getInventory(): Promise<InventoryItem[]>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem>;

  // Stats
  getStats(): Promise<{
    totalPatients: number;
    activeAdmissions: number;
    availableBeds: number;
    pendingAppointments: number;
    lowStockItems: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  async createDepartment(dept: InsertDepartment): Promise<Department> {
    const [newDept] = await db.insert(departments).values(dept).returning();
    return newDept;
  }

  async getDoctors(): Promise<Doctor[]> {
    return await db.select().from(doctors);
  }

  async createDoctor(doctor: InsertDoctor): Promise<Doctor> {
    const [newDoctor] = await db.insert(doctors).values(doctor).returning();
    return newDoctor;
  }

  async getDoctor(id: number): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor;
  }

  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db.insert(patients).values(patient).returning();
    return newPatient;
  }

  async updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient> {
    const [updated] = await db.update(patients).set(patient).where(eq(patients.id, id)).returning();
    return updated;
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(desc(appointments.date));
  }

  async createAppointment(appt: InsertAppointment): Promise<Appointment> {
    // Basic Queue Number Logic: Count appointments for this doctor on this date
    // For simplicity, just count total for now or random.
    const queueNumber = Math.floor(Math.random() * 100) + 1;
    const [newAppt] = await db.insert(appointments).values({ ...appt, queueNumber }).returning();
    return newAppt;
  }

  async updateAppointment(id: number, appt: UpdateAppointmentRequest): Promise<Appointment> {
    const [updated] = await db.update(appointments).set(appt).where(eq(appointments.id, id)).returning();
    return updated;
  }

  async getBeds(): Promise<Bed[]> {
    return await db.select().from(beds).orderBy(beds.bedNumber);
  }

  async createBed(bed: InsertBed): Promise<Bed> {
    const [newBed] = await db.insert(beds).values(bed).returning();
    return newBed;
  }

  async updateBed(id: number, bed: Partial<InsertBed>): Promise<Bed> {
    const [updated] = await db.update(beds).set(bed).where(eq(beds.id, id)).returning();
    return updated;
  }

  async getBed(id: number): Promise<Bed | undefined> {
    const [bed] = await db.select().from(beds).where(eq(beds.id, id));
    return bed;
  }

  async getAdmissions(): Promise<Admission[]> {
    return await db.select().from(admissions).where(eq(admissions.status, "active"));
  }

  async createAdmission(admission: InsertAdmission): Promise<Admission> {
    const [newAdmission] = await db.insert(admissions).values(admission).returning();
    // Also update bed status
    await db.update(beds).set({ status: "occupied" }).where(eq(beds.id, admission.bedId));
    return newAdmission;
  }

  async updateAdmission(id: number, admission: Partial<InsertAdmission>): Promise<Admission> {
    const [updated] = await db.update(admissions).set(admission).where(eq(admissions.id, id)).returning();
    return updated;
  }

  async getAdmission(id: number): Promise<Admission | undefined> {
    const [admission] = await db.select().from(admissions).where(eq(admissions.id, id));
    return admission;
  }

  async getInventory(): Promise<InventoryItem[]> {
    return await db.select().from(inventory);
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem> {
    const [updated] = await db.update(inventory).set(item).where(eq(inventory.id, id)).returning();
    return updated;
  }

  async getStats(): Promise<{
    totalPatients: number;
    activeAdmissions: number;
    availableBeds: number;
    pendingAppointments: number;
    lowStockItems: number;
  }> {
    const [patientCount] = await db.select({ count: sql<number>`count(*)` })
      .from(patients);
    const [admissionCount] = await db.select({ count: sql<number>`count(*)` }).from(admissions).where(eq(admissions.status, "active"));
    const [bedCount] = await db.select({ count: sql<number>`count(*)` }).from(beds).where(eq(beds.status, "available"));
    const [apptCount] = await db.select({ count: sql<number>`count(*)` }).from(appointments).where(eq(appointments.status, "scheduled"));
    // Low stock: quantity <= reorderLevel
    const [stockCount] = await db.select({ count: sql<number>`count(*)` }).from(inventory).where(sql`${inventory.quantity} <= ${inventory.reorderLevel}`);
    
    // Total Patients = Registered Patients - Discharged Patients
    // But usually Total Patients means total registered. 
    // If the user wants it to be "Current Patients", we should subtract discharged ones.
    const [dischargedCount] = await db.select({ count: sql<number>`count(*)` })
      .from(admissions)
      .where(eq(admissions.status, "discharged"));

    return {
      totalPatients: Math.max(0, Number(patientCount.count) - Number(dischargedCount.count)),
      activeAdmissions: Number(admissionCount.count),
      availableBeds: Number(bedCount.count),
      pendingAppointments: Number(apptCount.count),
      lowStockItems: Number(stockCount.count),
    };
  }
}

export const storage = new DatabaseStorage();
