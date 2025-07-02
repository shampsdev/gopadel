import { Icons } from "../../assets/icons";

interface SearchBarProps {
  value: string;
  inputHandler: (value: string) => void;
  placeholder: string;
  className?: string;
}

const SearchBarComponent = ({
  value,
  inputHandler,
  placeholder,
  className,
}: SearchBarProps) => {
  const closeKeyboard = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
  };

  return (
    <div
      className={`relative flex items-center gap-[12px] bg-[#F8F8FA] rounded-[18px] px-[20px] py-[16px] ${className}`}
    >
      <button>{Icons.Search()}</button>
      <input
        type="text"
        value={value}
        onKeyDown={closeKeyboard}
        onChange={(event) => inputHandler(event.target.value)}
        placeholder={placeholder}
        className="flex-1 outline-none placeholder-[#A4A9B4] text-main bg-[#F8F8FA]"
      />
    </div>
  );
};

export default SearchBarComponent;
