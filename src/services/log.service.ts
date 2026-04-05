import { prisma } from '../config';
import { MarkLogInput } from '../validators/medication.validator';
import { AppError } from '../middleware/error.middleware';

export class LogService {
  async markMedication(userId: string, input: MarkLogInput) {
    const medication = await prisma.medication.findFirst({
      where: { id: input.medication_id, user_id: userId },
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = await prisma.medicationLog.findFirst({
      where: {
        medication_id: input.medication_id,
        user_id: userId,
        scheduled_time: input.scheduled_time,
        date: { gte: today },
      },
    });

    if (existingLog) {
      return prisma.medicationLog.update({
        where: { id: existingLog.id },
        data: {
          status: input.status,
          taken_at: input.status === 'taken' ? new Date() : null,
          skipped_at: input.status === 'skipped' ? new Date() : null,
        },
      });
    }

    return prisma.medicationLog.create({
      data: {
        medication_id: input.medication_id,
        user_id: userId,
        scheduled_time: input.scheduled_time,
        status: input.status,
        taken_at: input.status === 'taken' ? new Date() : null,
        skipped_at: input.status === 'skipped' ? new Date() : null,
        date: new Date(),
      },
    });
  }

  async getTimeline(userId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const medications = await prisma.medication.findMany({
      where: {
        user_id: userId,
        is_active: true,
        start_date: { lte: endOfDay },
        OR: [
          { end_date: null },
          { end_date: { gte: targetDate } },
        ],
      },
      include: {
        logs: {
          where: {
            date: { gte: targetDate, lte: endOfDay },
          },
        },
      },
    });

    const timeline: any[] = [];

    for (const med of medications) {
      for (const time of med.times) {
        const log = med.logs.find((l) => l.scheduled_time === time);
        timeline.push({
          id: med.id,
          medication_id: med.id,
          name: med.name,
          dosage: med.dosage,
          scheduled_time: time,
          status: log?.status || 'pending',
          taken_at: log?.taken_at,
        });
      }
    }

    timeline.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));

    const summary = {
      total: timeline.length,
      taken: timeline.filter((t) => t.status === 'taken').length,
      skipped: timeline.filter((t) => t.status === 'skipped').length,
      pending: timeline.filter((t) => t.status === 'pending').length,
    };

    return { date: targetDate.toISOString().split('T')[0], summary, medications: timeline };
  }

  async getMedicationLogs(userId: string, medicationId: string, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return prisma.medicationLog.findMany({
      where: {
        medication_id: medicationId,
        user_id: userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'desc' },
    });
  }
}

export const logService = new LogService();
