import ChatBoxView from "@/components/chat/chatview";
import { IChatMessage } from "@/components/types";
import React from "react";
// import { queryBuilder } from '../lib/planetscale';
// import Search from './search';
// import UsersTable from './table';

export const dynamic = "force-static";

export default async function IndexPage() {
  const sampleMessages: IChatMessage[] = [
    {
      text: "what is the height of the eiffel tower",
      sender: "user",
    },
    {
      text: "The Eiffel Tower is approximately 330 meters (1,083 feet) tall. \n\nTERMINATE",
      sender: "bot",
      metadata: [
        {
          content:
            "The Eiffel Tower is approximately 330 meters (1,083 feet) tall. \n\nTERMINATE",
          role: "user",
        },
      ],
    },
    {
      text: "what is the components of the atmospher",
      sender: "user",
    },
    {
      text: "The atmosphere is primarily composed of nitrogen (78%) and oxygen (21%). The remaining 1% consists of argon, carbon dioxide, and trace amounts of other gases such as neon, helium, methane, krypton, and hydrogen, as well as water vapor.\n\nTERMINATE",
      sender: "bot",
      metadata: [
        {
          content:
            "The atmosphere is primarily composed of nitrogen (78%) and oxygen (21%). The remaining 1% consists of argon, carbon dioxide, and trace amounts of other gases such as neon, helium, methane, krypton, and hydrogen, as well as water vapor.\n\nTERMINATE",
          role: "user",
        },
        {
          content:
            "The atmosphere is primarily composed of nitrogen (78%) and oxygen (21%). The remaining 1% consists of argon, carbon dioxide, and trace amounts of other gases such as neon, helium, methane, krypton, and hydrogen, as well as water vapor.\n\nTERMINATE",
          role: "user",
        },
        {
          content:
            "The atmosphere is primarily composed of nitrogen (78%) and oxygen (21%). The remaining 1% consists of argon, carbon dioxide, and trace amounts of other gases such as neon, helium, methane, krypton, and hydrogen, as well as water vapor.\n\nTERMINATE",
          role: "user",
        },
        {
          content:
            "The atmosphere is primarily composed of nitrogen (78%) and oxygen (21%). The remaining 1% consists of argon, carbon dioxide, and trace amounts of other gases such as neon, helium, methane, krypton, and hydrogen, as well as water vapor.\n\nTERMINATE",
          role: "user",
        },
      ],
    },
  ];

  return (
    <main className=" h-full">
      <div className="mb-4">AutoGen Agent Chat </div>

      <ChatBoxView initMessages={[]} />
    </main>
  );
}
