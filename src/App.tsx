
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ResetPassword from '@/pages/ResetPassword';
import ConfirmEmail from '@/pages/ConfirmEmail';
import VerifyEmail from '@/pages/VerifyEmail';
import Dashboard from '@/pages/Dashboard';
import DashboardAccount from '@/pages/dashboard/Account';
import DashboardTrainingPlans from '@/pages/dashboard/TrainingPlans';
import DashboardSchedule from '@/pages/dashboard/Schedule';
import DashboardProgress from '@/pages/dashboard/Progress';
import DashboardPayment from '@/pages/dashboard/Payment';
import DashboardSupport from '@/pages/dashboard/Support';
import DashboardSettings from '@/pages/dashboard/Settings';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminInvoices from '@/pages/admin/AdminInvoices';
import AdminPayments from '@/pages/admin/AdminPayments';
import NotFound from '@/pages/NotFound';
import Schedule from '@/pages/Schedule';
import Plans from '@/pages/Plans';
import Payment from '@/pages/Payment';
import PaymentPortal from '@/pages/PaymentPortal';
import { AuthProvider } from '@/components/AuthProvider';
import StripeProvider from '@/components/StripeProvider';
import PlansCatalog from '@/pages/PlansCatalog';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentCancelled from '@/pages/PaymentCancelled';
import AdminSessions from '@/components/admin/AdminSessions';
import AdminTickets from '@/components/admin/AdminTickets';
import AdminNotifications from '@/components/admin/AdminNotifications';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminQuotes from '@/components/admin/AdminQuotes';
import AdminOverview from '@/components/admin/AdminOverview';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StripeProvider>
          <div className="app-container">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/payment-portal" element={<PaymentPortal />} />
              <Route path="/confirm-email" element={<ConfirmEmail />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/plans-catalog" element={<PlansCatalog />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-cancelled" element={<PaymentCancelled />} />

              {/* Dashboard Routes */}
              <Route path="/dashboard/account" element={<DashboardAccount />} />
              <Route path="/dashboard/plans" element={<DashboardTrainingPlans />} />
              <Route path="/dashboard/schedule" element={<DashboardSchedule />} />
              <Route path="/dashboard/progress" element={<DashboardProgress />} />
              <Route path="/dashboard/payment" element={<DashboardPayment />} />
              <Route path="/dashboard/support" element={<DashboardSupport />} />
              <Route path="/dashboard/settings" element={<DashboardSettings />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/overview" element={<AdminOverview />} />
              <Route path="/admin/sessions" element={<AdminSessions />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/invoices" element={<AdminInvoices />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/tickets" element={<AdminTickets />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/quotes" element={<AdminQuotes />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </StripeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
