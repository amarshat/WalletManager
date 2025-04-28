import React from 'react';
import { EmbeddedWallet } from '@/components/embedded/EmbeddedWallet';

export default function EmbeddedWalletPage() {
  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Embedded Wallet Demo</h1>
      <p className="text-muted-foreground">
        This page demonstrates how PaySage Wallet can be embedded into different types of applications. 
        Try out the demos below to see how the wallet integrates seamlessly into various business contexts.
      </p>
      
      <EmbeddedWallet />
    </div>
  );
}