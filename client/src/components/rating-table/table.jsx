import { useState } from 'react'
import { tableFeatures, useTable } from '@tanstack/react-table'

// 1. Give your data a stable reference (module scope, useState, useQuery, etc.)
const defaultData = [
  { firstName: 'tanner', lastName: 'linsley', age: 24 },
  { firstName: 'tandy', lastName: 'miller', age: 40 },
  { firstName: 'joe', lastName: 'dirte', age: 45 },
]

// 2. New in v9: declare which features this table uses (none yet)
const features = tableFeatures({})

// An editable cell: keeps its own draft value while typing, and only
// commits to table state on blur so every keystroke doesn't re-render the table.
function EditableCell({ getValue, row, column, table }) {
  const initialValue = getValue()
  const [value, setValue] = useState(initialValue)

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value)
  }

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
    />
  )
}

// 3. Define your columns
const columns = [
  {
    accessorKey: 'firstName', // accessorKey shorthand
    header: 'First Name',
    cell: EditableCell,
  },
  {
    accessorFn: (row) => row.lastName, // accessorFn alternative with a custom id
    id: 'lastName',
    header: () => <span>Last Name</span>,
    cell: EditableCell,
  },
  {
    accessorKey: 'age',
    header: () => 'Age',
    cell: EditableCell,
  },
]

export function PersonTable() {
  const [data, setData] = useState(defaultData)

  // 4. Create the table instance
  const table = useTable({
    key: 'person-table', // needed for devtools, omit if you don't want to use the devtools
    features,
    columns,
    data,
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setData((old) =>
          old.map((row, index) =>
            index === rowIndex ? { ...row, [columnId]: value } : row,
          ),
        )
      },
    },
  })

  // 5. Render markup from the table instance APIs
  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder ? null : (
                  <table.FlexRender header={header} />
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getAllCells().map((cell) => (
              <td key={cell.id}>
                <table.FlexRender cell={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
