"use client";
import {
  AcademicCapIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Collapse, Dropdown, MenuProps, message } from "antd";
import * as React from "react";
import { IChatMessage, IStatus } from "../types";
import MarkdownView from "../markdown";
import ChatSideBar from "./chatsidebar";
import AgentMessagesView from "./messagesview";

interface CodeProps {
  node?: any;
  inline?: any;
  className?: any;
  children?: React.ReactNode;
}
export default function ChatBoxView({
  initMessages,
  viewHeight = "100%",
}: {
  initMessages: any[];
  viewHeight?: string;
}) {
  const queryInputRef = React.useRef<HTMLInputElement>(null);
  const messageBoxInputRef = React.useRef<HTMLDivElement>(null);
  const user = { email: "testuser@mail.com" };

  const serverUrl = process.env.NEXT_PUBLIC_API_SERVER;
  const deleteMsgUrl = `${serverUrl}/messages/delete`;

  const [loading, setLoading] = React.useState(false);
  const [selectedMessage, setSelectedMessage] =
    React.useState<IChatMessage | null>(null);
  const [error, setError] = React.useState<IStatus | null>({
    status: true,
    message: "All good",
  });
  const [messages, setMessages] = React.useState<IChatMessage[]>([]);

  //console.log('serverUrl', serverUrl);

  const parseMessages = (messages: any) => {
    return messages.map((message: any) => {
      let meta;
      try {
        meta = JSON.parse(message.metadata);
      } catch (e) {
        meta = message.metadata;
      }
      const msg: IChatMessage = {
        text: message.content,
        sender: message.role === "user" ? "user" : "bot",
        metadata: meta,
        msgId: message.msgId,
      };
      return msg;
    });
  };

  React.useEffect(() => {
    // console.log("initMessages changed", initMessages);
    // const initMsgs: IChatMessage[] = parseMessages(initMessages);
    setMessages(initMessages);
  }, [initMessages]);

  const messageListView = messages.map((message: IChatMessage, i: number) => {
    const isUser = message.sender === "user";
    const css = isUser ? "bg-accent text-white  " : "bg-light";
    // console.log("message", message);
    let hasMeta = false;
    if (message.metadata) {
      hasMeta =
        message.metadata.code !== null ||
        message.metadata.images?.length > 0 ||
        message.metadata.files?.length > 0 ||
        message.metadata.scripts?.length > 0;
    }

    let items: MenuProps["items"] = [];

    if (isUser) {
      items.push({
        label: (
          <div
            onClick={() => {
              console.log("retrying");
              getCompletion(message.text);
            }}
          >
            <span className="inline-block">
              {" "}
              <ArrowPathIcon
                role={"button"}
                title={"Retry"}
                className="h-4 w-4 mr-1 inline-block"
              />
              Retry
            </span>
          </div>
        ),
        key: "retrymessage",
      });
    }

    if (hasMeta) {
      items.push({
        label: (
          <div
            onClick={() => {
              //   setMetadata(message.metadata);
            }}
          >
            <DocumentChartBarIcon
              title={"View Metadata"}
              className="h-4 w-4 mr-1 inline-block"
            />
            View Metadata
          </div>
        ),
        key: "metadata",
      });
    }

    const menu = (
      <Dropdown
        className="w-32"
        menu={{ items }}
        trigger={["click"]}
        placement="bottomRight"
      >
        <div
          role="button"
          className="  ml-2 duration-100 hover:bg-secondary font-semibold px-2 pb-1  rounded"
        >
          <span className="inline-block -mt-2  "> ... </span>
        </div>
      </Dropdown>
    );

    return (
      <div
        className={`align-right ${
          isUser ? "text-right" : " mb-2 border-b pb-2"
        }  `}
        key={"message" + i}
      >
        {" "}
        <div className={`  ${isUser ? "" : " w-full "} inline-flex gap-2`}>
          <div className="">
            {" "}
            {!isUser && (
              <span className="inline-block  text-accent  bg-primary pb-2 ml-1">
                <AcademicCapIcon className="inline-block h-6 " />{" "}
              </span>
            )}
          </div>
          <div
            // style={{ minWidth: "70%" }}
            className={`inline-block ${isUser ? "" : " w-full "} p-2 rounded  `}
          >
            {" "}
            {isUser && (
              <>
                <div className={`  ${css} p-2 rounded`}>
                  {message.text}
                  <div
                    role="button"
                    onClick={() => {
                      console.log("retrying");
                      getCompletion(message.text);
                    }}
                  ></div>
                </div>
                <span
                  role="button"
                  onClick={() => {
                    console.log("retrying");
                    getCompletion(message.text);
                  }}
                  className="mt-1 text-sm inline-block"
                >
                  {" "}
                  <ArrowPathIcon
                    title={"Retry"}
                    className="h-4 w-4 mr-1 inline-block"
                  />
                  Retry
                </span>
              </>
            )}
            {!isUser && (
              <>
                <MarkdownView data={message.text} />

                <Collapse
                  size="small"
                  className="text-xs mt-2"
                  items={[
                    {
                      key: "1",
                      label: (
                        <div>
                          <span className="pr-2">
                            {" "}
                            {`Agent Messages (${message.metadata?.messages.length})`}
                          </span>
                        </div>
                      ),
                      children: (
                        <div>
                          <AgentMessagesView
                            messages={message.metadata.messages}
                          />
                        </div>
                      ),
                    },
                  ]}
                  onChange={(e: any) => {
                    console.log("changed", e);
                    // setTimeout(() => {
                    //   scrollChatBox();
                    // }, 400);
                  }}
                />
              </>
            )}
          </div>
          {isUser && <UserIcon className="inline-block h-6 " />}
        </div>
      </div>
    );
  });

  React.useEffect(() => {
    // console.log("messages updated, scrolling");
    scrollChatBox();
  }, [messages]);

  // clear text box if loading has just changed to false and there is no error
  React.useEffect(() => {
    if (loading === false && queryInputRef.current) {
      if (queryInputRef.current) {
        // console.log("loading changed", loading, error);
        if (error === null || (error && error.status === false)) {
          queryInputRef.current.value = "";
        }
      }
    }
  }, [loading]);

  // scroll to queryInputRef on load
  React.useEffect(() => {
    // console.log("scrolling to query input");
    // if (queryInputRef.current) {
    //   queryInputRef.current.scrollIntoView({
    //     behavior: "smooth",
    //     block: "center",
    //   });
    // }
  }, []);

  const chatHistory = (messages: IChatMessage[]) => {
    let history = "";
    messages.forEach((message) => {
      history += `${message.sender}: ${message.text} \n`;
    });
    return history;
  };

  const scrollChatBox = () => {
    messageBoxInputRef.current?.scroll({
      top: messageBoxInputRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const getLastMessage = (messages: any[], n: number = 5) => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const content = messages[i]["content"];
      if (content.length > n) {
        return content;
      }
    }
    return null;
  };

  const getCompletion = (query: string) => {
    setError(null);
    let messageHolder = Object.assign([], messages);
    let history = chatHistory(messages);
    console.log("****history****", history);

    const userMessage: IChatMessage = {
      text: query,
      sender: "user",
    };
    messageHolder.push(userMessage);
    setMessages(messageHolder);

    const payload = {
      prompt: query,
      history: history,
    };

    console.log("payload", payload);

    const generateUrl = `${serverUrl}/generate`;
    const postData = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };
    setLoading(true);
    fetch(generateUrl, postData)
      .then((res) => {
        setLoading(false);
        if (res.status === 200) {
          res.json().then((data) => {
            if (data && data.status) {
              console.log("******* response received ", data);
              const lastMessage = getLastMessage(data.data.messages);
              const botMesage: IChatMessage = {
                text: lastMessage,
                sender: "bot",
                metadata: data.data,
              };

              // metadata.set({ ...metadata.get, messages: data.data });
              setSelectedMessage(botMesage);

              messageHolder.push(botMesage);
              messageHolder = Object.assign([], messageHolder);
              setMessages(messageHolder);
              console.log(messageHolder);
            } else {
              console.log("error", data);
              // setError(data);
              message.error(data.message);
            }
          });
        } else {
          message.error("Connection error. Ensure server is up and running.");
        }
      })
      .catch((err) => {
        setLoading(false);
        message.error("Connection error. Ensure server is up and running.");
      });
  };

  return (
    <div
      style={{ height: "calc(100% - 20px)" }}
      className="text-primary   overflow-auto bg-primary relative scroll   rounded flex-1 "
    >
      <div
        style={{ height: "calc(100% - 100px)" }}
        ref={messageBoxInputRef}
        className="flex overflow-auto  flex-col rounded  scroll pr-2   "
      >
        <div className="flex-1  boder mt-4"></div>
        <div className="ml-2 "> {messageListView}</div>
        <div className="ml-2 h-6   mb-4 mt-2   ">
          {loading && (
            <div className="inline-flex gap-2">
              <span className="  rounded-full bg-accent h-2 w-2  inline-block"></span>
              <span className="animate-bounce rounded-full bg-accent h-3 w-3  inline-block"></span>
              <span className=" rounded-full bg-accent h-2 w-2  inline-block"></span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 p-2   w-full">
        <div
          className={`mt-2   rounded p-2 shadow-lg flex mb-1    ${
            loading ? " opacity-50 pointer-events-none" : ""
          }`}
        >
          {/* <input className="flex-1 p-2 ring-2" /> */}
          <form
            className="flex-1 "
            onSubmit={(e) => {
              e.preventDefault();
              // if (queryInputRef.current && !loading) {
              //   getCompletion(queryInputRef.current?.value);
              // }
            }}
          >
            <input
              id="queryInput"
              name="queryInput"
              onKeyDown={(e) => {
                if (e.key === "Enter" && queryInputRef.current && !loading) {
                  getCompletion(queryInputRef.current?.value);
                }
              }}
              ref={queryInputRef}
              className="w-full text-gray-600 rounded rounded-r-none border border-accent bg-white p-2   ropunded-sm"
            />
          </form>
          <div
            role={"button"}
            onClick={() => {
              if (queryInputRef.current && !loading) {
                getCompletion(queryInputRef.current?.value);
              }
            }}
            className="bg-accent   hover:brightness-75 transition duration-300 rounded pt-2 rounded-l-none px-5 "
          >
            {" "}
            {!loading && (
              <div className="inline-block     ">
                <PaperAirplaneIcon className="h-6 text-white   inline-block" />{" "}
              </div>
            )}
            {loading && (
              <div className="inline-block   ">
                <Cog6ToothIcon className="relative -pb-2 text-white animate-spin  inline-flex rounded-full h-6 w-6" />
              </div>
            )}
          </div>
        </div>{" "}
        {error && !error.status && (
          <div className="p-2 border rounded mt-4 text-orange-500 text-sm">
            {" "}
            <ExclamationTriangleIcon className="h-5 text-orange-500 inline-block mr-2" />{" "}
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
