import React from "react";
import AddBtn from "../imgs/imdb/addbtn.png";
import AddPlot2 from "../imgs/imdb/addplot2.png";

export default function NextEpisode({ nextEpisode, coverSrc }) {
  if (!nextEpisode) return null;

  const isSeriesPremiere =
    Number(nextEpisode.season) === 1 &&
    Number(nextEpisode.number) === 1;

  const isSeasonPremiere =
    Number(nextEpisode.number) === 1 && !isSeriesPremiere;

  return (
    <section style={{ margin: "0 auto", width: "856px" }}>
      <div
        style={{
          display: "flex",
          gap: "25px",
          width: "808px",
          marginLeft: 3,
          marginBottom: 12,
          position: "relative",
          top: -7,
        }}
      >
        <img
          src={
            nextEpisode.Image?.startsWith("http")
              ? nextEpisode.Image
              : coverSrc
          }
          alt="Next Episode"
          style={{
            width: "224px",
            height: "126px",
            objectFit: "cover",
            borderRadius: "12px",
          }}
        />

        <div>
          <h2
            style={{
              fontSize: "0.73rem",
              marginBottom: 0,
              color: "#000",
              letterSpacing: "2.2px",
            }}
          >
            {isSeriesPremiere
              ? "SERIES PREMIERE"
              : isSeasonPremiere
              ? `SEASON ${Number(nextEpisode.season)} PREMIERE`
              : "NEXT EPISODE"}
          </h2>

          <div style={{ display: "flex", marginTop: 10 }}>
            <img src={AddBtn} alt="" />
            <div style={{ marginLeft: 12 }}>
              <h3
                style={{
                  color: "#212121",
                  fontWeight: "bold",
                  margin: 0,
                  fontSize: "1rem",
                }}
              >
                {nextEpisode.Title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#7C7C7C",
                }}
              >
                {nextEpisode.Date}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <img src={AddPlot2} alt="" />
          </div>
        </div>
      </div>
    </section>
  );
}
