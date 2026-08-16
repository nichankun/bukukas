// src/components/buku-kas/kas-data-table.tsx
"use client";

import * as React from "react";
import {
  useTable,
  tableFeatures,
  columnFilteringFeature,
  columnVisibilityFeature,
  rowSortingFeature,
  rowPaginationFeature,
  createFilteredRowModel,
  createSortedRowModel,
  createPaginatedRowModel,
  filterFn_includesString,
  sortFn_alphanumeric,
  sortFn_text,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  MoreVertical,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { formatRupiah } from "@/lib/kas-utils";

export interface TransactionRow {
  id: number;
  day: number;
  description: string;
  type: "debet" | "kredit";
  amount: number;
  runningSaldo: number;
}

// Konfigurasi Fitur TanStack Table v9
const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
});

type DataTableFeatures = typeof features;

const PAGE_SIZE_OPTIONS: number[] = [5, 10, 20, 50];

interface KasDataTableProps {
  data: TransactionRow[];
  totalDebet: number;
  totalKredit: number;
  onEdit: (item: TransactionRow) => void;
  onDelete: (id: number) => void;
}

export function KasDataTable({
  data,
  totalDebet,
  totalKredit,
  onEdit,
  onDelete,
}: KasDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // State Pagination React (Terkontrol)
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = React.useMemo<ColumnDef<DataTableFeatures, TransactionRow>[]>(
    () => [
      {
        accessorKey: "day",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center font-semibold text-xs sm:text-sm -ml-1 sm:-ml-2 h-8 px-1 sm:px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tgl
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center font-medium text-xs sm:text-sm">
            {row.getValue("day")}
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="justify-start font-semibold text-xs sm:text-sm -ml-2 h-8 px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Keterangan
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-xs sm:text-sm font-medium text-foreground whitespace-normal">
            {row.getValue("description")}
          </div>
        ),
      },
      {
        accessorKey: "debet",
        header: () => (
          <div className="text-right font-semibold text-xs sm:text-sm">Debet</div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-right font-medium text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
              {item.type === "debet" ? formatRupiah(item.amount) : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "kredit",
        header: () => (
          <div className="text-right font-semibold text-xs sm:text-sm">Kredit</div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-right font-medium text-xs sm:text-sm text-rose-600 dark:text-rose-400 whitespace-nowrap">
              {item.type === "kredit" ? formatRupiah(item.amount) : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "runningSaldo",
        header: () => (
          <div className="text-right font-semibold text-xs sm:text-sm">Saldo</div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-medium text-xs sm:text-sm whitespace-nowrap">
            {formatRupiah(row.getValue("runningSaldo"))}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => (
          <div className="text-center font-semibold text-xs sm:text-sm print:hidden">
            Aksi
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-center print:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                    <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [onEdit, onDelete]
  );

  const table = useTable({
    features,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  const netBulan = totalDebet - totalKredit;
  const pageCount = table.getPageCount() || 1;
  const currentPage = pagination.pageIndex + 1;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Search Input */}
      <div className="flex items-center justify-between gap-2 print:hidden">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Cari keterangan..."
            value={
              (table.getColumn("description")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("description")?.setFilterValue(event.target.value)
            }
            className="pl-8 bg-background h-8 sm:h-9 text-base sm:text-sm"
          />
        </div>
      </div>

      {/* Tabel Responsif */}
      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto touch-pan-x">
          <Table className="min-w-140 w-full">
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`h-9 sm:h-10 px-2 sm:px-4 ${
                        header.id === "day"
                          ? "w-14 sm:w-16"
                          : header.id === "actions"
                          ? "w-12 sm:w-14"
                          : ""
                      }`}
                    >
                      {header.isPlaceholder
                        ? null
                        : (
                          <table.FlexRender header={header} />
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/30">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2 sm:py-2.5 px-2 sm:px-4">
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-20 text-center text-xs sm:text-sm text-muted-foreground"
                  >
                    Tidak ada transaksi yang ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            {/* Footer Total Bulan Ini */}
            <TableFooter className="bg-muted/50 font-bold text-xs sm:text-sm">
              <TableRow>
                <TableCell colSpan={2} className="text-center font-bold px-2 sm:px-4">
                  Total Bulan Ini
                </TableCell>
                <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-bold px-2 sm:px-4 whitespace-nowrap">
                  {formatRupiah(totalDebet)}
                </TableCell>
                <TableCell className="text-right text-rose-600 dark:text-rose-400 font-bold px-2 sm:px-4 whitespace-nowrap">
                  {formatRupiah(totalKredit)}
                </TableCell>
                <TableCell
                  className={`text-right font-bold px-2 sm:px-4 whitespace-nowrap ${
                    netBulan < 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {formatRupiah(netBulan)}
                </TableCell>
                <TableCell className="print:hidden"></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* KONTROL PAGINATION & PILIHAN JUMLAH BARIS (10, 25, 50, 100)  */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2 print:hidden text-xs sm:text-sm text-muted-foreground">
        {/* Info Total Transaksi */}
        <div className="text-xs">
          Total: <span className="font-semibold text-foreground">{totalRows}</span> transaksi
        </div>

        {/* Kontrol Baris & Navigasi Halaman */}
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center">
          {/* Dropdown 10, 25, 50, 100 */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs shrink-0">Tampilkan:</span>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-18.5 bg-background text-xs font-semibold">
                <SelectValue placeholder={`${pagination.pageSize}`} />
              </SelectTrigger>
              <SelectContent side="top">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={`${size}`} className="text-xs">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs shrink-0">baris</span>
          </div>

          {/* Indikator Halaman */}
          <div className="text-xs font-medium">
            Hal <span className="font-bold text-foreground">{currentPage}</span> dari{" "}
            <span className="font-bold text-foreground">{pageCount}</span>
          </div>

          {/* Tombol Navigasi Halaman */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              title="Halaman Pertama"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              title="Halaman Berikutnya"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
              title="Halaman Terakhir"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}