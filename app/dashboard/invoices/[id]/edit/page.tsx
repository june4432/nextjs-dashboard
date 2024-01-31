import { fetchCustomers, fetchInvoiceById } from '@/app/lib/data';
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import Form from '@/app/ui/invoices/edit-form';
import { notFound } from 'next/navigation';

/*
    디렉토리 경로에 [id] 이런식으로 대괄호로 감싼 폴더가 있게 되면 동적으로 url을 구성할 수 있게 된다.
*/

export default async function Page({ params }: { params: { id: string } }) {
    const id = params.id;

    const [invoice, customers] = await Promise.all([
        fetchInvoiceById(id),
        fetchCustomers(),
    ]);

    if (!invoice) {
        notFound();
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Invoices', href: '/dashboard/invoices'},
                    {
                        label: 'Edit Invice',
                        href: `/dashboard/invoices/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            <Form invoice={invoice} customers={customers} />
        </main>
    );
}