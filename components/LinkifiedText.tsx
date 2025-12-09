import React from "react";

interface LinkifiedTextProps {
  text: string;
  className?: string;
  as?: React.ElementType;
}

export default function LinkifiedText({
  text,
  className = "",
  as: Component = "p",
}: LinkifiedTextProps) {
  const urlRegex =
    /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]|\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

  const linkify = (str: string) => {
    return str.replace(urlRegex, (url) => {
      const fullUrl = /^(https?|ftp|file):\/\//i.test(url)
        ? url
        : `http://${url}`;

      return `<a href="${fullUrl}" class="text-blue-600 underline break-words" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  };

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: linkify(text) }}
    />
  );
}