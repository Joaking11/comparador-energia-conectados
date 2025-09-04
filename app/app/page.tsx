
import { Header } from '@/components/header';
import { Dashboard } from '@/components/dashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10">
      <Header />
      <Dashboard />
    </div>
  );
}
