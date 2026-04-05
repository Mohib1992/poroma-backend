import { z } from 'zod';

export const addMedicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  name_bn: z.string().optional(),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.enum(['once_daily', 'twice_daily', 'three_times', 'four_times', 'as_needed', 'weekly']),
  times: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format')),
  duration: z.number().int().positive().optional(),
  start_date: z.string(),
  notes: z.string().optional(),
  pharmacy_id: z.string().uuid().optional(),
  stock_count: z.number().int().min(0).optional(),
  refill_alert_days: z.number().int().min(1).max(30).default(7),
});

export const updateMedicationSchema = addMedicationSchema.partial();

export const markLogSchema = z.object({
  medication_id: z.string().uuid(),
  scheduled_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  status: z.enum(['taken', 'skipped']),
});

export type AddMedicationInput = z.infer<typeof addMedicationSchema>;
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>;
export type MarkLogInput = z.infer<typeof markLogSchema>;
