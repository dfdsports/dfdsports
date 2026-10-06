import React from 'react';
import { getOrders } from '@/services/orders';
import { OrdersAdminClient } from '@/components/admin/OrdersAdminClient';

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  return <OrdersAdminClient orders={orders} />;
}
