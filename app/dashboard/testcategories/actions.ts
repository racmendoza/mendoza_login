"use server";

import { query } from "@/lib/db";

export interface TestCtg {
    id: string,
    name: string,
    description: string
}

export async function getTestCtgs(): Promise<TestCtg[]> {
    const { rows } = await query<TestCtg>(
        'SELECT id, name, description FROM public.testcategories ORDER BY "id" ASC'
    );
    return rows;
}

export async function addTestCtg(testctg: TestCtg): Promise<void> {
    await query(`INSERT INTO public.testcategories (name, description) VALUES ($1,$2)`, [testctg.name, testctg.description]);
}

export async function updateTestCtg(testctg: TestCtg): Promise<void> {
    await query(`UPDATE public.testcategories SET name=$2, description=$3 WHERE id=$1`, [testctg.id, testctg.name, testctg.description]);
}

export async function removeTestCtgs(testctgs: TestCtg[]): Promise<void> {
    const idList = testctgs.map(testctg => testctg.id);
    await query(`DELETE FROM public.testcategories WHERE id = ANY($1)`, [idList]);
}