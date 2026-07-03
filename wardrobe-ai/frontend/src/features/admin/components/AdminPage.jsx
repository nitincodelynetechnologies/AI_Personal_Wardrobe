'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAdminGuard } from '@/features/auth/hooks/useAdminGuard';
import { AdminLayout } from '@/features/admin/components/AdminLayout';
import { AdminDashboard } from '@/features/admin/components/AdminDashboard';
import { AdminCatalogManager } from '@/features/admin/components/AdminCatalogManager';
import { AdminOrdersManager } from '@/features/admin/components/AdminOrdersManager';
import { AdminCustomersPanel } from '@/features/admin/components/AdminCustomersPanel';
import { AdminCouponsManager } from '@/features/admin/components/AdminCouponsManager';
import { AdminRegisteredUsersPanel } from '@/features/admin/components/AdminRegisteredUsersPanel';

export function AdminPage() {
  const { ready } = useAdminGuard();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (!ready) {
    return (
      <div className="admin-console midnight-shell flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-magenta" aria-label="Loading admin console" />
      </div>
    );
  }

  function renderSection(section) {
    switch (section) {
      case 'inventory':
        return <AdminCatalogManager />;
      case 'orders':
        return <AdminOrdersManager />;
      case 'users':
        return <AdminRegisteredUsersPanel />;
      case 'customers':
        return <AdminCustomersPanel />;
      case 'coupons':
        return <AdminCouponsManager />;
      case 'dashboard':
      default:
        return <AdminDashboard />;
    }
  }

  return (
    <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderSection(activeSection)}
    </AdminLayout>
  );
}

export default AdminPage;
