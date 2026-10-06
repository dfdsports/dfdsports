import { NextResponse } from 'next/server';
import { createOrder } from '@/services/orders';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.phone || !body.product_name || !body.shipping_address) {
      return NextResponse.json(
        { error: 'name, phone, product_name and shipping_address are required' },
        { status: 400 }
      );
    }

    const result = await createOrder({
      name: body.name,
      phone: body.phone,
      product_name: body.product_name,
      category: body.category ?? null,
      quantity: body.quantity ?? '1',
      shipping_address: body.shipping_address,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
