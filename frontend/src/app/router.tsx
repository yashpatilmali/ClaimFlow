import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './AppShell';
import { HomePage } from '../features/home/HomePage';
import { NewClaimWizard } from '../features/new-claim/NewClaimWizard';
import { ClaimsListPage } from '../features/claims/ClaimsListPage';
import { ClaimDetailPage } from '../features/claims/ClaimDetailPage';
import { ReviewQueuePage } from '../features/review/ReviewQueuePage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { TestLabPage } from '../features/test-lab/TestLabPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'claims',
        children: [
          {
            index: true,
            element: <ClaimsListPage />,
          },
          {
            path: 'new',
            element: <NewClaimWizard />,
          },
          {
            path: ':id',
            element: <ClaimDetailPage />,
          },
        ],
      },
      {
        path: 'review',
        element: <ReviewQueuePage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'test-lab',
        element: <TestLabPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
