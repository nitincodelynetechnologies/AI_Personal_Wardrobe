'use client';

import { useState } from 'react';
import { useAdminGuard } from '@/features/auth/hooks/useAdminGuard';
import { AdminLayout } from '@/features/admin/components/AdminLayout';
import { AdminOverview } from '@/features/admin/components/AdminOverview';
import { AdminSectionPanel } from '@/features/admin/components/AdminSectionPanel';
import { AdminCatalogManager } from '@/features/admin/components/AdminCatalogManager';
import { RecentOrdersTable } from '@/features/admin/components/RecentOrdersTable';
import {
  ADMIN_AI_METRICS,
  ADMIN_USER_STATS,
  RECENT_ORDERS,
} from '@/features/admin/constants/adminMockData';

export function AdminPage() {
  const { ready } = useAdminGuard();
  const [activeSection, setActiveSection] = useState('overview');

  if (!ready) {
    return null;
  }

  function renderSection(section) {
    switch (section) {
      case 'users':
        return (
          <AdminSectionPanel
            title="User Statistics"
            description="Registration, biometric enrollment, and onboarding completion across the platform."
            stats={ADMIN_USER_STATS}
          />
        );
      case 'catalog':
        return <AdminCatalogManager />;
      case 'orders':
        return (
          <AdminSectionPanel
            title="Orders Pipeline"
            description="Monitor fulfillment status and high-value transactions."
          >
            <RecentOrdersTable orders={RECENT_ORDERS} title="All Recent Orders" />
          </AdminSectionPanel>
        );
      case 'ai':
        return (
          <AdminSectionPanel
            title="AI Performance"
            description="Inference volume, stylist engagement, and service latency benchmarks."
            stats={ADMIN_AI_METRICS}
          />
        );
      case 'overview':
      default:
        return <AdminOverview onNavigate={setActiveSection} />;
    }
  }

  return (
    <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderSection(activeSection)}
    </AdminLayout>
  );
}

export default AdminPage;
