import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useAppointments, useCreateAppointment, useUpdateAppointment, usePatients, useDoctors } from "@/hooks/use-ihms";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, 
  DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Check, Clock, X, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Appointments() {
  const { data: appointments, isLoading } = useAppointments();
  const { data: patients } = usePatients();
  const { data: doctors } = useDoctors();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  // Form State
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [date, setDate] = useState("");

  const handleCreate = async () => {
    try {
      await createAppointment.mutateAsync({
        patientId: parseInt(patientId),
        doctorId: parseInt(doctorId),
        symptoms,
        date: new Date(date).toISOString(), // Should ideally be proper datetime
        status: 'scheduled'
      });
      setIsOpen(false);
      toast({ title: "Appointment Created", description: "The appointment has been scheduled successfully." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to create appointment", variant: "destructive" });
    }
  };

  const handleStatusUpdate = (id: number, status: string) => {
    updateAppointment.mutate({ id, status }, {
      onSuccess: () => toast({ title: "Status Updated", description: `Appointment marked as ${status}` })
    });
  };

  const filteredAppointments = appointments?.filter(apt => 
    apt.status.includes(search.toLowerCase()) || 
    patients?.find(p => p.id === apt.patientId)?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-display">OPD & Queue</h2>
            <p className="text-muted-foreground">Manage patient appointments and doctor queues.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                <Plus className="w-5 h-5 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Appointment</DialogTitle>
                <DialogDescription>Add a new patient to the OPD queue.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select onValueChange={setPatientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients?.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Doctor</Label>
                  <Select onValueChange={setDoctorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors?.map(d => (
                        <SelectItem key={d.id} value={d.id.toString()}>{d.name} ({d.specialty})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Symptoms</Label>
                  <Input placeholder="Fever, cough..." value={symptoms} onChange={e => setSymptoms(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createAppointment.isPending}>
                  {createAppointment.isPending ? "Booking..." : "Book Appointment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by patient name or status..." 
            className="pl-10 max-w-md bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAppointments?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No appointments found.</div>
            )}
            {filteredAppointments?.map((apt) => {
              const patient = patients?.find(p => p.id === apt.patientId);
              const doctor = doctors?.find(d => d.id === apt.doctorId);
              
              return (
                <div key={apt.id} className="bg-card p-4 rounded-xl border border-border/50 shadow-sm flex items-center justify-between group hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {apt.queueNumber || "?"}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{patient?.name || "Unknown Patient"}</h3>
                      <p className="text-sm text-muted-foreground">Dr. {doctor?.name} • {format(new Date(apt.date), "PPP p")}</p>
                      {apt.symptoms && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {apt.symptoms}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                      ${apt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 
                        apt.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                      {apt.status}
                    </div>
                    
                    {apt.status === 'scheduled' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStatusUpdate(apt.id, 'completed')}>
                          <Check className="w-4 h-4 mr-1" /> Complete
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleStatusUpdate(apt.id, 'cancelled')}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
