import { z } from "zod";
import { 
  insertDepartmentSchema, departments,
  insertDoctorSchema, doctors,
  insertPatientSchema, patients,
  insertAppointmentSchema, appointments,
  insertBedSchema, beds,
  insertAdmissionSchema, admissions,
  insertInventorySchema, inventory
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  departments: {
    list: {
      method: "GET" as const,
      path: "/api/departments",
      responses: {
        200: z.array(z.custom<typeof departments.$inferSelect>()),
      },
    },
  },
  doctors: {
    list: {
      method: "GET" as const,
      path: "/api/doctors",
      responses: {
        200: z.array(z.custom<typeof doctors.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/doctors",
      input: insertDoctorSchema,
      responses: {
        201: z.custom<typeof doctors.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  patients: {
    list: {
      method: "GET" as const,
      path: "/api/patients",
      responses: {
        200: z.array(z.custom<typeof patients.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/patients",
      input: insertPatientSchema,
      responses: {
        201: z.custom<typeof patients.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/patients/:id",
      input: insertPatientSchema.partial(),
      responses: {
        200: z.custom<typeof patients.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  appointments: {
    list: {
      method: "GET" as const,
      path: "/api/appointments",
      responses: {
        200: z.array(z.custom<typeof appointments.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/appointments",
      input: insertAppointmentSchema,
      responses: {
        201: z.custom<typeof appointments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/appointments/:id",
      input: insertAppointmentSchema.partial().extend({ status: z.string().optional() }),
      responses: {
        200: z.custom<typeof appointments.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  beds: {
    list: {
      method: "GET" as const,
      path: "/api/beds",
      responses: {
        200: z.array(z.custom<typeof beds.$inferSelect>()),
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/beds/:id",
      input: insertBedSchema.partial(),
      responses: {
        200: z.custom<typeof beds.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  admissions: {
    list: {
      method: "GET" as const,
      path: "/api/admissions",
      responses: {
        200: z.array(z.custom<typeof admissions.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/admissions",
      input: insertAdmissionSchema,
      responses: {
        201: z.custom<typeof admissions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    discharge: {
      method: "POST" as const,
      path: "/api/admissions/:id/discharge",
      input: z.object({ dischargeDate: z.string().optional() }),
      responses: {
        200: z.custom<typeof admissions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  inventory: {
    list: {
      method: "GET" as const,
      path: "/api/inventory",
      responses: {
        200: z.array(z.custom<typeof inventory.$inferSelect>()),
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/inventory/:id",
      input: insertInventorySchema.partial(),
      responses: {
        200: z.custom<typeof inventory.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  stats: {
    get: {
      method: "GET" as const,
      path: "/api/stats",
      responses: {
        200: z.object({
          totalPatients: z.number(),
          activeAdmissions: z.number(),
          availableBeds: z.number(),
          pendingAppointments: z.number(),
          lowStockItems: z.number(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
