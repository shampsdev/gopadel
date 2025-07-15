import React from "react";
import { postEvent } from "@telegram-apps/sdk-react";

const openLink = (url: string) => {
  try {
    postEvent("web_app_open_link", {
      url: url,
    });
  } catch (error) {
    window.open(url, "_blank");
  }
};

export const wrapLinksInText = (text: string): React.ReactNode[] => {
  const urlRegex = /(https:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <span
          key={index}
          onClick={() => openLink(part)}
          className="text-[#77BE14] cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              openLink(part);
            }
          }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
};
