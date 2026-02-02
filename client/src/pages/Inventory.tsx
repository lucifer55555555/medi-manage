import { Layout } from "@/components/Layout";
import { useInventory, useUpdateInventory } from "@/hooks/use-ihms";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Minus, Plus, AlertTriangle, Package, Calendar, Search } from "lucide-react";
import { format, isBefore, addDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Inventory() {
  const { data: items, isLoading } = useInventory();
  const updateInventory = useUpdateInventory();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const handleAdjust = (id: number, current: number, change: number) => {
    const newQuantity = Math.max(0, current + change);
    updateInventory.mutate({ id, quantity: newQuantity });
  };

  const inventoryStats = useMemo(() => {
    if (!items) return { total: 0, lowStock: 0, expiringSoon: 0 };
    const now = new Date();
    const soon = addDays(now, 30);
    
    return {
      total: items.length,
      lowStock: items.filter(i => i.quantity <= i.reorderLevel).length,
      expiringSoon: items.filter(i => i.quantity > 0 && isBefore(new Date(i.expiryDate), soon)).length
    };
  }, [items]);

  const filtered = items?.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || i.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display">Medical Inventory</h2>
          <p className="text-muted-foreground">Comprehensive tracking of hospital supplies and pharmaceuticals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-blue-50 border-blue-100 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">Total Items</p>
                  <h3 className="text-3xl font-bold text-blue-900 mt-1">{inventoryStats.total}</h3>
                </div>
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-100 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">Low Stock</p>
                  <h3 className="text-3xl font-bold text-amber-900 mt-1">{inventoryStats.lowStock}</h3>
                </div>
                <div className="p-3 bg-amber-500 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-rose-50 border-rose-100 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-rose-600 uppercase tracking-wider">Expiring Soon</p>
                  <h3 className="text-3xl font-bold text-rose-900 mt-1">{inventoryStats.expiringSoon}</h3>
                </div>
                <div className="p-3 bg-rose-500 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search inventory..." 
              className="pl-10" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              variant={filterType === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilterType("all")}
              className="flex-1 md:flex-none"
            >
              All
            </Button>
            <Button 
              variant={filterType === "Medicine" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilterType("Medicine")}
              className="flex-1 md:flex-none"
            >
              Medicines
            </Button>
            <Button 
              variant={filterType === "Consumable" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilterType("Consumable")}
              className="flex-1 md:flex-none"
            >
              Supplies
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
                <TableHead className="w-[300px]">Item Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="text-right">Manage Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center h-48">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-muted-foreground font-medium">Loading inventory data...</span>
                  </div>
                </TableCell></TableRow>
              ) : filtered?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center h-48 text-muted-foreground italic">
                  No items found matching your criteria.
                </TableCell></TableRow>
              ) : filtered?.map((item) => {
                const isLowStock = item.quantity <= item.reorderLevel;
                const expiryDate = new Date(item.expiryDate);
                const isExpired = isBefore(expiryDate, new Date());
                const isExpiring = item.quantity > 0 && isBefore(expiryDate, addDays(new Date(), 30));
                
                return (
                  <TableRow key={item.id} className={cn(
                    "hover:bg-muted/30 transition-colors",
                    isExpired && item.quantity > 0 && "bg-rose-50/50"
                  )}>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-foreground">{item.name}</p>
                          {isExpired && item.quantity > 0 && (
                            <Badge variant="destructive" className="h-4 text-[8px] px-1 uppercase">Expired</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{item.unit}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-bold border-primary/20 text-primary uppercase text-[10px]">
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-lg font-bold",
                          isLowStock ? "text-rose-600" : "text-emerald-600"
                        )}>
                          {item.quantity}
                        </span>
                        {isLowStock && (
                          <Badge variant="destructive" className="h-5 text-[10px] px-1.5 animate-pulse">
                            CRITICAL
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium">
                      {item.reorderLevel}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={cn(
                          "font-medium",
                          isExpired && item.quantity > 0 ? "text-destructive font-bold" :
                          isExpiring ? "text-rose-600" : "text-foreground"
                        )}>
                          {format(expiryDate, "MMM dd, yyyy")}
                        </span>
                        {isExpired && item.quantity > 0 ? (
                          <span className="text-[10px] text-destructive font-black uppercase tracking-tighter">
                            Dispose Immediately!
                          </span>
                        ) : isExpiring ? (
                          <span className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter">
                            Expiring Soon!
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-9 w-9 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all" 
                          onClick={() => handleAdjust(item.id, item.quantity, -1)}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="w-8 text-center font-bold" data-testid={`text-quantity-${item.id}`}>{item.quantity}</div>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-9 w-9 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all" 
                          onClick={() => handleAdjust(item.id, item.quantity, 1)}
                          data-testid={`button-increase-${item.id}`}
                        >
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
