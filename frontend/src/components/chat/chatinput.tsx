"use client";

import {
  PaperAirplaneIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import * as React from "react";
import { ChatInputProps } from "../types";

export default function ChatInput({
  onSubmit,
  loading,
  error,
}: ChatInputProps) {
  const queryInputRef = React.useRef<HTMLInputElement>(null);
  const [previousLoading, setPreviousLoading] = React.useState(loading);

  // Clear input when loading changes from true to false (meaning the response is complete)
  React.useEffect(() => {
    if (previousLoading && !loading && !error) {
      resetInput();
    }
    setPreviousLoading(loading);
  }, [loading, error, previousLoading]);

  const resetInput = () => {
    if (queryInputRef.current) {
      queryInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (queryInputRef.current?.value && !loading) {
      const query = queryInputRef.current.value;
      onSubmit(query);
      // Don't reset immediately - wait for response to complete
    }
  };

  return (
    <div className="mt-2 p-2 w-full">
      <div
        className={`mt-2 rounded p-2 shadow-lg flex mb-1 ${
          loading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <form
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <input
            id="queryInput"
            name="queryInput"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            ref={queryInputRef}
            className="w-full text-gray-600 rounded rounded-r-none border border-accent bg-white p-2"
            placeholder="Type your message here..."
            disabled={loading}
          />
        </form>
        <div
          role="button"
          onClick={handleSubmit}
          className="bg-accent hover:brightness-75 transition duration-300 rounded pt-2 rounded-l-none px-5"
        >
          {!loading ? (
            <div className="inline-block">
              <PaperAirplaneIcon className="h-6 text-white inline-block" />
            </div>
          ) : (
            <div className="inline-block">
              <Cog6ToothIcon className="relative -pb-2 text-white animate-spin inline-flex rounded-full h-6 w-6" />
            </div>
          )}
        </div>
      </div>

      {error && !error.status && (
        <div className="p-2 border rounded mt-4 text-orange-500 text-sm">
          <ExclamationTriangleIcon className="h-5 text-orange-500 inline-block mr-2" />
          {error.message}
        </div>
      )}
    </div>
  );
}
