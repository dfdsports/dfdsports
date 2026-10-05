import { NextResponse } from 'next/server';
import { createEnquiry } from '@/services/enquiries';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: 'Name and Phone number are required' },
        { status: 400 }
      );
    }

    const result = await createEnquiry({
      enquiry_type: body.enquiry_type || 'general',
      name: body.name,
      phone: body.phone,
      email: body.email || null,
      product_name: body.product_name || null,
      product_id: body.product_id || null,
      quantity: body.quantity || null,
      size_or_requirement: body.size_or_requirement || null,
      customization_details: body.customization_details || null,
      message: body.message || null,
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
