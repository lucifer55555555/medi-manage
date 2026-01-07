import { Layout } from "@/components/Layout";
import { useAdmissions, usePatients, useBeds, useDischargePatient } from "@/hooks/use-ihms";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { LogOut } from "lucide-react";

export default function Admissions() {
  const { data: admissions, isLoading } = useAdmissions();
  const { data: patients } = usePatients();
  const { data: beds } = useBeds();
  const discharge = useDischargePatient();
  const { toast } = useToast();

  const handleDischarge = (id: number) => {
    if (confirm("Are you sure you want to discharge this patient?")) {
      discharge.mutate({ id, dischargeDate: new Date().toISOString() }, {
        onSuccess: () => toast({ title: "Success", description: "Patient discharged successfully." })
      });
    }
  };

  const activeAdmissions = admissions?.filter(a => a.status === 'active');

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display">Active Admissions</h2>
          <p className="text-muted-foreground">Patients currently admitted in the hospital.</p>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <div className="text-center py-10">Loading admissions...</div>
          ) : activeAdmissions?.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl text-muted-foreground">
              No active admissions found.
            </div>
          ) : (
            activeAdmissions?.map(admission => {
              const patient = patients?.find(p => p.id === admission.patientId);
              const bed = beds?.find(b => b.id === admission.bedId);

              return (
                <div key={admission.id} className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">{patient?.name}</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Admitted: {format(new Date(admission.admissionDate), "PPP")}</span>
                      <span>•</span>
                      <span>Diagnosis: {admission.diagnosis}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Assigned Bed</p>
                      <p className="text-lg font-mono font-bold text-primary">{bed?.bedNumber} <span className="text-xs font-normal text-muted-foreground">({bed?.ward})</span></p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => handleDischarge(admission.id)}
                      disabled={discharge.isPending}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Discharge
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
