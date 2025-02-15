import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

const chatBubbleVariants = cva(
    "relative flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-4 py-2 text-sm",
    {
        variants: {
            variant: {
                sent: "ml-auto bg-[#4a0099] text-white",
                received: "bg-[#1a1a1a] border border-[#27272A]",
            },
        },
        defaultVariants: {
            variant: "received",
        },
    }
);

interface ChatBubbleProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof chatBubbleVariants> {
    children: React.ReactNode;
}

export function ChatBubble({
    className,
    variant,
    children,
    ...props
}: ChatBubbleProps) {
    return (
        <div
            className={cn(
                chatBubbleVariants({ variant }),
                "transition-all duration-200 ease-in-out",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface ChatBubbleMessageProps extends React.HTMLAttributes<HTMLDivElement> {
    isLoading?: boolean;
}

export function ChatBubbleMessage({
    className,
    children,
    isLoading,
    ...props
}: ChatBubbleMessageProps) {
    if (isLoading) {
        return (
            <div
                className={cn(
                    "flex items-center gap-2 text-muted-foreground animate-pulse",
                    className
                )}
                {...props}
            >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "break-words [word-break:break-word] [hyphens:auto]",
                "animate-in fade-in-0 slide-in-from-bottom-1 duration-200",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function ChatBubbleTimestamp({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "sent" | "received" }) {
    return (
        <div
            className={cn(
                "select-none text-[10px] opacity-70",
                props.variant === "sent" ? "text-white/70" : "text-muted-foreground",
                className
            )}
            {...props}
        />
    );
}
