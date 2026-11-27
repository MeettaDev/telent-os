"use client";

import {
  createPaginatedRowModel,
  metaHelper,
  rowPaginationFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";
import {
  PAGE_SIZE,
  Pagination,
  usePageNavigation,
} from "@/common/components/Pagination";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const features = tableFeatures({
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnMeta: metaHelper<{
    width?: string;
    headerClassName?: string;
    cellClassName?: string;
  }>(),
});

export type DataTableColumn<TData extends RowData> = ColumnDef<
  typeof features,
  TData
>;

export function DataTable<TData extends { id: string }>({
  columns,
  data,
  resetKey,
  label,
  empty,
  className,
  tableClassName,
  headerClassName,
  rowClassName,
}: {
  columns: DataTableColumn<TData>[];
  data: TData[];
  resetKey: string;
  label: string;
  empty: string;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
}) {
  const pagination = usePageNavigation(data.length, resetKey);
  const table = useTable({
    features,
    columns,
    data,
    getRowId: (row) => row.id,
    autoResetPageIndex: false,
    state: {
      pagination: {
        pageIndex: pagination.currentPage - 1,
        pageSize: PAGE_SIZE,
      },
    },
  });
  const rows = table.getRowModel().rows;

  return (
    <>
      <Card
        key={resetKey + ":" + pagination.currentPage}
        role="region"
        aria-label={label}
        tabIndex={0}
        className={cn(
          "relative block min-h-0 flex-1 overflow-auto overscroll-contain border-0 focus-visible:-outline-offset-2 focus-visible:outline-ring [&>[data-slot=table-container]]:overflow-visible",
          className,
        )}
      >
        <Table aria-label={label} role="table" className={tableClassName}>
          {columns.some(({ meta }) => meta?.width) && (
            <colgroup className="hidden xl:table-column-group">
              {table.getAllLeafColumns().map((column) => (
                <col
                  key={column.id}
                  style={{ width: column.columnDef.meta?.width }}
                />
              ))}
            </colgroup>
          )}
          <TableHeader role="rowgroup" className={headerClassName}>
            {table.getHeaderGroups().map((group) => (
              <TableRow
                key={group.id}
                role="row"
                className="block xl:table-row"
              >
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    role="columnheader"
                    colSpan={header.colSpan}
                    className={header.column.columnDef.meta?.headerClassName}
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody role="rowgroup" className="block">
            {rows.map((row) => (
              <TableRow key={row.id} role="row" className={rowClassName}>
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    role="cell"
                    className={cell.column.columnDef.meta?.cellClassName}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 && (
          <p
            role="status"
            className="py-12 text-center text-sm text-muted-foreground"
          >
            {empty}
          </p>
        )}
      </Card>
      <footer className="h-18 shrink-0">
        <Pagination {...pagination} tableLabel={label} alwaysShow />
      </footer>
    </>
  );
}
