import { prisma } from '../config';

export class AnalyticsService {
  async trackEvent(userId: string | null, eventType: string, eventData: any, deviceInfo?: any) {
    return prisma.analyticsEvent.create({
      data: {
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        device_info: deviceInfo,
      },
    });
  }

  async getUserStats(userId: string) {
    const [totalMedications, totalLogs, takenLogs, skippedLogs] = await Promise.all([
      prisma.medication.count({ where: { user_id: userId } }),
      prisma.medicationLog.count({ where: { user_id: userId } }),
      prisma.medicationLog.count({ where: { user_id: userId, status: 'taken' } }),
      prisma.medicationLog.count({ where: { user_id: userId, status: 'skipped' } }),
    ]);

    return {
      total_medications: totalMedications,
      total_logs: totalLogs,
      taken: takenLogs,
      skipped: skippedLogs,
      adherence_rate: totalLogs > 0 ? (takenLogs / totalLogs) * 100 : 0,
    };
  }
}

export const analyticsService = new AnalyticsService();
