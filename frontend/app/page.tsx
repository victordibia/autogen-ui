'use client';
import { Card, Title, Text } from '@tremor/react';
import { IChatMessage } from '../components/types';

import ChatBoxView from '../components/chat/chatview';
import { RobotOutlined } from '@ant-design/icons';
import ChatSideBar from '../components/chat/chatsidebar';
import React from 'react';
// import { queryBuilder } from '../lib/planetscale';
// import Search from './search';
// import UsersTable from './table';

export const dynamic = 'force-static';

export default async function IndexPage() {
  const initMessages: IChatMessage[] = [];
  const initMetadata = {
    messages: null
  };
  const [metadata, setMetadata] = React.useState(initMetadata);

  return (
    <main className=" h-full">
      <Title className="mb-4">AutoGen Agent Chat </Title>

      <ChatBoxView
        // setMetadata={null}
        context={null}
        config={null}
        initMessages={initMessages}
        metadata={{ get: metadata, set: setMetadata }}
      />
    </main>
  );
}
