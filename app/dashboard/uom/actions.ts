"use server";

import { query } from "@/lib/db";

export interface UOM {
    id: string,
    name: string,
    description: string
}

export async function getUOMs(): Promise<UOM[]> {
    const { rows } = await query<UOM>(
        'SELECT id, name, description FROM public.uom ORDER BY "id" ASC'
    );
    return rows;
}

export async function addUOM(uom: UOM): Promise<void> {
    await query(`INSERT INTO public.uom (name, description) VALUES ($1,$2)`, [uom.name, uom.description]);
}

export async function updateUOM(uom: UOM): Promise<void> {
    await query(`UPDATE public.uom SET name=$2, description=$3 WHERE id=$1`, [uom.id, uom.name, uom.description]);
}

export async function removeUOMs(uoms: UOM[]): Promise<void> {
    const idList = uoms.map(uom => uom.id);
    await query(`DELETE FROM public.uom WHERE id = ANY($1)`, [idList]);
}