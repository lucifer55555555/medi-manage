import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Activity, ShieldCheck, HeartPulse } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 flex flex-col">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Activity className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold font-display text-primary">MediCore</span>
        </div>
        <a href="/api/login">
          <Button size="lg" className="shadow-lg shadow-primary/20">Login to Portal</Button>
        </a>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Modern Healthcare <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500">
              Management System
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your hospital operations with our integrated platform. From OPD queues to inventory tracking, we've got you covered.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
             <a href="/api/login">
               <Button size="xl" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 transition-all hover:-translate-y-1">
                 Get Started
               </Button>
             </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-16 text-left">
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Patient Care</h3>
              <p className="text-sm text-muted-foreground">Comprehensive patient records and history tracking at your fingertips.</p>
            </div>
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Secure & Reliable</h3>
              <p className="text-sm text-muted-foreground">Enterprise-grade security ensuring your medical data remains private and protected.</p>
            </div>
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-green-600">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Real-time Analytics</h3>
              <p className="text-sm text-muted-foreground">Instant insights into bed occupancy, OPD queues, and inventory levels.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground">
        © 2024 MediCore IHMS. All rights reserved.
      </footer>
    </div>
  );
}
