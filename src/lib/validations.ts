import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const unitTypes = ["PIECE", "KILOGRAM", "LITRE", "TON", "DOZEN", "BOX", "TRAY"] as const;

export const goodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  unitType: z.enum(unitTypes),
  packagingDesc: z.string().optional(),
  costPrice: z.coerce.number().min(0, "Cost must be a positive number"),
  sellingPrice: z.coerce.number().min(0, "Selling price must be a positive number"),
});
export type GoodInput = z.infer<typeof goodSchema>;

export const investmentSchema = z.object({
  goodId: z.string().optional(),
  amountSpent: z.coerce.number().min(0, "Amount spent must be a positive number"),
  quantityAdded: z.coerce.number().min(0, "Quantity added must be a positive number").optional(),
  date: z.string().or(z.date()),
  note: z.string().optional(),
});
export type InvestmentInput = z.infer<typeof investmentSchema>;

export const saleSchema = z.object({
  goodId: z.string().min(1, "Please select a good"),
  quantity: z.coerce.number().min(0.001, "Quantity must be greater than zero"),
  saleDate: z.string().or(z.date()),
  note: z.string().optional(),
});
export type SaleInput = z.infer<typeof saleSchema>;
