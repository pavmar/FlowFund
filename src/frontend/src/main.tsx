import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './App';
import Layout from './layouts/dashboard';
import DashboardPage from './pages';
import LenderActivatePage from './pages/lenderActivate';
import SignInPage from './pages/signin';
import BorrowPage from './pages/borrow';
import WalletPage from './pages/wallet';
import AboutPage from './pages/about';
import SettingsPage from './pages/settings';
import SignUp from './pages/signup';

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          {
            path: '',
            Component: DashboardPage,
          },
          {
            path: 'borrow',
            Component: BorrowPage,
          },
          {
            path: 'lenderActivate',
            Component: LenderActivatePage,
          },
          {
            path: 'wallet',
            Component: WalletPage,
          },
          {
            path: 'about',
            Component: AboutPage,
          },
          {
            path: 'settings',
            Component: SettingsPage,
          }
        ],
      },
      {
        path: '/sign-in',
        Component: SignInPage,
      },
      {
        path : '/sign-up',
        Component: SignUp,
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);