import { PageWrapper } from '@/components/layout/PageWrapper';
import { DayProgress } from '@/components/dashboard/DayProgress';
import { DailyChecklist } from '@/components/dashboard/DailyChecklist';
import { DailyScore } from '@/components/dashboard/DailyScore';
import MoodTracker from '@/components/dashboard/MoodTracker';
import LonelinessTracker from '@/components/dashboard/LonelinessTracker';

export default function HomePage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <DayProgress />
        <DailyScore />
        <DailyChecklist />
        <MoodTracker />
        <LonelinessTracker />
      </div>
    </PageWrapper>
  );
}
