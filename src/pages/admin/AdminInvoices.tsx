
import { useState } from "react";
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  ChevronDown
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const AdminInvoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-gray-400">Manage and view all customer invoices</p>
          </div>
          <Button className="bg-[#ea384c] hover:bg-[#d32d3f]">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="h-5 w-5 mr-2 text-[#ea384c]" />
              Invoice Management
            </CardTitle>
            <CardDescription>
              View and manage all invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex justify-between items-center p-4 border-b border-[#333333]">
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="Search invoices..." 
                    className="pl-9 w-64 bg-[#1A1A1A] border-[#333333]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-[#333333]">
                      <Filter className="h-4 w-4 mr-2" />
                      Status: {filterStatus === "all" ? "All" : filterStatus}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#333333]">
                    <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("Paid")}>
                      Paid
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("Pending")}>
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("Overdue")}>
                      Overdue
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="border-[#333333]">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="text-center">
                  <TableCell colSpan={6} className="py-10">
                    <div className="flex flex-col items-center">
                      <FileText className="h-10 w-10 text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium mb-1">No invoices yet</h3>
                      <p className="text-gray-400 max-w-md">
                        Invoices from your Stripe account will appear here automatically.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminInvoices;
