import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  // Departments
  app.get(api.departments.list.path, async (req, res) => {
    const departments = await storage.getDepartments();
    res.json(departments);
  });

  // Doctors
  app.get(api.doctors.list.path, async (req, res) => {
    const doctors = await storage.getDoctors();
    res.json(doctors);
  });

  app.post(api.doctors.create.path, async (req, res) => {
    try {
      const input = api.doctors.create.input.parse(req.body);
      const doctor = await storage.createDoctor(input);
      res.status(201).json(doctor);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Patients
  app.get(api.patients.list.path, async (req, res) => {
    const patients = await storage.getPatients();
    res.json(patients);
  });

  app.post(api.patients.create.path, async (req, res) => {
    try {
      const input = api.patients.create.input.parse(req.body);
      const patient = await storage.createPatient(input);
      res.status(201).json(patient);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  
  app.put(api.patients.update.path, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const input = api.patients.update.input.parse(req.body);
      const updated = await storage.updatePatient(id, input);
      res.json(updated);
    } catch (err) {
       res.status(400).json({ message: "Invalid input" });
    }
  });

  // Appointments
  app.get(api.appointments.list.path, async (req, res) => {
    const appointments = await storage.getAppointments();
    res.json(appointments);
  });

  app.post(api.appointments.create.path, async (req, res) => {
    try {
      const bodySchema = api.appointments.create.input.extend({
        date: z.coerce.date(),
      });
      const input = bodySchema.parse(req.body);
      const appointment = await storage.createAppointment(input);
      res.status(201).json(appointment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.appointments.update.path, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
       const input = api.appointments.update.input.parse(req.body);
       const updated = await storage.updateAppointment(id, input);
       res.json(updated);
    } catch (err) {
       res.status(400).json({ message: "Invalid input" });
    }
  });

  // Beds
  app.get(api.beds.list.path, async (req, res) => {
    const beds = await storage.getBeds();
    res.json(beds);
  });
  
  app.put(api.beds.update.path, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
       const input = api.beds.update.input.parse(req.body);
       const updated = await storage.updateBed(id, input);
       res.json(updated);
    } catch (err) {
       res.status(400).json({ message: "Invalid input" });
    }
  });

  // Admissions
  app.get(api.admissions.list.path, async (req, res) => {
    const admissions = await storage.getAdmissions();
    res.json(admissions);
  });

  app.post(api.admissions.create.path, async (req, res) => {
    try {
      const bodySchema = api.admissions.create.input.extend({
        admissionDate: z.coerce.date().optional(),
      });
      const input = bodySchema.parse(req.body);
      const admission = await storage.createAdmission(input);
      res.status(201).json(admission);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.admissions.discharge.path, async (req, res) => {
     const id = parseInt(req.params.id);
     const admission = await storage.getAdmission(id);
     if (!admission) return res.status(404).json({ message: "Admission not found" });
     
     const updatedAdmission = await storage.updateAdmission(id, { 
         status: "discharged", 
         dischargeDate: new Date() 
     });
     
     await storage.updateBed(admission.bedId, { status: "available" });
     res.json(updatedAdmission);
  });

  // Inventory
  app.get(api.inventory.list.path, async (req, res) => {
    const items = await storage.getInventory();
    res.json(items);
  });
  
  app.put(api.inventory.update.path, async (req, res) => {
     const id = parseInt(req.params.id);
     try {
       const bodySchema = api.inventory.update.input.extend({
         expiryDate: z.coerce.date().optional(),
         quantity: z.coerce.number().optional(),
         reorderLevel: z.coerce.number().optional(),
       });
       const input = bodySchema.parse(req.body);
       const updated = await storage.updateInventoryItem(id, input);
       res.json(updated);
     } catch(err) {
        res.status(400).json({ message: "Invalid input" });
     }
  });

  // Stats
  app.get(api.stats.get.path, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const depts = await storage.getDepartments();
  if (depts.length === 0) {
    const dept1 = await storage.createDepartment({ name: "Cardiology", location: "Block A" });
    const dept2 = await storage.createDepartment({ name: "Orthopedics", location: "Block B" });
    
    await storage.createDoctor({ name: "Dr. Smith", departmentId: dept1.id, specialty: "Heart Surgeon", availableDays: ["Mon", "Wed", "Fri"], consultationFee: 500 });
    await storage.createDoctor({ name: "Dr. Jones", departmentId: dept2.id, specialty: "Bone Specialist", availableDays: ["Tue", "Thu"], consultationFee: 450 });
    
    await storage.createBed({ ward: "ICU", bedNumber: "ICU-01", type: "ICU", status: "available", departmentId: dept1.id });
    await storage.createBed({ ward: "ICU", bedNumber: "ICU-02", type: "ICU", status: "available", departmentId: dept1.id });
    await storage.createBed({ ward: "ICU", bedNumber: "ICU-03", type: "ICU", status: "available", departmentId: dept1.id });
    await storage.createBed({ ward: "General", bedNumber: "GEN-01", type: "General", status: "available", departmentId: dept2.id });
    await storage.createBed({ ward: "General", bedNumber: "GEN-02", type: "General", status: "available", departmentId: dept2.id });
    await storage.createBed({ ward: "General", bedNumber: "GEN-03", type: "General", status: "available", departmentId: dept2.id });
    await storage.createBed({ ward: "General", bedNumber: "GEN-04", type: "General", status: "available", departmentId: dept2.id });
    await storage.createBed({ ward: "Emergency", bedNumber: "EMG-01", type: "Emergency", status: "available", departmentId: dept1.id });
    await storage.createBed({ ward: "Emergency", bedNumber: "EMG-02", type: "Emergency", status: "available", departmentId: dept1.id });
    
    await storage.createInventoryItem({ name: "Paracetamol", type: "Medicine", quantity: 500, unit: "strips", reorderLevel: 50, expiryDate: new Date("2026-01-01") });
    await storage.createInventoryItem({ name: "Surgical Masks", type: "Consumable", quantity: 100, unit: "box", reorderLevel: 20, expiryDate: new Date("2025-12-31") });
    
    await storage.createPatient({ name: "John Doe", age: 45, gender: "Male", contact: "555-1234", address: "123 Main St", medicalHistory: "None" });
  }
}
