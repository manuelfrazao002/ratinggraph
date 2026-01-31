import React from "react";
import { getStarsSrc } from "../ShowImageSrc";
import { data } from "react-router-dom";

const MAX_CAST = 18;

export default function CastList({ cast, showEpisodes = true }) {
  if (!Array.isArray(cast) || cast.length === 0) return null;

  // ordenar por número de episódios (desc)
  const sortedCast = [...cast].sort(
    (a, b) => Number(b.Episodes || 0) - Number(a.Episodes || 0),
  );

  const visibleCast = sortedCast.slice(0, MAX_CAST);

  return (
    <section style={{ width: "816px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: "24px",
          rowGap: "16px",
        }}
      >
        {visibleCast.map((actor, index) => (
          <div
            key={`${actor.Id}-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "96px",
                height: "96px",
                flexShrink: 0,
                marginRight: "24px",
              }}
            >
              {/* Foto */}
              <img
                src={getStarsSrc(actor.Id)}
                alt={actor.Name}
                loading="lazy"
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  backgroundColor: "#E0E0E0",
                  flexShrink: 0,
                  objectPosition:"20% 20%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "4px",
                  left: "4px",
                  width: "34px",
                  height: "34px",
                  borderRadius: "100%",
                  backgroundColor: "black",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  class="ipc-icon ipc-icon--favorite-border FavoritePeopleCTA_favPeopleIcon__iW3b5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  role="presentation"
                  style={{
                    verticalAlign: "center",
                    color: "white",
                  }}
                >
                  <path fill="none" d="M0 0h24v24H0V0z"></path>
                  <path d="M19.66 3.99c-2.64-1.8-5.9-.96-7.66 1.1-1.76-2.06-5.02-2.91-7.66-1.1-1.4.96-2.28 2.58-2.34 4.29-.14 3.88 3.3 6.99 8.55 11.76l.1.09c.76.69 1.93.69 2.69-.01l.11-.1c5.25-4.76 8.68-7.87 8.55-11.75-.06-1.7-.94-3.32-2.34-4.28zM12.1 18.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"></path>
                </svg>
              </div>
            </div>

            {/* Texto */}
            <div style={{ lineHeight: "1.25" }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "black",
                  letterSpacing: "0.00937em",
                  lineHeight: "1.25rem",
                  marginBottom: "0.25rem",
                  fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                }}
              >
                {actor.Name}
              </div>
              <div
                style={{
                  fontSize: "1rem",
                  color: "rgb(0,0,0,.54)",
                  letterSpacing: "0.03125em",
                  lineHeight: "1.25rem",
                  marginBottom: "0.25rem",
                  fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                }}
              >
                {actor.Character}
              </div>
              {showEpisodes && (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      fontSize: "0.875rem",
      letterSpacing: "0.01786em",
      fontWeight: "400",
      lineHeight: "1.25rem",
      fontFamily: "Roboto,Helvetica,Arial,sans-serif",
    }}
  >
    <div style={{ color: "rgb(14,99,190)" }}>
      {actor.Episodes > 0
        ? `${actor.Episodes} episode${actor.Episodes > 1 ? "s" : ""}`
        : "—"}
    </div>
    <span style={{ color: "rgb(0,0,0,.54)" }}>
      &nbsp;• {actor.Years}
    </span>
  </div>
)}

            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
