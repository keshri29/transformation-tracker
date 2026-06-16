import { PageWrapper } from '@/components/layout/PageWrapper';
import { ProductBuilder } from '@/components/product/ProductBuilder';
import { FinanceTracker } from '@/components/finance/FinanceTracker';

export default function ProductPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-purple-500 mb-1">Building</p>
          <h1 className="text-2xl font-bold text-white">Product & Finance</h1>
        </div>
        <ProductBuilder />
        <FinanceTracker />
      </div>
    </PageWrapper>
  );
}
