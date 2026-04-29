"use client";

import {shadowFrozen, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRowOddEven } from "@/components/TableComponents";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { addUOM, getUOMs, removeUOMs, UOM, updateUOM } from "./actions";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import EditableField, { TextEditor } from "@/components/EditableField";
import { CustomButton, Header1, HeaderControls, inputTextStyle, VerticalSeparator } from "@/components/BasicComponents";
import ConfirmModal from "@/components/ConfirmModal";
import { DownloadPdfButton } from "@/components/pdf/DownloadPdfButton";
import DownloadExcelButton from "@/components/excel/DownloadExcel";

export default function Page() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    useEffect(() => {
        if (!isPending && !session) {
            router.push("/");
        }
    }, [session, isPending, router]);

    const [uoms, setUoms] = useState<UOM[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isSaving, setSaving] = useState(false);
    const selects = useRef<UOM[]>([]);
    const [selectSize, setSelectSize] = useState(0);
    
    const fetchUoms = useCallback(() => {
        getUOMs()
            .then((uoms) => {
                setUoms(uoms);
                selects.current = [];
                setSelectSize(0);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [])

    useEffect(() => {
        if (session) fetchUoms();
    }, [fetchUoms, session])

    useEffect(() => {
        selects.current = [];
        setSelectSize(0);
    }, [uoms])

    // Pass this callback to all components that will edit a UOM
    // Updates the uom state, and update in database
    const uomChanged = (uom: UOM) => {
        let newUoms = [...uoms];
        const changedUomIndex = newUoms.findIndex(i => i.id === uom.id);
        newUoms[changedUomIndex] = {...uom};
        setUoms(newUoms);

        setSaving(true);
        updateUOM(uom).then(() => setSaving(false));
    }

    const uomDeleted = (deletes: UOM[]) => {
        setUoms(uoms.filter(i => !deletes.includes(i)));

        setSaving(true);
        removeUOMs(deletes).then(() => setSaving(false));
    }

    // Delete panel shown at the right side of the header
    const DeletePanel = () => {
        const onClick = () => {
            const message = `This will delete ${selectSize} ${selectSize >= 2 ? "rows" : "row"}. Do you wish to continue?`

            ConfirmModal(message).then((yes) => {
                if (yes) uomDeleted(selects.current);
            })
        }
        
        return (
            <div className="flex items-center gap-3">
                <span>{selectSize} of {uoms.length} selected</span>
                <CustomButton onClick={onClick} disabled={selectSize < 1}> Delete </CustomButton>
            </div>
        )
    }

    const makeRow = (uom: UOM) => {
        const leftCells = `sticky z-10 bg-white font-medium text-gray-900 ${shadowFrozen} group-hover:bg-blue-50/50`;

        // Take out or add in selects when checked or unchecked.
        const onCheckBoxChange = (e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.checked) {
                selects.current.push(uom);
            } else {
                selects.current = selects.current.filter(i => i.id !== uom.id);
            }
            setSelectSize(selects.current.length);
        }

        return (
            <TableRowOddEven key={uom.id}>
                <TableCell>
                    <input type="checkbox" onChange={onCheckBoxChange}></input>
                </TableCell>
                <TableCell className={`left-0 w-48 ${leftCells}`}> 
                    <EditableField value={uom.name} Editor={TextEditor} onChange={s => uomChanged({...uom, name: s ?? ""})}/> 
                </TableCell>
                <TableCell> 
                    <EditableField value={uom.description} Editor={TextEditor} onChange={s => uomChanged({...uom, description: s ?? ""})}/> 
                </TableCell>
            </TableRowOddEven>
        )
    }

    const AddRow = () => {
        const newUnitRef = useRef<HTMLInputElement>(null);
        const newDescRef = useRef<HTMLInputElement>(null);

        // Updates the uom state by adding in the new UOM, 
        const onAddBtnClick = () => {
            const newUOM: UOM = {
                id: uoms.reduce((a, b) => a.id > b.id ? a : b).id + 1,
                name: newUnitRef.current?.value ?? "", // TODO: Add check for empty unit
                description: newDescRef.current?.value ?? ""
            }

            setUoms([...uoms, newUOM]);

            setSaving(true)
            addUOM(newUOM).then(() => {
                setSaving(false);
                fetchUoms();
            });
        }

        return (
            <TableRowOddEven>
                <TableCell>
                    <CustomButton onClick={onAddBtnClick} className="px-0 py-0">+ Add</CustomButton>
                </TableCell>
                <TableCell> 
                    <input ref={newUnitRef} type="text" className={inputTextStyle} placeholder="New unit..."></input>
                </TableCell>
                <TableCell>
                    <input ref={newDescRef} type="text" className={inputTextStyle} placeholder="New description..."></input>
                </TableCell>
            </TableRowOddEven>
        )
    }

    return (
    <div className="space-y-4">
        <HeaderControls>
            <Header1> UOMs </Header1>
            <div className="flex items-stretch gap-4">
                <DownloadExcelButton
                    objects={uoms}
                    columns={[
                        {header: "Row Number", key: "rowNumber", width: 12, output: (_,index) => index + 1},
                        {header: "Unit", key: "uomname", width: 15, output: (uom) => uom.name},
                        {header: "Description", key: "uomDesc", width: 20, output: (uom) => uom.description}
                    ]}
                    name={"UOMs"}
                />
                <DownloadPdfButton
                    objects={uoms}
                    objectKey={uom => uom.id} 
                    columns={[
                        {label: "Row no.", flexWidth: "36px 0 0", output: (_,index) => String(index + 1)},
                        {label: "Unit", flexWidth: "100px 0 0", output: uom => uom.name},
                        {label: "Description", flexWidth: "240px 1 0", output: uom => uom.description}
                    ]}
                    name={"UOMs"}
                />
                <VerticalSeparator/>
                <DeletePanel/>
            </div>
        </HeaderControls>

        <Table>
            <TableHeader>
                <tr>
                    <TableHeaderCell className={`sticky left-0 w-16 z-10 ${shadowFrozen}`}> Actions </TableHeaderCell>
                    <TableHeaderCell className={`sticky left-16 w-48 z-10 ${shadowFrozen}`}> Unit </TableHeaderCell>
                    <TableHeaderCell> Description </TableHeaderCell>
                </tr>
            </TableHeader>
            <TableBody>
                {uoms.map(uom => makeRow(uom))}
                <AddRow/>
            </TableBody>
        </Table>
        <div>
            {isLoading ? "Loading..." : uoms.length + " results"}
        </div>
        <div>
            {isSaving ? "Saving..." : ""}
        </div>
    </div>
    )
}
