import { prisma } from '../config';
import { AddMedicationInput, UpdateMedicationInput } from '../validators/medication.validator';
import { AppError } from '../middleware/error.middleware';

export class MedicationService {
  async addMedication(userId: string, input: AddMedicationInput) {
    const startDate = new Date(input.start_date);
    const endDate = input.duration
      ? new Date(startDate.getTime() + input.duration * 24 * 60 * 60 * 1000)
      : null;

    return prisma.medication.create({
      data: {
        user_id: userId,
        name: input.name,
        name_bn: input.name_bn,
        dosage: input.dosage,
        frequency: input.frequency,
        times: input.times,
        duration: input.duration,
        start_date: startDate,
        end_date: endDate,
        notes: input.notes,
        pharmacy_id: input.pharmacy_id,
        stock_count: input.stock_count,
        refill_alert_days: input.refill_alert_days,
      },
    });
  }

  async getMedications(userId: string, includeInactive = false) {
    return prisma.medication.findMany({
      where: {
        user_id: userId,
        is_active: includeInactive ? undefined : true,
      },
      include: {
        pharmacy: {
          select: { id: true, name: true, has_delivery: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getMedication(userId: string, medicationId: string) {
    const medication = await prisma.medication.findFirst({
      where: { id: medicationId, user_id: userId },
      include: {
        pharmacy: true,
        logs: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          orderBy: { scheduled_time: 'asc' },
        },
      },
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    return medication;
  }

  async updateMedication(userId: string, medicationId: string, input: UpdateMedicationInput) {
    const medication = await prisma.medication.findFirst({
      where: { id: medicationId, user_id: userId },
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    const startDate = input.start_date ? new Date(input.start_date) : medication.start_date;
    const endDate = input.duration
      ? new Date(startDate.getTime() + input.duration * 24 * 60 * 60 * 1000)
      : input.start_date && medication.duration
      ? new Date(startDate.getTime() + medication.duration * 24 * 60 * 60 * 1000)
      : null;

    return prisma.medication.update({
      where: { id: medicationId },
      data: {
        ...input,
        start_date: startDate,
        end_date: endDate,
      },
    });
  }

  async deleteMedication(userId: string, medicationId: string) {
    const medication = await prisma.medication.findFirst({
      where: { id: medicationId, user_id: userId },
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    return prisma.medication.update({
      where: { id: medicationId },
      data: { is_active: false },
    });
  }

  async getMedicationsNeedingRefill(userId: string) {
    const medications = await prisma.medication.findMany({
      where: {
        user_id: userId,
        is_active: true,
        stock_count: { not: null },
      },
    });

    return medications.filter((med) => {
      if (!med.stock_count || !med.refill_alert_days) return false;
      const dailyDoses = med.times.length;
      const daysLeft = Math.floor(med.stock_count / dailyDoses);
      return daysLeft <= med.refill_alert_days;
    });
  }

  async updateStock(userId: string, medicationId: string, stockCount: number) {
    const medication = await prisma.medication.findFirst({
      where: { id: medicationId, user_id: userId },
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    return prisma.medication.update({
      where: { id: medicationId },
      data: { stock_count: stockCount },
    });
  }
}

export const medicationService = new MedicationService();
