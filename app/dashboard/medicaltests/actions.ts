"use server";

import { query } from "@/lib/db";

export interface MedTest {
    id: number,
    name: string,
    description?: string,
    iduom: number,
    idcategory: number,
    normalmin: number,
    normalmax: number,
    uomname: string,
    categoryname: string
}

export async function getMedTests(): Promise<MedTest[]> {
    const { rows } = await query<MedTest>("SELECT tests.*, uom.name uomName, ctg.name categoryName FROM public.medicaltests tests JOIN public.uom uom ON tests.iduom = uom.id JOIN public.testcategories ctg ON tests.idcategory = ctg.id ORDER BY tests.id ASC;");
    return rows;
}

export async function addMedTest(test: MedTest): Promise<void> {
    await query (`INSERT INTO public.medicaltests (name, description, iduom, idcategory, normalmin, normalmax) VALUES ($1,$2,$3,$4,$5,$6)`,
        [test.name, test.description, test.iduom, test.idcategory, test.normalmin, test.normalmax]
    )
}

export async function updateMedTest(test: MedTest): Promise<void> {
    await query(`UPDATE public.medicaltests SET name=$2, description=$3, iduom=$4, idcategory=$5, normalmin=$6, normalmax=$7 WHERE id=$1`, 
        [test.id, test.name, test.description, test.iduom, test.idcategory, test.normalmin, test.normalmax]);
}

export async function removeMedTest(tests: MedTest[]): Promise<void> {
    const idList = tests.map(test => test.id);
    await query(`DELETE FROM public.medicaltests WHERE id = ANY($1)`, [idList]);
}