
import { Header } from '@/components/header';
import { Dashboard } from '@/components/dashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <Dashboard />
    </div>
  );
}
