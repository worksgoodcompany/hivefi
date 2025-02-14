import { forwardRef } from "react";
import TextareaAutosize, { TextareaAutosizeProps } from "react-textarea-autosize";
import { cn } from "@/lib/utils";

export interface ChatInputProps
    extends Omit<TextareaAutosizeProps, "className" | "children"> {
    className?: string;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
    ({ className, ...props }, ref) => {
        return (
            <TextareaAutosize
                ref={ref}
                className={cn(
                    "flex w-full rounded-md bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                minRows={1}
                maxRows={4}
                {...props}
            />
        );
    }
);

ChatInput.displayName = "ChatInput";

export { ChatInput };
