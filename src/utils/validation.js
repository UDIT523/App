import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    username: z
      .string()
      .min(3, "At least 3 characters")
      .regex(/^[a-zA-Z0-9_.-]+$/, "Letters, numbers, . _ - only"),
    password: z.string().min(4, "Use at least 4 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export const partSchema = z.object({
  name: z.string().trim().min(1, "Part name is required"),
  machine: z.string().trim().min(1, "Machine is required"),
  subMachine: z.string().trim().min(1, "Sub-machine is required"),
  quantity: z.coerce.number().int().min(0, "Cannot be negative"),
  unit: z.string().trim().optional(),
  reorderLevel: z.coerce.number().int().min(0, "Cannot be negative"),
});

export const issueSchema = z.object({
  partName: z.string().trim().min(1, "Spare part is required"),
  machine: z.string().trim().min(1, "Machine is required"),
  subMachine: z.string().trim().min(1, "Sub-machine is required"),
  givenTo: z.string().trim().min(1, "Recipient is required"),
  quantity: z.coerce.number().int().positive("Must be greater than 0"),
  issueDate: z.string().min(1, "Date is required"),
});
