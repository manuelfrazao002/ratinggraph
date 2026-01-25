import React from "react";

const Chip = ({ icon, text, color }) => (
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
    <span style={{ color}}>{icon}</span>
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

const ThemesChips = ({ positive = "", negative = "", neutral = "" }) => {
  const positives = parseList(positive);
  const negatives = parseList(negative);
  const neutrals = parseList(neutral);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      {positives.map((text, i) => (
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

      {negatives.map((text, i) => (
        <Chip
          key={`n-${i}`}
          text={text}
          color="#D92D20"
          icon={
            <svg
                        style={{
                display:"flex",
            }}
              width="24"
              height="24"
              xmlns="http://www.w3.org/2000/svg"
              class="ipc-icon ipc-icon--theme-negative ipc-icon--inline ipc-chip__pre-icon AIThemesChipList_theme_preicon__6mHXn AIThemesChipList_negative__FANMQ"
              viewBox="0 0 24 24"
              fill="currentColor"
              role="presentation"
            >
              <g clip-path="url(#clip0_407_249008)">
                <path d="M12.195 22.89C6.289 22.89 1.5 18.1 1.5 12.195 1.5 6.289 6.289 1.5 12.195 1.5 18.1 1.5 22.89 6.289 22.89 12.195c0 5.906-4.789 10.695-10.695 10.695zm0-2.349a8.34 8.34 0 008.346-8.346 8.34 8.34 0 00-8.346-8.347 8.34 8.34 0 00-8.347 8.347 8.34 8.34 0 008.347 8.346zM8.4 13.252c-.646 0-1.108-.4-1.108-1.036 0-.635.452-1.046 1.108-1.046h7.588c.656 0 1.097.41 1.097 1.046 0 .636-.461 1.036-1.097 1.036H8.4z"></path>
              </g>
              <defs>
                <clipPath id="clip0_407_249008">
                  <path d="M0 0h24v24H0z"></path>
                </clipPath>
              </defs>
            </svg>
          }
        />
      ))}

      {neutrals.map((text, i) => (
        <Chip
          key={`u-${i}`}
          text={text}
          color="#6B7280"
          icon={
            <svg
                        style={{
                display:"flex",
            }}
              width="24"
              height="24"
              xmlns="http://www.w3.org/2000/svg"
              class="ipc-icon ipc-icon--theme-neutral ipc-icon--inline ipc-chip__pre-icon AIThemesChipList_theme_preicon__6mHXn"
              viewBox="0 0 24 24"
              fill="currentColor"
              role="presentation"
            >
              <g clip-path="url(#clip0_407_248989)">
                <path d="M12.195 22.89C6.289 22.89 1.5 18.1 1.5 12.195 1.5 6.289 6.289 1.5 12.195 1.5 18.1 1.5 22.89 6.289 22.89 12.195c0 5.906-4.789 10.695-10.695 10.695zm0-2.349a8.34 8.34 0 008.346-8.346 8.34 8.34 0 00-8.346-8.347 8.34 8.34 0 00-8.347 8.347 8.34 8.34 0 008.347 8.346zm-.01-4.337a4.026 4.026 0 01-4.02-4.02 4.028 4.028 0 014.02-4.03 4.03 4.03 0 014.03 4.03 4.028 4.028 0 01-4.03 4.02z"></path>
              </g>
              <defs>
                <clipPath id="clip0_407_248989">
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

export default ThemesChips;
