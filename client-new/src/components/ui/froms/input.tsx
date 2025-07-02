import React from "react";

export interface InputProps {
  onChangeFunction: (value: string) => void;
  title: string;
  value: string;
  maxLength: number;
  onFocus?: () => void;
  onBlur?: () => void;
  fillNotRequired?: boolean;
  placeholder?: string;
}

export const Input = (props: InputProps) => {
  return (
    <section>
      <fieldset
        className={`border-2 rounded-[14px] px-3 relative transition-all 
          ${"border-[#EBEDF0] text-[#A4A9B4] focus-within:border-[#000] focus-within:text-[#000]"} 
          `}
      >
        <legend className="px-2 text-[15px] font-semibold transition-all duration-100">
          {props.title}
        </legend>
        <input
          onBlur={props.onBlur}
          onFocus={props.onFocus}
          placeholder={props.placeholder}
          onInput={(event: React.ChangeEvent<HTMLInputElement>) =>
            props.onChangeFunction(event.target.value)
          }
          type="text"
          value={props.value}
          maxLength={props.maxLength}
          className="w-full text-black outline-none pb-[12px] py-[3px] px-[16px] bg-transparent"
        />
      </fieldset>
    </section>
  );
};
