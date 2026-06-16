import { PageWrapper } from '@/components/layout/PageWrapper';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';

export default function AnalyticsPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-blue-500 mb-1">Insights</p>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
        </div>
        <AnalyticsView />
      </div>
    </PageWrapper>
  );
}
