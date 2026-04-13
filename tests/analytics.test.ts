import { analyticsService } from '../src/services/analytics.service';
import { mockPrisma } from './mocks';

describe('Analytics Service', () => {
  describe('trackEvent', () => {
    it('should track anonymous event', async () => {
      mockPrisma.analyticsEvent.create.mockResolvedValue({
        id: 'event-123',
        event_type: 'app_opened',
        event_data: { source: 'notification' },
        device_info: { userAgent: 'Mozilla/5.0' },
        created_at: new Date(),
      });

      const result = await analyticsService.trackEvent(
        'app_opened',
        { source: 'notification' },
        { userAgent: 'Mozilla/5.0' }
      );

      expect(result).toBeDefined();
      expect(result.event_type).toBe('app_opened');
      expect(mockPrisma.analyticsEvent.create).toHaveBeenCalledWith({
        data: {
          event_type: 'app_opened',
          event_data: { source: 'notification' },
          device_info: { userAgent: 'Mozilla/5.0' },
        },
      });
    });

    it('should track event without data', async () => {
      mockPrisma.analyticsEvent.create.mockResolvedValue({
        id: 'event-123',
        event_type: 'button_clicked',
        event_data: null,
        device_info: null,
        created_at: new Date(),
      });

      const result = await analyticsService.trackEvent('button_clicked', undefined, undefined);

      expect(result).toBeDefined();
      expect(result.event_type).toBe('button_clicked');
    });
  });

  describe('getStats', () => {
    it('should return aggregate statistics', async () => {
      mockPrisma.analyticsEvent.count
        .mockResolvedValueOnce(100)   // totalEvents
        .mockResolvedValueOnce(50)    // eventsToday
        .mockResolvedValueOnce(200)   // eventsThisWeek
        .mockResolvedValueOnce(500);  // eventsThisMonth
      
      mockPrisma.analyticsEvent.groupBy.mockResolvedValue([
        { event_type: 'app_opened', _count: { event_type: 50 } },
        { event_type: 'button_clicked', _count: { event_type: 30 } },
      ]);

      const stats = await analyticsService.getStats();

      expect(stats.total_events).toBe(100);
      expect(stats.events_today).toBe(50);
      expect(stats.events_this_week).toBe(200);
      expect(stats.events_this_month).toBe(500);
      expect(stats.top_events).toHaveLength(2);
      expect(stats.top_events[0]).toEqual({
        event_type: 'app_opened',
        count: 50,
      });
    });

    it('should handle empty database', async () => {
      mockPrisma.analyticsEvent.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      
      mockPrisma.analyticsEvent.groupBy.mockResolvedValue([]);

      const stats = await analyticsService.getStats();

      expect(stats.total_events).toBe(0);
      expect(stats.events_today).toBe(0);
      expect(stats.top_events).toHaveLength(0);
    });
  });
});
