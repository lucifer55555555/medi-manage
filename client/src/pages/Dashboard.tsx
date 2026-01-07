import { useStats } from "@/hooks/use-ihms";
import { Users, BedDouble, Calendar, Package, AlertCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  colorClass 
}: { 
  title: string; 
  value: string | number; 
  icon: any;
  trend?: string;
  colorClass: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2 font-display text-foreground">{value}</h3>
          {trend && <p className="text-xs text-green-500 mt-1 font-medium">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// Mock chart data - in a real app this would come from an API
const chartData = [
  { name: 'Mon', patients: 45, admissions: 12 },
  { name: 'Tue', patients: 52, admissions: 15 },
  { name: 'Wed', patients: 38, admissions: 8 },
  { name: 'Thu', patients: 65, admissions: 20 },
  { name: 'Fri', patients: 48, admissions: 14 },
  { name: 'Sat', patients: 25, admissions: 5 },
  { name: 'Sun', patients: 15, admissions: 3 },
];

export default function Dashboard() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <Layout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-muted/50 rounded-2xl" />
          ))}
        </div>
      </Layout>
    );
  }

  if (!stats) return null;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">Real-time hospital insights and analytics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <StatCard 
            title="Total Patients" 
            value={stats.totalPatients} 
            icon={Users} 
            colorClass="bg-blue-500 shadow-blue-500/25 shadow-lg"
          />
          <StatCard 
            title="Active Admissions" 
            value={stats.activeAdmissions} 
            icon={BedDouble} 
            colorClass="bg-purple-500 shadow-purple-500/25 shadow-lg"
          />
          <StatCard 
            title="Available Beds" 
            value={stats.availableBeds} 
            icon={Activity} 
            colorClass="bg-green-500 shadow-green-500/25 shadow-lg"
          />
          <StatCard 
            title="Pending Queue" 
            value={stats.pendingAppointments} 
            icon={Calendar} 
            colorClass="bg-orange-500 shadow-orange-500/25 shadow-lg"
          />
          <StatCard 
            title="Low Stock Items" 
            value={stats.lowStockItems} 
            icon={AlertCircle} 
            colorClass="bg-red-500 shadow-red-500/25 shadow-lg"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
            <h3 className="text-lg font-bold mb-6 font-display">Patient Flow</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
            <h3 className="text-lg font-bold mb-6 font-display">Admissions vs Discharges</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <Tooltip 
                     cursor={{fill: '#f3f4f6'}}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="admissions" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
