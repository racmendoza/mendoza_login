import { any } from 'better-auth';
import ExcelJS from 'exceljs';
import ConfirmModal from '.components/ConfirmModal';

type DownloadExcelFunction =  <Type>(
    objects: Type[],
    columns: {header: string, key: string, width: number, output: (arg0: Type, arg1: number) => any}[],
    name: string
) => Promise<void>

type DownloadExcelButtonProps<Type> = {
    objects: Type[],
    columns: {header: string, key: string, width: number, output: (arg0: Type, arg1: number) => any}[],
    name: string
}

export default function DownloadExcelButton<Type,>({objects, columns, name}: DownloadExcelButtonProps<Type>) {

    const handleDownloadExcel = async () => {
        const confirmed = await ConfirmModal(`Download ${name} to Excel?`, {
            okText: "Yes, Download",
            cancelText: "Cancel",
            okColor: "bg-green-600 hover:bg-green-700",
        });
        if (!confirmed) return;

        downloadArrayExcel(objects, columns, name);
    };

    return (
        <button
            onClick={handleDownloadExcel}
            className="rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
        >
            Download Excel
        </button>
    )
}

export const downloadArrayExcel: DownloadExcelFunction = async (objects, columns, name) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(name);

    worksheet.columns = columns;

    objects.forEach((object, index) => {
        const row: {[key: string]: string} = {};

        columns.forEach((column) => {
            row[column.key] = column.output(object, index);
        });

        worksheet.addRow(row);
    });

    // Apply width maximums
    columns.forEach((column, index) => {
        const longest = objects.length ? Math.max(...objects.map(object => String(column.output(object, index)).length)) : 0
        const wc = worksheet.getColumn(String(column.key));
        wc.width = Math.max(wc.width!, longest + 8);
    })

    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name + ".xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};