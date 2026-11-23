import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Home,
  FilePlus,
  Files,
  Inbox,
  BarChart3,
  FlaskConical,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
} from 'lucide-react';
import { api } from '../lib/api-client';
import { Badge } from '../components/ui/badge';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const { data: queue = [] } = useQuery({
    queryKey: ['hitl-queue'],
    queryFn: api.getHitlQueue,
    refetchInterval: 10000,
  });

  const pendingCount = queue.length;

  const navItems = [
    { to: '/', label: 'Home', icon: Home, exact: true },
    { to: '/claims/new', label: 'New claim', icon: FilePlus },
    { to: '/claims', label: 'Claims', icon: Files },
    {
      to: '/review',
      label: 'Review queue',
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeVariant: 'warning' as const,
    },
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/test-lab', label: 'Test lab', icon: FlaskConical },
  ];

  return (
    <aside
      className={`border-r border-rule bg-surface flex flex-col justify-between transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-14 border-b border-rule flex items-center px-4 gap-3">
          <div className="h-8 w-8 rounded-panel bg-ink text-surface flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-bold text-sm text-ink block leading-tight">ClaimFlow</span>
              <span className="text-xs text-muted block leading-tight">P&C Orchestrator</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-2 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-input text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-ink text-surface shadow-sm'
                      : 'text-muted hover:text-ink hover:bg-paper'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <Badge variant={item.badgeVariant}>{item.badge}</Badge>
                )}
                {collapsed && item.badge && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-status-review" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-rule">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-2 py-1.5 rounded-input text-xs text-muted hover:text-ink hover:bg-paper w-full transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4 mx-auto" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 shrink-0" />
              <span className="truncate">Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
