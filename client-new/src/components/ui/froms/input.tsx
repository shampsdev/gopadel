import React from "react";

export interface InputProps {
  onChangeFunction: (value: string) => void;
  title: string;
  value: string;
  maxLength: number;
  onFocus?: () => void;
  onBlur?: () => void;
  fillNotRequired?: boolean;
}

export const Input = (props: InputProps) => {
  const isEmpty = props.value.trim() === "";

  return (
    <section>
      <fieldset
        className={`border-2 rounded-xl px-3 relative transition-all duration-100 
          ${
            isEmpty && !props.fillNotRequired
              ? "border-[#E53935] text-[#E53935]"
              : "border-gray-300 text-gray-400 focus-within:border-[#20C86E] focus-within:text-[#20C86E]"
          } 
          `}
      >
        <legend className="px-2 text-[15px] font-semibold transition-all duration-100">
          {props.title}
        </legend>
        <input
          onBlur={props.onBlur}
          onFocus={props.onFocus}
          onInput={(event: React.ChangeEvent<HTMLInputElement>) =>
            props.onChangeFunction(event.target.value)
          }
          type="text"
          value={props.value}
          maxLength={props.maxLength}
          className="w-full text-main outline-none pb-[12px] py-[3px] px-[16px] bg-transparent"
        />
      </fieldset>
    </section>
  );
};
