import { Card, Title, Text } from '@tremor/react';
import { IChatMessage } from '../components/types';

import ChatBoxView from '../components/nodes/chatview';
// import { queryBuilder } from '../lib/planetscale';
// import Search from './search';
// import UsersTable from './table';

export const dynamic = 'force-dynamic';

export default async function IndexPage() {
  const initMessages: IChatMessage[] = [];

  return (
    <main className=" h-full">
      <Title className="mb-4">AutoGen Agent Chat </Title>

      <ChatBoxView
        // setMetadata={null}
        context={null}
        config={null}
        initMessages={initMessages}
      />
    </main>
  );
}
