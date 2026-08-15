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
import { ArrowUpDown, MoreVertical, Pencil, Trash2, Search, ArrowDownLeft, ArrowUpRight } from "lucide-react";
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
            className="w-full justify-center font-semibold -ml-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tanggal
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center font-medium">{row.getValue("day")}</div>
        ),
      },
      {
        accessorKey: "description",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="justify-start font-semibold -ml-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Keterangan
            <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("description")}</div>,
      },
      {
        accessorKey: "debet",
        header: () => <div className="text-right font-semibold">Debet</div>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-right font-medium text-emerald-600 dark:text-emerald-400">
              {item.type === "debet" ? formatRupiah(item.amount) : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "kredit",
        header: () => <div className="text-right font-semibold">Kredit</div>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-right font-medium text-rose-600 dark:text-rose-400">
              {item.type === "kredit" ? formatRupiah(item.amount) : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "runningSaldo",
        header: () => <div className="text-right font-semibold">Saldo</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {formatRupiah(row.getValue("runningSaldo"))}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-center font-semibold print:hidden">Aksi</div>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-center print:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
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
  const filteredRows = table.getRowModel().rows;

  return (
    <div className="space-y-3">
      {/* Search Input Filter */}
      <div className="flex items-center justify-between gap-2 print:hidden">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari keterangan transaksi..."
            value={
              (table.getColumn("description")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("description")?.setFilterValue(event.target.value)
            }
            className="pl-8 bg-background h-9 text-sm"
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. TAMPILAN KHUSUS MOBILE (< md): List Card Ala Aplikasi Kas */}
      {/* ============================================================ */}
      <div className="block md:hidden space-y-2">
        {filteredRows.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground bg-muted/20 rounded-lg border">
            Tidak ada transaksi yang ditemukan.
          </div>
        ) : (
          filteredRows.map((row) => {
            const item = row.original;
            const isDebet = item.type === "debet";

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-card border rounded-lg shadow-2xs gap-3"
              >
                {/* Tanggal & Icon */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-xs ${
                      isDebet
                        ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                        : "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400"
                    }`}
                  >
                    Tgl {item.day}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate text-foreground">
                      {item.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Saldo: {formatRupiah(item.runningSaldo)}
                    </p>
                  </div>
                </div>

                {/* Nominal & Menu Aksi */}
                <div className="flex items-center gap-1 shrink-0">
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        isDebet
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isDebet ? "+" : "-"}
                      {formatRupiah(item.amount)}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-1">
                        <MoreVertical className="h-4 w-4" />
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
              </div>
            );
          })
        )}

        {/* Ringkasan Total Footer di HP */}
        <div className="p-3 bg-muted/40 rounded-lg border mt-3 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Pemasukan (Debet):</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatRupiah(totalDebet)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Pengeluaran (Kredit):</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {formatRupiah(totalKredit)}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t font-semibold text-sm">
            <span>Net Bulan Ini:</span>
            <span
              className={
                netBulan < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }
            >
              {formatRupiah(netBulan)}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TAMPILAN DESKTOP/TABLET (≥ md): Full Data Table Standar   */}
      {/* ============================================================ */}
      <div className="hidden md:block rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10">
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {filteredRows.length ? (
              filteredRows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada transaksi yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter className="bg-muted/50 font-bold">
            <TableRow>
              <TableCell colSpan={2} className="text-center font-bold">
                Total Bulan Ini
              </TableCell>
              <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-bold">
                {formatRupiah(totalDebet)}
              </TableCell>
              <TableCell className="text-right text-rose-600 dark:text-rose-400 font-bold">
                {formatRupiah(totalKredit)}
              </TableCell>
              <TableCell
                className={`text-right font-bold ${
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
  );
}