import React from "react";

const Chip = ({ text }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "2px 12px 2px 12px",
      borderRadius: "999px",
      border: `1px solid rgb(0,0,0,0.16)`,
      color: "black",
      fontFamily: "Roboto,Helvetica,Arial,sans-serif",
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
      whiteSpace: "nowrap",
      letterSpacing:"0.01786em"
    }}
  >
    <span>{text}</span>    
  </span>
);

const parseList = (value) =>
  value
    ? value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

const PlotKeywords = ({ keyword = "", total = "" }) => {
  const keywords = parseList(keyword);
  const totals = parseList(total);
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      {keywords.map((text, i) => (
        <Chip
          key={`p-${i}`}
          text={text}
          color="#1F9E46"
          icon={
            <svg
            style={{
                display:"flex",
            }}
              width="24"
              height="24"
              xmlns="http://www.w3.org/2000/svg"
              class="ipc-icon ipc-icon--theme-positive ipc-icon--inline ipc-chip__pre-icon AIThemesChipList_theme_preicon__6mHXn AIThemesChipList_positive__O5Ad_"
              viewBox="0 0 24 24"
              fill="currentColor"
              role="presentation"
            >
              <g clip-path="url(#clip0_407_248978)">
                <path d="M12.195 22.89C6.289 22.89 1.5 18.1 1.5 12.195 1.5 6.289 6.289 1.5 12.195 1.5 18.1 1.5 22.89 6.289 22.89 12.195c0 5.906-4.789 10.695-10.695 10.695zm0-2.349a8.34 8.34 0 008.346-8.346 8.34 8.34 0 00-8.346-8.347 8.34 8.34 0 00-8.347 8.347 8.34 8.34 0 008.347 8.346zm-4.737-8.346c0-.605.43-1.046 1.035-1.046h2.656V8.493c0-.605.43-1.035 1.025-1.035.616 0 1.046.43 1.046 1.035v2.656h2.666c.605 0 1.026.44 1.026 1.046 0 .595-.42 1.025-1.026 1.025H13.22v2.666c0 .595-.43 1.026-1.046 1.026-.594 0-1.025-.431-1.025-1.026V13.22H8.493c-.605 0-1.035-.43-1.035-1.025z"></path>
              </g>
              <defs>
                <clipPath id="clip0_407_248978">
                  <path d="M0 0h24v24H0z"></path>
                </clipPath>
              </defs>
            </svg>
          }
        />
      ))}
      {totals.map((text, i) => (
        <Chip
          key={`p-${i}`}
          text={text}
          color="#1F9E46"
          icon={
            <svg
            style={{
                display:"flex",
            }}
              width="24"
              height="24"
              xmlns="http://www.w3.org/2000/svg"
              class="ipc-icon ipc-icon--theme-positive ipc-icon--inline ipc-chip__pre-icon AIThemesChipList_theme_preicon__6mHXn AIThemesChipList_positive__O5Ad_"
              viewBox="0 0 24 24"
              fill="currentColor"
              role="presentation"
            >
              <g clip-path="url(#clip0_407_248978)">
                <path d="M12.195 22.89C6.289 22.89 1.5 18.1 1.5 12.195 1.5 6.289 6.289 1.5 12.195 1.5 18.1 1.5 22.89 6.289 22.89 12.195c0 5.906-4.789 10.695-10.695 10.695zm0-2.349a8.34 8.34 0 008.346-8.346 8.34 8.34 0 00-8.346-8.347 8.34 8.34 0 00-8.347 8.347 8.34 8.34 0 008.347 8.346zm-4.737-8.346c0-.605.43-1.046 1.035-1.046h2.656V8.493c0-.605.43-1.035 1.025-1.035.616 0 1.046.43 1.046 1.035v2.656h2.666c.605 0 1.026.44 1.026 1.046 0 .595-.42 1.025-1.026 1.025H13.22v2.666c0 .595-.43 1.026-1.046 1.026-.594 0-1.025-.431-1.025-1.026V13.22H8.493c-.605 0-1.035-.43-1.035-1.025z"></path>
              </g>
              <defs>
                <clipPath id="clip0_407_248978">
                  <path d="M0 0h24v24H0z"></path>
                </clipPath>
              </defs>
            </svg>
          }
        />
      ))}
    </div>
  );
};

export default PlotKeywords;