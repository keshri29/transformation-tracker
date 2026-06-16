import { PageWrapper } from '@/components/layout/PageWrapper';
import { HabitTracker } from '@/components/habits/HabitTracker';
import { HeatMap } from '@/components/habits/HeatMap';
import { BodyTracker } from '@/components/body/BodyTracker';
import { CareerTracker } from '@/components/career/CareerTracker';

export default function HabitsPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-1">Daily</p>
          <h1 className="text-2xl font-bold text-white">Habits & Body</h1>
        </div>
        <HabitTracker />
        <HeatMap />
        <BodyTracker />
        <CareerTracker />
      </div>
    </PageWrapper>
  );
}
