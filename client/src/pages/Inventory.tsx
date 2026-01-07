import { Layout } from "@/components/Layout";
import { useInventory, useUpdateInventory } from "@/hooks/use-ihms";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Minus, Plus, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function Inventory() {
  const { data: items, isLoading } = useInventory();
  const updateInventory = useUpdateInventory();
  const [search, setSearch] = useState("");

  const handleAdjust = (id: number, current: number, change: number) => {
    const newQuantity = Math.max(0, current + change);
    updateInventory.mutate({ id, quantity: newQuantity });
  };

  const filtered = items?.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-display">Medical Inventory</h2>
            <p className="text-muted-foreground">Track stock levels and medicine expiry.</p>
          </div>
          <Input 
            placeholder="Search inventory..." 
            className="max-w-xs" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Item Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center h-24">Loading inventory...</TableCell></TableRow>
              ) : filtered?.map((item) => {
                const isLowStock = item.quantity <= item.reorderLevel;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {item.name}
                        {isLowStock && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      </div>
                    </TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      <Badge variant={isLowStock ? "destructive" : "secondary"} className={isLowStock ? "animate-pulse" : ""}>
                        {item.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{format(new Date(item.expiryDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleAdjust(item.id, item.quantity, -1)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleAdjust(item.id, item.quantity, 1)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
