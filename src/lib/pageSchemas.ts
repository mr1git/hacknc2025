import { z } from "zod";

/** BASICS */
export const BasicsSchema = z.object({
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  preferredName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional()
});

/** SECURITY */
export const SecuritySchema = z.object({
  dob: z.string().optional(),            // YYYY-MM-DD preferred
  citizenship: z.string().optional(),    // e.g., "US" | "Non-US"
  ssnLast4: z.string().length(4).optional()
});

/** ADDRESS */
export const AddressSchema = z.object({
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional()
});

/** EMPLOYMENT */
export const EmploymentSchema = z.object({
  status: z.string().optional(),
  title: z.string().optional(),
  employer: z.string().optional(),
  isRegAffiliated: z.boolean().optional(),
  regFirmName: z.string().optional(),
  isInsider: z.boolean().optional(),
  insiderCompany: z.string().optional(),
  irsBackupWithholding: z.boolean().optional()
});

/** TRUSTED CONTACT */
export const TrustedContactSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  skip: z.boolean().optional()
});

/** REVIEW (acknowledgements) */
export const ReviewSchema = z.object({
  acknowledgements: z.object({
    tos: z.boolean().optional(),
    privacy: z.boolean().optional(),
    disclosures: z.boolean().optional(),
    esig: z.boolean().optional()
  }).optional()
});

export const PageSchemas = {
  basics: BasicsSchema,
  security: SecuritySchema,
  address: AddressSchema,
  employment: EmploymentSchema,
  "trusted-contact": TrustedContactSchema,
  review: ReviewSchema
};

export type PageKey = keyof typeof PageSchemas;
