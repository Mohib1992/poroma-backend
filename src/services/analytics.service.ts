import { prisma } from '../config';

export class AnalyticsService {
  async trackEvent(eventType: string, eventData: any, deviceInfo?: any) {
    return prisma.analyticsEvent.create({
      data: {
        event_type: eventType,
        event_data: eventData,
        device_info: deviceInfo,
      },
    });
  }

  async getStats() {
    const [
      totalEvents,
      eventsByType,
      eventsToday,
      eventsThisWeek,
      eventsThisMonth,
    ] = await Promise.all([
      prisma.analyticsEvent.count(),
      prisma.analyticsEvent.groupBy({
        by: ['event_type'],
        _count: { event_type: true },
        orderBy: { _count: { event_type: 'desc' } },
        take: 20,
      }),
      prisma.analyticsEvent.count({
        where: {
          created_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total_events: totalEvents,
      events_today: eventsToday,
      events_this_week: eventsThisWeek,
      events_this_month: eventsThisMonth,
      top_events: eventsByType.map((e) => ({
        event_type: e.event_type,
        count: e._count.event_type,
      })),
    };
  }
}

export const analyticsService = new AnalyticsService();
