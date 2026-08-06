import * as React from 'react';
import { runtime } from './runtime/container';
import { AppLayout } from './layouts/AppLayout';

// In a real app we'd use TanStack Router, but to prove the runtime quickly without 
// complex routing file generation, we'll do a simple feature-based router MVP.

function App() {
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Find matching route across all features
  let ActiveComponent: React.ComponentType | null = null;
  const features = runtime.featureRegistry.getFeatures();
  for (const feature of features) {
    const route = feature.routes?.find(r => r.path === currentPath);
    if (route) {
      ActiveComponent = route.component;
      break;
    }
  }

  // Fallback to first route if none matches
  if (!ActiveComponent && features.length > 0 && features[0].routes && features[0].routes.length > 0) {
    ActiveComponent = features[0].routes[0].component;
  }

  return (
    <AppLayout>
      {ActiveComponent ? <ActiveComponent /> : <div>404 Not Found</div>}
    </AppLayout>
  );
}

export default App;
