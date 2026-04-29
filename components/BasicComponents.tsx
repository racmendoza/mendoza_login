import { Children, ReactNode } from "react";

export const inputTextStyle = "w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none";
export const inputSelectStyle = inputTextStyle;

export function CustomButton({children, className, onClick, disabled=false}: {children: ReactNode, className?: string, onClick?: () => void, disabled?: boolean}) {
    const disabledStyle = "disabled:hover:bg-blue-200 disabled:bg-blue-200";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap ${disabledStyle} ${className}`}
        >
            {children}
        </button>
    )
}

export function HeaderControls({children}: {children: ReactNode}) {
    return (
        <div className="flex items-center justify-between gap-x-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            {children}
        </div>
    )
}

export function Header1({children}: {children: ReactNode}) {
    return (
        <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
            {children}
        </h1>
    )
}

export function VerticalSeparator() {
    return (
        <div className="min-w-0 min-h-max border-l border-l-gray-300"></div>
    )
}