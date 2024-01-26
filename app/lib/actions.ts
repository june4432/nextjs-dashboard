'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod'; //데이터의 타입과 포맷을 밸리데이션하는 자바스크립트 라이브러리.

const FormSchema = z.object({ //폼데이터의 원형을 만든다.
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({id: true, date: true});
const UpdateInvoice = FormSchema.omit({id: true, date: true});

export async function createInvoice(formData: FormData) {

    // const rawFormData = {
    //     customerId: formData.get('customerId'),
    //     amount: formData.get('amount'),
    //     status: formData.get('amount'),
    // };

    /*
        formdata 내 값이 많을 경우 아래처럼 사용하면 좋음.
    */
    //const rawFormData = Object.fromEntries(formData.entries());
    
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    await sql`
        INSERT INTO INVOICES (CUSTOMER_ID, AMOUNT, STATUS, DATE)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    revalidatePath('/dashboard/invoices'); //주소창의 경로를 먼저 바꿔준다.
    redirect('/dashboard/invoices'); //주소창의 경로로 redirect시킨다.
}

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    await sql`
        UPDATE INVOICES
           SET CUSTOMER_ID = ${customerId}
             , AMOUNT = ${amountInCents}
             , STATUS = ${status}
         WHERE ID = ${id}
    `;

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    await sql`DELETE FROM INVOICES WHERE ID = ${id}`;
    revalidatePath('/dasyboard/invoices');
}