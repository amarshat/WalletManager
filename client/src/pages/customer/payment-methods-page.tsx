import React from 'react';
import CustomerLayout from '@/components/layouts/CustomerLayout';
import PaymentMethods from '@/components/wallet/PaymentMethods';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentMethodsPage() {
  return (
    <CustomerLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentMethods />
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}