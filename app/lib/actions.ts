'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod'; //데이터의 타입과 포맷을 밸리데이션하는 자바스크립트 라이브러리.

const FormSchema = z.object({ //폼데이터의 원형을 만든다.
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status',
    }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({id: true, date: true});
const UpdateInvoice = FormSchema.omit({id: true, date: true});

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
}
export async function createInvoice(prevState: State, formData: FormData) {

    // const rawFormData = {
    //     customerId: formData.get('customerId'),
    //     amount: formData.get('amount'),
    //     status: formData.get('amount'),
    // };

    /*
        formdata 내 값이 많을 경우 아래처럼 사용하면 좋음.
    */
    //const rawFormData = Object.fromEntries(formData.entries());
    
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if(!validatedFields.success) {
        return {
            errors: validatedFields.error().flatten().fieldErrors,
            
        }
    }

    const amountInCents = Number(formData.get('amount')) * 100;
    const date = new Date().toISOString().split('T')[0];

    try{
        await sql`
        INSERT INTO INVOICES (CUSTOMER_ID, AMOUNT, STATUS, DATE)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    }catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
        }
    }
    

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

    try{
        await sql`
            UPDATE INVOICES
               SET CUSTOMER_ID = ${customerId}
                 , AMOUNT = ${amountInCents}
                 , STATUS = ${status}
             WHERE ID = ${id}
        `;
    }catch (error) {
        return {
            message: 'Database Error: Failed to Update Invoice',
        }
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    //throw new Error('Failed To Delete Invoice Because I made it now.');
    try{
        await sql`DELETE FROM INVOICES WHERE ID = ${id}`;
        revalidatePath('/dasyboard/invoices');
        return { message: 'Delete Invoice.' }
    }catch (error) {
        return {
            message: 'Database Error: Failed to Delete Invoice'
        }
    }
}