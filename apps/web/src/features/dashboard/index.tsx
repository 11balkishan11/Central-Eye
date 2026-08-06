
import type { Feature } from '../../runtime/FeatureRegistry';
import { Card, CardHeader, CardTitle, CardContent } from '../../design-system/Card';

const DashboardView = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,204</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const DashboardFeature: Feature = {
  id: 'dashboard',
  name: 'Dashboard',
  routes: [
    {
      path: '/',
      component: DashboardView,
      title: 'Dashboard'
    }
  ]
};
