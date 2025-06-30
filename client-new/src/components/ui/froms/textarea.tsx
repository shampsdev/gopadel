import { useRef, useEffect } from "react";
export interface TextareaProps {
  onChangeFunction: (value: string) => void;
  title: string;
  value: string;
  maxLength: number;
  onFocus?: () => void;
  onBlur?: () => void;
  fillNotRequired?: boolean;
}
export const Textarea = (props: TextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  useEffect(() => {
    autoResize();
  }, [props.value]);

  const limitNewlines = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const value = event.currentTarget.value;
    const newlines = (value.match(/\n/g) || []).length;

    if (event.key === "Enter" && newlines >= 6) {
      event.preventDefault();
    }
  };

  return (
    <section>
      <fieldset
        className={
          "border-2 rounded-xl p-3 relative border-gray-300 focus-within:border-[#000] focus-within:text-[#000] text-[#A2ACB0]"
        }
      >
        <legend className="px-2 text-[15px] font-semibold transition-all ">
          {props.title}
        </legend>
        <textarea
          ref={textareaRef}
          onBlur={props.onBlur}
          onFocus={props.onFocus}
          value={props.value}
          onChange={(event) => {
            props.onChangeFunction(event.target.value);
            autoResize();
          }}
          onKeyDown={limitNewlines}
          maxLength={props.maxLength}
          style={{
            whiteSpace: "pre-wrap",
            overflow: "hidden",
          }}
          className="resize-none w-full  outline-none pb-[6px] py-[3px] px-[16px] bg-transparent"
        />
      </fieldset>
    </section>
  );
};
