


import { LucidePencil, LucideSave, Type } from "lucide-react";
import { JSX, useEffect, useRef, useState } from "react";
import { inputSelectStyle, inputTextStyle } from "./BasicComponents";

// Template Component
type EditorProps<Type> = {value?: Type, finish: (arg0?: Type) => void, cancel: () => void};
type Editor<Type> = ({value, finish, cancel}: EditorProps<Type>) => JSX.Element;

export default function EditableField<Type>({value, Editor, onChange, preview}: {value?: Type, Editor: Editor<Type>, onChange?: (arg0?: Type) => void, preview?: (arg0: Type) => string}) {
    const [isEditing, setEditing] = useState(false);
    // const [value, setValue] = useState(value);
    const mouseOn = useRef(true);
    const divRef = useRef<HTMLDivElement>(null);
    console.log(value);

    const Viewing = () => {
        const [isHovered, setHovered] = useState(false);
        
        let output: JSX.Element;
        if (preview && value) {
            output = <span> {preview(value)} </span>
        } else {
            if (value) {
                output = <span> {String(value)} </span>
            } else {
                output = <span className="text-gray-400"> (empty) </span>
            }
        }

        return (
            <div className="flex items-center relative gap-2">
                <span onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="cursor-pointer" onClick={() => setEditing(true)}> 
                    {output}
                </span>
                <LucidePencil className={isHovered ? "" : "opacity-0"} size={12} stroke="gray"/>
            </div>
        );
    }

    const finish = (value?: Type) => {
        // setValue(value);
        if (onChange) onChange(value);
        setEditing(false);
    }

    const cancel = () => (setEditing(false));

    const onMouseDown = () => {
        if (!mouseOn.current) cancel()
    }

    useEffect(() => {
        mouseOn.current = true;

        document.addEventListener("mousedown", onMouseDown)
        return () => {
            document.removeEventListener("mousedown", onMouseDown)
        }
    }, [isEditing])

    return (
        <div className="w-full">
            {isEditing ? (
                <div onMouseEnter={() => mouseOn.current = true} onMouseLeave={() => mouseOn.current = false} ref={divRef}>
                    <Editor value={value} finish={finish} cancel={cancel}/> 
                </div>
            ):( 
                <Viewing/>
            )}
        </div>  
    )
}

export function TextEditor({value, finish, cancel}: EditorProps<string>) {
    const [input, setInput] = useState(value);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div className="flex items-center relative gap-3">
            <input ref={inputRef} className={`field-sizing-content ${inputTextStyle}`} type="text" defaultValue={input} onChange={(e) => setInput(e.target.value)}/>
            <LucideSave size={18} className={`cursor-pointer`} onClick={() => finish(inputRef.current?.value ?? "")}></LucideSave>
        </div>
    )
}

export function NumberEditor({value, finish, cancel}: EditorProps<number>) {
    const [input, setInput] = useState(value);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div className="flex items-center relative gap-3">
            <input ref={inputRef} className={`field-sizing-content ${inputTextStyle}`} type="number" defaultValue={input} onChange={(e) => setInput(e.target.valueAsNumber)}/>
            <LucideSave size={18} className={`cursor-pointer`} onClick={() => finish(inputRef.current?.valueAsNumber)}></LucideSave>
        </div>
    )
}

// Create a builder that creates functions for Editor
export function createOptionEditor<Type>(options: Type[], asValue: (arg0: Type) => string, asName: (arg0: Type) => string): Editor<Type> {

    return ({value, finish, cancel}: EditorProps<Type>) => {
        const selectRef = useRef<HTMLSelectElement>(null);

        useEffect(() => {
            selectRef.current?.focus();
        }, []);

        const onClick = () => {
            finish(options.find(i => asValue(i) === selectRef.current?.value)); 
        }

        return ( 
        <div className="flex items-center relative gap-3">
            <select ref={selectRef} defaultValue={value ? asValue(value) : ""} className={`${inputSelectStyle}`}>
                {options.map(option => <option key={asValue(option)} value={asValue(option)}> {asName(option)} </option>)}
            </select>
            <LucideSave size={18} className={`cursor-pointer`} onClick={onClick}></LucideSave>
        </div>
        )
    }
}