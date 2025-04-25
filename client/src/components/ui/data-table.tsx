import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | string;
    header: string;
    cell: (item: T) => React.ReactNode;
    sortable?: boolean;
  }[];
  pagination?: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
  };
  searchable?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

export function DataTable<T>({
  data,
  columns,
  pagination,
  searchable = false,
  onSearch,
  searchPlaceholder = "Search...",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="w-full">
      {searchable && (
        <div className="flex space-x-2 mb-4">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
          </form>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-100">
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key.toString()}
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider"
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={index} className="bg-white">
                  {columns.map((column) => (
                    <TableCell key={column.key.toString()} className="px-6 py-4">
                      {column.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-neutral-500"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 sm:px-6 flex items-center justify-between mt-0 rounded-b-md">
          <div className="text-sm text-neutral-700">
            Showing{" "}
            <span className="font-medium">
              {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}
            </span>{" "}
            of <span className="font-medium">{pagination.totalItems}</span> results
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  pagination.onPageChange(pagination.currentPage - 1)
                }
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from(
                {
                  length: Math.ceil(
                    pagination.totalItems / pagination.itemsPerPage
                  ),
                },
                (_, i) => i + 1
              )
                .filter(
                  (page) =>
                    page === 1 ||
                    page === Math.ceil(pagination.totalItems / pagination.itemsPerPage) ||
                    Math.abs(page - pagination.currentPage) <= 1
                )
                .map((page, i, arr) => (
                  <React.Fragment key={page}>
                    {i > 0 && arr[i - 1] !== page - 1 && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium text-neutral-700">
                        ...
                      </span>
                    )}
                    <Button
                      variant={
                        page === pagination.currentPage ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => pagination.onPageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        page === pagination.currentPage
                          ? "border-primary bg-primary text-white"
                          : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  pagination.onPageChange(pagination.currentPage + 1)
                }
                disabled={
                  pagination.currentPage ===
                  Math.ceil(pagination.totalItems / pagination.itemsPerPage)
                }
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
