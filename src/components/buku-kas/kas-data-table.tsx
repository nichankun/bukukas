// src/components/buku-kas/kas-data-table.tsx
"use client";

import * as React from "react";
import {
  useTable,
  tableFeatures,
  columnFilteringFeature,
  columnVisibilityFeature,
  rowSortingFeature,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  sortFn_alphanumeric,
  sortFn_text,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreVertical, Pencil, Trash2, Search } from "lucide-react";
import { formatRupiah } from "@/lib/kas-utils";

export interface TransactionRow {
  id: number;
  day: number;
  description: string;
  type: "debet" | "kredit";
  amount: number;
  runningSaldo: number;
}

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
});

type DataTableFeatures = typeof features;

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
    state: {
      sorting,
      columnFilters,
    },
  });

  const netBulan = totalDebet - totalKredit;

  return (
    <div className="space-y-3">
      {/* Search Input Filter */}
      <div className="flex items-center justify-between gap-2 print:hidden">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari keterangan transaksi..."
            value={
              (table.getColumn("description")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("description")?.setFilterValue(event.target.value)
            }
            className="pl-8 bg-background h-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Tabel Tunggal Responsif (Desktop & Mobile) */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-145 w-full">
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
                    className="h-24 text-center text-xs sm:text-sm text-muted-foreground"
                  >
                    Tidak ada transaksi yang ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            {/* Footer Total */}
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
    </div>
  );
}