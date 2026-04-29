"use client";

import {shadowFrozen, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRowOddEven } from "@/components/TableComponents";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { addTestCtg, getTestCtgs, removeTestCtgs, TestCtg, updateTestCtg } from "./actions";
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

    const [testCtgs, setTestCtgs] = useState<TestCtg[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [isSaving, setSaving] = useState(false);
    const selects = useRef<TestCtg[]>([]);
    const [selectSize, setSelectSize] = useState(0);
    
    const fetchTestCtgs = useCallback(() => {
        getTestCtgs()
            .then((testCtgs) => {
                setTestCtgs(testCtgs);
                selects.current = [];
                setSelectSize(0);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [])

    useEffect(() => {
        if (session) fetchTestCtgs();
    }, [fetchTestCtgs, session])

    useEffect(() => {
        selects.current = [];
        setSelectSize(0);
    }, [testCtgs])

    // Pass this callback to all components that will edit a test category
    // Updates the testCtg state, and update in database
    const testCtgChanged = (testCtg: TestCtg) => {
        let newTestCtg = [...testCtgs];
        const changedIndex = newTestCtg.findIndex(i => i.id === testCtg.id);
        newTestCtg[changedIndex] = {...testCtg};
        setTestCtgs(newTestCtg);

        setSaving(true);
        updateTestCtg(testCtg).then(() => setSaving(false));
    }

    const testCtgDeleted = (deletes: TestCtg[]) => {
        setTestCtgs(testCtgs.filter(i => !deletes.includes(i)));

        setSaving(true);
        removeTestCtgs(deletes).then(() => setSaving(false));
    }

    // Delete panel shown at the right side of the header
    const DeletePanel = () => {
        const onClick = () => {
            const message = `This will delete ${selectSize} ${selectSize >= 2 ? "rows" : "row"}. Do you wish to continue?`

            ConfirmModal(message).then((yes) => {
                if (yes) testCtgDeleted(selects.current);
            })
        }
        
        return (
            <div className="flex items-center gap-3">
                <span>{selectSize} of {testCtgs.length} selected</span>
                <CustomButton onClick={onClick} disabled={selectSize < 1}> Delete </CustomButton>
            </div>
        )
    }

    const makeRow = (testCtg: TestCtg) => {
        const leftCells = `sticky z-10 bg-white font-medium text-gray-900 ${shadowFrozen} group-hover:bg-blue-50/50`;

        // Take out or add in selects when checked or unchecked.
        const onCheckBoxChange = (e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.checked) {
                selects.current.push(testCtg);
            } else {
                selects.current = selects.current.filter(i => i.id !== testCtg.id);
            }
            setSelectSize(selects.current.length);
        }

        return (
            <TableRowOddEven key={testCtg.id}>
                <TableCell>
                    <input type="checkbox" onChange={onCheckBoxChange}></input>
                </TableCell>
                <TableCell className={`left-0 w-48 ${leftCells}`}> 
                    <EditableField value={testCtg.name} Editor={TextEditor} onChange={s => testCtgChanged({...testCtg, name: s ?? ""})}/> 
                </TableCell>
                <TableCell> 
                    <EditableField value={testCtg.description} Editor={TextEditor} onChange={s => testCtgChanged({...testCtg, description: s ?? ""})}/> 
                </TableCell>
            </TableRowOddEven>
        )
    }

    const AddRow = () => {
        const newUnitRef = useRef<HTMLInputElement>(null);
        const newDescRef = useRef<HTMLInputElement>(null);

        // Updates the category state by adding in the new category, 
        const onAddBtnClick = () => {
            const newTestCtg: TestCtg = {
                id: testCtgs.reduce((a, b) => a.id > b.id ? a : b).id + 1,
                name: newUnitRef.current?.value ?? "", // TODO: Add check for empty unit
                description: newDescRef.current?.value ?? ""
            }

            setTestCtgs([...testCtgs, newTestCtg]);

            setSaving(true)
            addTestCtg(newTestCtg).then(() => {
                setSaving(false);
                fetchTestCtgs();
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
            <Header1> Test Categories </Header1>
            <div className="flex items-stretch gap-4">
                <DownloadExcelButton
                    objects={testCtgs}
                    columns={[
                        {header: "Row Number", key: "rowNumber", width: 12, output: (_,index) => index + 1},
                        {header: "Category", key: "categoryName", width: 15, output: (testCtg) => testCtg.name},
                        {header: "Description", key: "categoryDesc", width: 20, output: (testCtg) => testCtg.description}
                    ]}
                    name={"Test Categories"}
                />
                <DownloadPdfButton
                    objects={testCtgs}
                    objectKey={ctg => ctg.id} 
                    columns={[
                        {label: "Row no.", flexWidth: "36px 0 0", output: (_,index) => String(index + 1)},
                        {label: "Category", flexWidth: "100px 0 0", output: ctg => ctg.name},
                        {label: "Description", flexWidth: "240px 1 0", output: ctg => ctg.description}
                    ]}
                    name={"Test Categories"}
                />
                <VerticalSeparator/>
                <DeletePanel/>
            </div>
        </HeaderControls>

        <Table>
            <TableHeader>
                <tr>
                    <TableHeaderCell className={`sticky left-0 w-16 z-10 ${shadowFrozen}`}> Actions </TableHeaderCell>
                    <TableHeaderCell className={`sticky left-16 w-48 z-10 ${shadowFrozen}`}> Category </TableHeaderCell>
                    <TableHeaderCell> Description </TableHeaderCell>
                </tr>
            </TableHeader>
            <TableBody>
                {testCtgs.map(testCtg => makeRow(testCtg))}
                <AddRow/>
            </TableBody>
        </Table>
        <div>
            {isLoading ? "Loading..." : testCtgs.length + " results"}
        </div>
        <div>
            {isSaving ? "Saving..." : ""}
        </div>
    </div>
    )
}
