import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { 
  type InsertDoctor, type InsertPatient, type InsertAppointment, type InsertBed, 
  type InsertAdmission, type InsertInventoryItem 
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// --- STATS ---
export function useStats() {
  return useQuery({
    queryKey: [api.stats.get.path],
    queryFn: async () => {
      const res = await fetch(api.stats.get.path);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.stats.get.responses[200].parse(await res.json());
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}

// --- DEPARTMENTS ---
export function useDepartments() {
  return useQuery({
    queryKey: [api.departments.list.path],
    queryFn: async () => {
      const res = await fetch(api.departments.list.path);
      if (!res.ok) throw new Error("Failed to fetch departments");
      return api.departments.list.responses[200].parse(await res.json());
    },
  });
}

// --- DOCTORS ---
export function useDoctors() {
  return useQuery({
    queryKey: [api.doctors.list.path],
    queryFn: async () => {
      const res = await fetch(api.doctors.list.path);
      if (!res.ok) throw new Error("Failed to fetch doctors");
      return api.doctors.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertDoctor) => {
      const res = await apiRequest("POST", api.doctors.create.path, data);
      return api.doctors.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.doctors.list.path] }),
  });
}

// --- PATIENTS ---
export function usePatients() {
  return useQuery({
    queryKey: [api.patients.list.path],
    queryFn: async () => {
      const res = await fetch(api.patients.list.path);
      if (!res.ok) throw new Error("Failed to fetch patients");
      return api.patients.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPatient) => {
      const res = await apiRequest("POST", api.patients.create.path, data);
      return api.patients.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.patients.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}

// --- APPOINTMENTS ---
export function useAppointments() {
  return useQuery({
    queryKey: [api.appointments.list.path],
    queryFn: async () => {
      const res = await fetch(api.appointments.list.path);
      if (!res.ok) throw new Error("Failed to fetch appointments");
      // Note: The response objects here are dates as strings from JSON, handled by Zod coerce if schema has it, 
      // or we just handle ISO strings in UI.
      return api.appointments.list.responses[200].parse(await res.json());
    },
    refetchInterval: 15000,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const res = await apiRequest("POST", api.appointments.create.path, data);
      return api.appointments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertAppointment> & { status?: string }) => {
      const url = buildUrl(api.appointments.update.path, { id });
      const res = await apiRequest("PUT", url, updates);
      return api.appointments.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}

// --- BEDS ---
export function useBeds() {
  return useQuery({
    queryKey: [api.beds.list.path],
    queryFn: async () => {
      const res = await fetch(api.beds.list.path);
      if (!res.ok) throw new Error("Failed to fetch beds");
      return api.beds.list.responses[200].parse(await res.json());
    },
    refetchInterval: 10000,
  });
}

// --- ADMISSIONS ---
export function useAdmissions() {
  return useQuery({
    queryKey: [api.admissions.list.path],
    queryFn: async () => {
      const res = await fetch(api.admissions.list.path);
      if (!res.ok) throw new Error("Failed to fetch admissions");
      return api.admissions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAdmission) => {
      const res = await apiRequest("POST", api.admissions.create.path, data);
      return api.admissions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admissions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.beds.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}

export function useDischargePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dischargeDate }: { id: number; dischargeDate: string }) => {
      const url = buildUrl(api.admissions.discharge.path, { id });
      const res = await apiRequest("POST", url, { dischargeDate });
      return api.admissions.discharge.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admissions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.beds.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}

// --- INVENTORY ---
export function useInventory() {
  return useQuery({
    queryKey: [api.inventory.list.path],
    queryFn: async () => {
      const res = await fetch(api.inventory.list.path);
      if (!res.ok) throw new Error("Failed to fetch inventory");
      return api.inventory.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertInventoryItem>) => {
      const url = buildUrl(api.inventory.update.path, { id });
      const res = await apiRequest("PUT", url, updates);
      return api.inventory.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.inventory.list.path] }),
  });
}
