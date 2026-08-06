import * as React from 'react';
import { runtime } from '../runtime/container';
import { Button } from '../design-system/Button';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r flex flex-col">
        <div className="h-14 border-b flex items-center px-4 font-bold tracking-tight">
          NS3 OS
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {runtime.featureRegistry.getFeatures().map(feature => {
            const defaultRoute = feature.routes?.[0]?.path;
            return (
              <div 
                key={feature.id} 
                className="text-sm font-medium px-2 py-1.5 text-muted-foreground hover:text-foreground cursor-pointer hover:bg-muted rounded-md"
                onClick={() => {
                  if (defaultRoute) {
                    window.history.pushState({}, '', defaultRoute);
                    window.dispatchEvent(new Event('popstate'));
                  }
                }}
              >
                {feature.name}
              </div>
            );
          })}
        </nav>
        <div className="p-4 border-t text-xs text-muted-foreground flex justify-between items-center">
          <span>{runtime.liveClient ? 'Live connected' : 'Disconnected'}</span>
          <Button variant="outline" size="sm" onClick={() => runtime.commandRegistry.execute('cmd.palette.open')}>
            Cmd+K
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b flex items-center px-6 justify-between bg-card shrink-0">
          <div className="font-medium text-sm text-muted-foreground">
            {/* Breadcrumb would go here */}
            Global / Selected Context
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              U
            </div>
          </div>
        </header>

        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-auto bg-muted/20 p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
