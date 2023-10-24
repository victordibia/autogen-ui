'use client';
import MarkdownView from '../markdown';

export default function ChatSideBar({ metadata }: { metadata: any }) {
  // console.log('metadata', metadata);
  const metadataView = (metadata?.metadata || []).map(
    (message: any, i: number) => {
      return (
        <div key={'messagerow' + i}>
          <div className="text-xs border p-2 mb-2">
            <MarkdownView data={message.content} />
          </div>
        </div>
      );
    }
  );
  return (
    <div
      style={{ width: '300px', height: 'calc(100% - 25px)' }}
      className="p-2 rounded border overflow-x-hidden overflow-y-auto h-full scroll"
    >
      {' '}
      <div className="mb-2"> Agent Messages</div>
      <div className="mb-2 text-xs">
        The agent workflow generated {metadataView.length} message
        {metadataView.length > 1 ? 's' : ''}{' '}
      </div>
      <div>{metadataView}</div>
    </div>
  );
}
