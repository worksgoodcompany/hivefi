import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/config";
import {
    ChatBubble,
    ChatBubbleMessage,
    ChatBubbleTimestamp,
} from "@/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { useAutoScroll } from "@/components/ui/chat/hooks/useAutoScroll";
import { moment } from "@/lib/utils";
import "./App.css";
import CopyButton from "@/components/copy-button";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { Send } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatFileInput } from "@/components/ui/chat/chat-file-input";

type TextResponse = {
    text: string;
    user: string;
    isLoading?: boolean;
    attachments?: Array<{
        url: string;
        contentType: string;
        title: string;
    }>;
};

interface Character {
    name: string;
}

interface AgentResponse {
    id: string;
    character: Character;
}

interface Agent {
    id: string;
    name: string;
}

export default function Chat() {
    const { agentId } = useParams<{ agentId: string }>();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<TextResponse[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const { scrollRef, isAtBottom, scrollToBottom, disableAutoScroll } = useAutoScroll({
        smooth: true,
    });

    // Fetch agent details
    const { data: agent, isLoading, error } = useQuery<Agent>({
        queryKey: ["agent", agentId],
        queryFn: async () => {
            if (!agentId) throw new Error("No agent ID provided");
            try {
                const res = await fetch(API_ENDPOINTS.agentDetails(agentId));
                if (!res.ok) {
                    throw new Error(`Failed to fetch agent: ${res.status}`);
                }
                const data: AgentResponse = await res.json();
                return {
                    id: data.id,
                    name: data.character.name
                };
            } catch (err) {
                console.error('Error fetching agent:', err);
                throw err;
            }
        },
        enabled: !!agentId,
        retry: 1,
    });

    // Clear messages when agent changes
    useEffect(() => {
        if (agentId) setMessages([]);
    }, [agentId]);

    useEffect(() => {
        if (messages.length > 0) scrollToBottom();
    }, [messages.length, scrollToBottom]);

    const mutation = useMutation({
        mutationFn: async (text: string) => {
            if (!agentId) throw new Error("No agent ID provided");
            try {
                const formData = new FormData();
                formData.append("text", text);
                formData.append("user", "user");

                if (selectedFile) {
                    formData.append("file", selectedFile);
                }

                const res = await fetch(API_ENDPOINTS.messages(agentId), {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData,
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Error response:", errorText);
                    throw new Error(`Failed to send message: ${res.status}`);
                }
                return res.json() as Promise<TextResponse[]>;
            } catch (err) {
                console.error('Error sending message:', err);
                throw err;
            }
        },
        onSuccess: (data) => {
            setMessages((prev) => {
                // Remove the last message if it's a loading message
                const withoutLoading = prev.filter((msg, index) =>
                    !(index === prev.length - 1 && msg.isLoading)
                );
                return [...withoutLoading, ...data];
            });
        },
        onError: (error) => {
            console.error('Mutation error:', error);
            setMessages((prev) => prev.filter(msg => !msg.isLoading)); // Remove loading message on error
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const attachments = selectedFile ? [{
            url: URL.createObjectURL(selectedFile),
            contentType: selectedFile.type,
            title: selectedFile.name,
        }] : undefined;

        const userMessage: TextResponse = {
            text: input.trim(),
            user: "user",
            attachments,
        };

        const loadingMessage: TextResponse = {
            text: "",  // Empty text for loading message
            user: "assistant",
            isLoading: true,
        };

        setMessages((prev) => [...prev, userMessage, loadingMessage]);
        setInput("");
        setSelectedFile(null);

        mutation.mutate(input.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (e.nativeEvent.isComposing) return;
            handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
        }
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full overflow-hidden">
                {/* Agent header - fixed height */}
                <div className="flex-none border-b border-[#27272A] bg-[#121212]/95 backdrop-blur supports-[backdrop-filter]:bg-[#121212]/60">
                    <div className="flex items-center justify-center h-12">
                        <span className="font-medium">
                            {isLoading ? 'Loading...' : agent?.name || 'No agent selected'}
                        </span>
                    </div>
                </div>

                {/* Messages area - flexible height with scroll */}
                <div className="flex-1 overflow-y-auto">
                    <ChatMessageList
                        scrollRef={scrollRef}
                        isAtBottom={isAtBottom}
                        scrollToBottom={scrollToBottom}
                        disableAutoScroll={disableAutoScroll}
                    >
                        {messages.length > 0 ? (
                            <div className="max-w-3xl mx-auto space-y-4">
                                {messages.map((message, idx) => (
                                    <ChatBubble
                                        key={`${message.user}-${idx}-${message.text}`}
                                        variant={message.user === "user" ? "sent" : "received"}
                                    >
                                        <ChatBubbleMessage isLoading={message.isLoading}>
                                            {message.user === "user" ? (
                                                <div>
                                                    <div className="whitespace-pre-wrap">{message.text}</div>
                                                    {message.attachments?.map((attachment) => (
                                                        <div
                                                            key={attachment.url}
                                                            className="mt-2 rounded-md overflow-hidden border border-[#27272A]"
                                                        >
                                                            {attachment.contentType.startsWith("image/") && (
                                                                <img
                                                                    src={attachment.url}
                                                                    alt={attachment.title}
                                                                    className="max-w-[200px] h-auto object-contain"
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : message.isLoading ? null : (
                                                <div className="prose prose-invert prose-sm max-w-none">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            p: ({node, ...props}) => <p className="mb-2 last:mb-0 whitespace-pre-line" {...props} />,
                                                            a: ({node, ...props}) => <a className="text-[#7f00ff] hover:underline cursor-pointer" {...props} />,
                                                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                                                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                                                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                                            code: ({inline, ...props}: {inline?: boolean} & React.HTMLProps<HTMLElement>) =>
                                                                inline ? (
                                                                    <code className="bg-black/30 rounded px-1 py-0.5" {...props} />
                                                                ) : (
                                                                    <code className="block bg-black/30 rounded p-2 my-2 overflow-x-auto" {...props} />
                                                                ),
                                                            pre: ({node, ...props}) => <pre className="bg-black/30 rounded p-2 my-2 overflow-x-auto" {...props} />,
                                                            h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                                                            h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                                                            h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-2" {...props} />,
                                                            blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-[#7f00ff] pl-4 my-2 italic" {...props} />,
                                                            table: ({node, ...props}) => <div className="overflow-x-auto my-2"><table className="min-w-full divide-y divide-[#27272A]" {...props} /></div>,
                                                            th: ({node, ...props}) => <th className="px-3 py-2 text-left text-sm font-semibold" {...props} />,
                                                            td: ({node, ...props}) => <td className="px-3 py-2 text-sm" {...props} />,
                                                            div: ({className, ...props}: React.HTMLProps<HTMLDivElement>) => {
                                                                if (className?.includes('Position Summary') || className?.includes('Account Status')) {
                                                                    return <div className="bg-black/20 rounded-lg p-3 my-2 space-y-1" {...props} />;
                                                                }
                                                                return <div {...props} />;
                                                            },
                                                            strong: ({children, ...props}: React.HTMLProps<HTMLElement>) => {
                                                                const text = String(children);
                                                                if (text.startsWith('Successfully')) {
                                                                    return <strong className="text-green-400 font-medium" {...props}>{children}</strong>;
                                                                }
                                                                return <strong className="font-medium" {...props}>{children}</strong>;
                                                            }
                                                        }}
                                                    >
                                                        {message.text}
                                                    </ReactMarkdown>
                                                    {message.attachments?.map((attachment) => (
                                                        <div
                                                            key={attachment.url}
                                                            className="mt-2 rounded-md overflow-hidden border border-[#27272A]"
                                                        >
                                                            {attachment.contentType.startsWith("image/") && (
                                                                <img
                                                                    src={attachment.url}
                                                                    alt={attachment.title}
                                                                    className="max-w-[200px] h-auto object-contain"
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </ChatBubbleMessage>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1">
                                                {!message.isLoading && <CopyButton text={message.text} />}
                                            </div>
                                            <ChatBubbleTimestamp variant={message.user === "user" ? "sent" : "received"}>
                                                {moment().format("LT")}
                                            </ChatBubbleTimestamp>
                                        </div>
                                    </ChatBubble>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center p-4">
                                <div className="text-muted-foreground text-center">
                                    {agent ? (
                                        `No messages yet. Start a conversation with ${agent.name}!`
                                    ) : (
                                        "Please select an agent to start chatting"
                                    )}
                                </div>
                            </div>
                        )}
                    </ChatMessageList>
                </div>

                {/* Input form - fixed height */}
                <div className="flex-none border-t border-[#27272A] bg-[#121212]/80 backdrop-blur supports-[backdrop-filter]:bg-[#121212]/60">
                    <div className="max-w-3xl mx-auto p-4">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                            <div className="flex items-end gap-2">
                                <div className="flex-1 relative rounded-md border bg-card">
                                    {selectedFile && (
                                        <div className="absolute bottom-full mb-2">
                                            <ChatFileInput
                                                selectedFile={selectedFile}
                                                onFileSelect={setSelectedFile}
                                            />
                                        </div>
                                    )}
                                    <ChatInput
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={isLoading ? "Loading..." : agent ? `Message ${agent.name}...` : "Select an agent..."}
                                        className="min-h-12 resize-none rounded-md bg-[#1a1a1a] border-[#27272A] focus:border-[#7f00ff] focus:ring-[#7f00ff] p-3 shadow-none focus-visible:ring-0"
                                        disabled={isLoading || mutation.isPending || !agent}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {!selectedFile && (
                                        <ChatFileInput
                                            selectedFile={selectedFile}
                                            onFileSelect={setSelectedFile}
                                        />
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={(!input.trim() && !selectedFile) || isLoading || mutation.isPending || !agent}
                                        className="h-12 gap-1.5 bg-[#7f00ff] text-white hover:bg-[#7f00ff]/90"
                                    >
                                        {mutation.isPending ? "..." : "Send"}
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
