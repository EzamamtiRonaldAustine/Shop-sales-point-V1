import { z } from "zod";

// Validation schemas using Zod 
// These schemas define the expected structure and constraints for various inputs in the application, such as login, registration, goods, investments, and sales.
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required"),
});

// The registerSchema extends the loginSchema by adding a name field with specific validation rules for length.
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Using z.infer to create TypeScript types from the Zod schemas, ensuring type safety throughout the application when handling these inputs.
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// Defining a constant array of unit types that can be used in the goodSchema for validating the unitType field. This ensures that only predefined unit types are accepted.
export const unitTypes = ["PIECE", "KILOGRAM", "LITRE", "TON", "DOZEN", "BOX", "TRAY"] as const;

// The goodSchema defines the structure and validation rules for a good, including fields like name, unitType, packagingDesc, costPrice, and sellingPrice. It uses z.coerce.number() to ensure that costPrice and sellingPrice are treated as numbers, even if they are input as strings.
export const goodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  unitType: z.enum(unitTypes),
  packagingDesc: z.string().optional(),
  costPrice: z.coerce.number().min(0, "Cost must be a positive number"),
  sellingPrice: z.coerce.number().min(0, "Selling price must be a positive number"),
});
export type GoodInput = z.infer<typeof goodSchema>;

// The investmentSchema defines the structure and validation rules for an investment, including fields like goodId, amountSpent, quantityAdded, date, and note. It uses z.coerce.number() to ensure that amountSpent and quantityAdded are treated as numbers, even if they are input as strings. The date field can accept either a string or a Date object.
export const investmentSchema = z.object({
  goodId: z.string().optional(),
  amountSpent: z.coerce.number().min(0, "Amount spent must be a positive number"),
  quantityAdded: z.coerce.number().min(0, "Quantity added must be a positive number").optional(),
  date: z.string().or(z.date()),
  note: z.string().optional(),
});
export type InvestmentInput = z.infer<typeof investmentSchema>;

// The saleSchema defines the structure and validation rules for a sale, including fields like goodId, quantity, saleDate, and note. It uses z.coerce.number() to ensure that quantity is treated as a number, even if it is input as a string. The saleDate field can accept either a string or a Date object. The goodId field is required to ensure that a good is selected for the sale.
export const saleSchema = z.object({
  goodId: z.string().min(1, "Please select a good"),
  quantity: z.coerce.number().min(0.001, "Quantity must be greater than zero"),
  saleDate: z.string().or(z.date()),
  note: z.string().optional(),
});
export type SaleInput = z.infer<typeof saleSchema>;
