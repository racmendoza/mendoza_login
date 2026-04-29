import { ReactNode } from "react";

export const shadowFrozen = "shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]";

export function Table({children}: {children: ReactNode}) {
    return (
        <div className="max-h-[calc(100vh-260px)] overflow-auto rounded border bg-white shadow relative">
          <table className="min-w-full divide-y divide-gray-200">
            {children}
          </table>
        </div>
    )
}

export function TableHeader({children}: {children: ReactNode}) {
    return (
        <thead className="bg-gray-200 sticky top-0 z-20">
            {children}
        </thead>
    )
}

export function TableHeaderCell({className, children}: {className?: string, children: ReactNode}) {
    return (
        <th className={`${className} px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600`}>
            {children}
        </th>
    )
}

export function TableBody({children}: {children: ReactNode}) {
    return (
        <tbody className="bg-white divide-y divide-gray-200">
            {children}
        </tbody>
    )
}

export function TableRowOddEven({className, children}: {className?: string, children: ReactNode}) {
    return (
        <tr className={`even:bg-gray-50/80 hover:bg-blue-50/50 transition-colors ${className}`}>
            {children}
        </tr>
    )
}

export function TableCell({className, children}: {className?: string, children: ReactNode}) {
    return (
        <td className={`px-4 py-2 text-sm ${className}`}>
            {children}
        </td>
    )
}