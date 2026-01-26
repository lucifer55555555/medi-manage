import { useStats, useAdmissions, usePatients, useAppointments, useDoctors } from "@/hooks/use-ihms";
import { Users, BedDouble, Calendar, Package, AlertCircle, Activity, ArrowRight, UserCheck, Stethoscope, PieChart as PieChartIcon } from "lucide-react";
import { Layout } from "@/components/Layout";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    <Card className="hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-card to-muted/20 overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
            <h3 className="text-4xl font-black font-display tracking-tight text-foreground group-hover:scale-105 transition-transform origin-left">{value}</h3>
            {trend && <p className="text-xs text-green-500 font-bold bg-green-500/10 w-fit px-2 py-0.5 rounded-full">{trend}</p>}
          </div>
          <div className={`p-4 rounded-2xl ${colorClass} group-hover:rotate-6 transition-transform`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: admissions, isLoading: admissionsLoading } = useAdmissions();
  const { data: patients } = usePatients();
  const { data: appointments } = useAppointments();
  const { data: doctors } = useDoctors();

  const isLoading = statsLoading || admissionsLoading;

  const demographicsData = useMemo(() => {
    if (!patients) return [];
    const counts = patients.reduce((acc: any, p) => {
      acc[p.gender] = (acc[p.gender] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [patients]);

  const deptDistribution = useMemo(() => {
    if (!doctors) return [];
    const counts = doctors.reduce((acc: any, d) => {
      acc[d.specialty] = (acc[d.specialty] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [doctors]);

  const flowData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    return Array.from({ length: 7 }).map((_, i) => {
      const dayIdx = (today - 6 + i + 7) % 7;
      return {
        name: days[dayIdx],
        patients: 30 + Math.floor(Math.random() * 40),
        admissions: 5 + Math.floor(Math.random() * 15),
      };
    });
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-40 bg-muted/50 rounded-2xl" />
          ))}
        </div>
      </Layout>
    );
  }

  if (!stats) return null;

  return (
    <Layout>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-black text-green-600 uppercase tracking-widest">Live Operations</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight font-display text-foreground">Analytics Hub</h2>
            <p className="text-muted-foreground font-medium">Predictive insights and hospital-wide performance monitoring.</p>
          </div>
          <div className="flex gap-3">
            <Card className="px-4 py-2 border-none bg-primary/5 flex items-center gap-3">
              <Stethoscope className="w-5 h-5 text-primary" />
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-tighter">On-Duty</p>
                <p className="text-sm font-bold">{doctors?.length || 0} Doctors</p>
              </div>
            </Card>
            <Card className="px-4 py-2 border-none bg-purple-500/5 flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-tighter">Staffed</p>
                <p className="text-sm font-bold">12 Nurse(s)</p>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <StatCard 
            title="Active Patients" 
            value={stats.totalPatients} 
            icon={Users} 
            trend="+12% this week"
            colorClass="bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20 shadow-xl"
          />
          <StatCard 
            title="In-Patient" 
            value={stats.activeAdmissions} 
            icon={BedDouble} 
            trend="85% occupancy"
            colorClass="bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/20 shadow-xl"
          />
          <StatCard 
            title="Available Beds" 
            value={stats.availableBeds} 
            icon={Activity} 
            colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20 shadow-xl"
          />
          <StatCard 
            title="OPD Queue" 
            value={stats.pendingAppointments} 
            icon={Calendar} 
            trend="Avg wait 15m"
            colorClass="bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/20 shadow-xl"
          />
          <StatCard 
            title="Inventory Alerts" 
            value={stats.lowStockItems} 
            icon={AlertCircle} 
            colorClass="bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/20 shadow-xl"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
            <Card className="border-none shadow-xl shadow-muted/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black font-display tracking-tight">System Utilization</CardTitle>
                  <p className="text-xs text-muted-foreground font-medium">Daily patient flow vs clinical admissions</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Flow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Admits</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={flowData}>
                      <defs>
                        <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAdmits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontWeight: 600, fontSize: 12}} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontWeight: 600, fontSize: 12}} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                          padding: '12px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="patients" 
                        stroke="#3b82f6" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorPatients)" 
                        animationDuration={1500}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="admissions" 
                        stroke="#8b5cf6" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorAdmits)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-none shadow-xl shadow-muted/20">
                <CardHeader>
                  <CardTitle className="text-lg font-black font-display">Staffing Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deptDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {deptDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl shadow-muted/20">
                <CardHeader>
                  <CardTitle className="text-lg font-black font-display">Patient Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={demographicsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-8">
            <Card className="border-none shadow-xl shadow-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-black font-display flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Clinical Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {admissions && admissions.length > 0 ? (
                    admissions.slice(0, 6).map((admission) => {
                      const patient = patients?.find(p => p.id === admission.patientId);
                      return (
                        <div key={admission.id} className="group relative p-4 rounded-2xl bg-muted/20 border border-border/50 hover:bg-card hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">
                                {patient?.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="font-bold text-sm tracking-tight">{patient?.name || 'Unknown Patient'}</p>
                                <p className="text-[10px] font-medium text-muted-foreground">Ward: {admission.bedId}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none font-black text-[9px] uppercase tracking-tighter">Stable</Badge>
                              <p className="text-[10px] text-muted-foreground mt-1 font-bold">{admission.diagnosis || 'General Observation'}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground font-bold italic tracking-tight">All beds clear for now</p>
                    </div>
                  )}
                </div>
                {admissions && admissions.length > 6 && (
                  <button className="w-full mt-6 py-3 rounded-xl border border-dashed border-border text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all flex items-center justify-center gap-2">
                    Access Clinical Directory <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </CardContent>
            </Card>

            <Card className="border-none bg-gradient-to-br from-primary to-blue-700 text-primary-foreground shadow-2xl shadow-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                    <PieChartIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black font-display tracking-tight">Department IQ</h3>
                </div>
                <p className="text-sm font-medium text-white/80 leading-relaxed">
                  Radiology and Emergency departments are operating at peak efficiency. Consider staff rotation for Night Shift.
                </p>
                <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">System Health</span>
                  <span className="text-sm font-bold">Optimal</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
