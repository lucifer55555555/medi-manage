import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { useBeds, usePatients, useCreateAdmission } from "@/hooks/use-ihms";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Bed, BedDouble, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export default function Beds() {
  const { data: beds, isLoading } = useBeds();
  const { data: patients } = usePatients();
  const createAdmission = useCreateAdmission();
  const { toast } = useToast();

  const [selectedBed, setSelectedBed] = useState<number | null>(null);
  const [patientId, setPatientId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [selectedWards, setSelectedWards] = useState<string[]>([]);

  const wards = useMemo(() => {
    if (!beds) return [];
    return Array.from(new Set(beds.map(b => b.ward)));
  }, [beds]);

  const filteredBeds = useMemo(() => {
    if (!beds) return [];
    if (selectedWards.length === 0) return beds;
    return beds.filter(b => selectedWards.includes(b.ward));
  }, [beds, selectedWards]);

  const toggleWard = (ward: string) => {
    setSelectedWards(prev => 
      prev.includes(ward) ? prev.filter(w => w !== ward) : [...prev, ward]
    );
  };

  const handleAdmit = async () => {
    if (!selectedBed || !patientId) return;
    try {
      await createAdmission.mutateAsync({
        bedId: selectedBed,
        patientId: parseInt(patientId),
        diagnosis,
        status: "active"
      });
      setSelectedBed(null);
      setPatientId("");
      setDiagnosis("");
      toast({ title: "Patient Admitted", description: "Bed status has been updated to occupied." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to admit patient", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display">Bed Management</h2>
          <p className="text-muted-foreground">Visual overview of ward capacity and occupancy.</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border/50">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
              <span className="text-sm font-medium">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-500 rounded"></div>
              <span className="text-sm font-medium">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-400 rounded"></div>
              <span className="text-sm font-medium">Maintenance</span>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-bold">Filter Wards:</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {wards.map(ward => (
                <div key={ward} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`ward-${ward}`} 
                    checked={selectedWards.includes(ward)}
                    onCheckedChange={() => toggleWard(ward)}
                  />
                  <label
                    htmlFor={`ward-${ward}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {ward}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-32 bg-muted/50 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredBeds?.map((bed) => {
              const isAvailable = bed.status === 'available';
              return (
                <div
                  key={bed.id}
                  onClick={() => isAvailable ? setSelectedBed(bed.id) : null}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2 h-32 hover:scale-105",
                    bed.status === 'available' ? "bg-green-50 border-green-200 hover:border-green-500 text-green-700 shadow-sm" :
                    bed.status === 'occupied' ? "bg-red-50 border-red-200 text-red-700 cursor-not-allowed opacity-90 shadow-sm" :
                    "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                  )}
                >
                  <BedDouble className="w-8 h-8" />
                  <div className="text-center">
                    <p className="font-bold">{bed.bedNumber}</p>
                    <p className="text-[10px] uppercase font-bold opacity-70 tracking-wider">{bed.type}</p>
                    <p className="text-[10px] mt-1 font-medium opacity-60">Ward: {bed.ward}</p>
                  </div>
                  {bed.status === 'occupied' && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Dialog open={!!selectedBed} onOpenChange={() => setSelectedBed(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Admit Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Patient</Label>
                <Select onValueChange={setPatientId}>
                  <SelectTrigger><SelectValue placeholder="Choose patient..." /></SelectTrigger>
                  <SelectContent>
                    {patients?.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Diagnosis</Label>
                <Input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Initial diagnosis..." />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedBed(null)}>Cancel</Button>
              <Button onClick={handleAdmit} disabled={createAdmission.isPending}>
                {createAdmission.isPending ? "Admitting..." : "Confirm Admission"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
