'use client';
import { Card, Title, Text } from '@tremor/react';
import FlowView from './flow';

export const dynamic = 'force-static';
export default function PlaygroundPage() {
  return (
    <div className="text-md  ">
      <Title className="mb-2">Playground</Title>
      <div>
        <FlowView />
      </div>
    </div>
  );
}
