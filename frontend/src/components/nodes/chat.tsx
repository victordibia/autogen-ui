import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { INodeData } from '../types';
import { Input } from 'antd';

const handleStyle = { left: 10 };

export default function ChatNode({
  data,
  isConnectable
}: {
  data: INodeData;
  isConnectable: boolean;
}) {
  const onChange = useCallback((evt: any) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div
      style={{ minHeight: '300px' }}
      className="font-light border-green    text-md border  rounded bg-white"
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />

      <div className="p-2 capitalize   border-b">
        <span className="capitalize"> {data.label || 'Agent'}</span>
      </div>
      <div className="p-2 ">
        <div className="flex">
          <label className="mr-2" htmlFor="name">
            Name
          </label>
          <Input className="inline-block nodrag" placeholder="Basic usage" />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        isConnectable={isConnectable}
      />
    </div>
  );
}
