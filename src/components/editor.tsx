import Quill, { QuillOptions } from "quill";
import "quill/dist/quill.snow.css";
import { PiTextAa } from "react-icons/pi";
import { MdSend } from "react-icons/md";
import { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ImageIcon, Smile } from "lucide-react";
import Hint from "./hint";
import useIsMacOS from "@/hooks/use-is-macos";
import { Delta, Op } from "quill/core";
import { cn } from "@/lib/utils";
import EmojiPopover from "./emoji-popover";

interface EditorProps {
  onSubmit: ({ image, body }: { image: File | null; body: string }) => void;
  onCancel?: () => void;
  placeholder?: string;
  defaultValue?: Delta | Op[];
  disabled?: boolean;
  innerRef?: MutableRefObject<Quill | null>;
  variant?: "create" | "update";
}
const Editor = ({
  variant = "create",
  onSubmit,
  onCancel,
  placeholder = "Write something...",
  disabled = false,
  defaultValue = [],
  innerRef,
}: EditorProps) => {
  const isMacOs = useIsMacOS();

  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [text, setText] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef(onSubmit);
  const placeholderRef = useRef(placeholder);
  const quillRef = useRef<Quill | null>(null);
  const defaultValueRef = useRef(defaultValue);
  const disabledRef = useRef(disabled);

  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    placeholderRef.current = placeholder;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled;
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const editorContainer = container.appendChild(container.ownerDocument.createElement("div"));
    const options: QuillOptions = {
      theme: "snow",
      placeholder: placeholderRef.current,
      modules: {
        toolbar: [
          ["bold", "italic", "strike"],
          ["link"],
          [{ list: "ordered" }, { list: "bullet" }],
        ],
        keyboard: {
          bindings: {
            enter: {
              key: "Enter",
              handler: () => {
                // onSubmit();
              },
            },
            shift_enter: {
              key: "Enter",
              shiftKey: true,
              handler: () => {
                quill.insertText(quill.getSelection()?.index || 0, "\n");
              },
            },
          },
        },
      },
    };
    const quill = new Quill(editorContainer, options);
    quillRef.current = quill;
    quillRef.current.focus();
    if (innerRef) innerRef.current = quill;

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());

    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText());
    });

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      if (container) container.innerHTML = "";
      if (quillRef.current) quillRef.current = null;
      if (innerRef) innerRef.current = null;
    };
  }, []);

  const toggleToolbar = () => {
    setToolbarVisible((e) => !e);
    const toolbarElm = containerRef.current?.querySelector(".ql-toolbar");
    if (toolbarElm) toolbarElm.classList.toggle("hidden");
  };

  const isEmpty =
    text
      .trim()
      .replace("\n", "")
      .replace(/<(.|\n)*?>/g, "").length === 0;

  const onEmojiSelect = (emoji: any) => {
    const quill = quillRef.current;
    quill?.insertText(quill.getSelection()?.index || 0, emoji.native);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white">
        <div ref={containerRef} className="h-full ql-custom" />
        <div className="flex px-2 pb-2 z-[5]">
          <Hint label={!toolbarVisible ? "Show Formatting" : "Hide Formatting"}>
            <Button disabled={disabled} onClick={toggleToolbar} size="iconSm" variant="ghost">
              <PiTextAa className="size-4" />
            </Button>
          </Hint>
          <EmojiPopover onEmojiSelect={onEmojiSelect}>
            <Button disabled={disabled} size="iconSm" variant="ghost">
              <Smile className="size-4" />
            </Button>
          </EmojiPopover>
          {variant === "create" && (
            <Hint label="Add Image">
              <Button disabled={disabled} onClick={() => {}} size="iconSm" variant="ghost">
                <ImageIcon className="size-4" />
              </Button>
            </Hint>
          )}
          {variant === "update" && (
            <div className="ml-auto flex items-center gap-x-2">
              <Button variant="outline" size="sm" onClick={() => {}} disabled={disabled}>
                Cancel
              </Button>
              <Button
                className="bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
                size="sm"
                onClick={() => {}}
                disabled={disabled || isEmpty}
              >
                Save
              </Button>
            </div>
          )}
          {variant === "create" && (
            <Hint label="Send">
              <Button
                size="iconSm"
                disabled={isEmpty || disabled}
                onClick={() => {}}
                className={cn(
                  "ml-auto",
                  isEmpty
                    ? "bg-white hover:bg-white text-muted-foreground"
                    : "bg-[#007a5a] hover:bg-[#007a5a]/80 text-white",
                )}
              >
                <MdSend className="size-4" />
              </Button>
            </Hint>
          )}
        </div>
      </div>
      {variant === "create" && (
        <div
          className={cn(
            "p-2 text-[10px] text-muted-foreground flex justify-end opacity-0 transition",
            !isEmpty && "opacity-100",
          )}
        >
          <p>
            <strong>Shift + {isMacOs ? "Return" : "Enter"}</strong> to add a new line
          </p>
        </div>
      )}
    </div>
  );
};

export default Editor;
