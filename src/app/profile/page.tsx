import { PageWrapper } from '@/components/layout/PageWrapper';
import AchievementSystem from '@/components/achievements/AchievementSystem';
import { SettingsPanel } from '@/components/profile/SettingsPanel';

export default function ProfilePage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-1">Your Journey</p>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
        </div>
        <AchievementSystem />
        <SettingsPanel />
      </div>
    </PageWrapper>
  );
}
