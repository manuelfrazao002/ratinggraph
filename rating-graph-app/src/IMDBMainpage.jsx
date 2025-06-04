import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { createGlobalStyle } from "styled-components";
import { ChevronRight, PlayCircle, Image } from "lucide-react";

//Navbar
import IMDBNavbar from "./imgs/imdb/imdb_navbar.png";

//Top
import UpInfo from "./imgs/imdb/upinfo.png";

//Poster
import ShowPoster from "./imgs/covers/toe_cover.png";

function SeriesPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJw0CO3rwdc7Zuc_x-Gn2mx_SU15aSJDVKqij3HPAdeSJKyOys69vM8nOYOY19rJy_pV_V_S6uFWc1/pub?gid=1334662158&single=true&output=csv"
    )
      .then((res) => res.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          complete: (results) => {
            setData(results.data[0]);
          },
          error: (err) => console.error("Erro ao carregar CSV", err),
        });
      });
  }, []);

  const renderListWithLimit = (listStr, limit = 3) => {
    if (!listStr) return null;
    const items = listStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const visible = items.slice(0, limit);
    const hiddenCount = items.length - limit;

    return (
      <>
        {visible.map((item, i) => (
          <span key={i}>
            {item}
            {i < visible.length - 1 ? ", " : ""}
          </span>
        ))}
        {hiddenCount > 0 && <span> +{hiddenCount} more</span>}
      </>
    );
  };

  if (!data) return <p>Carregando...</p>;

  const GlobalStyle = createGlobalStyle`
  #root {
    padding: 0 !important;
    font-family: Roboto,Helvetica,Arial,sans-serif;
    background-color: #1F1F1F;
  }
`;

  return (
    <>
      <GlobalStyle />
      <div>
        <a href="/">
        <img src={IMDBNavbar} alt="" />
        </a>

        <main style={{ width: "1280px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingLeft: "19px",
              paddingRight: "12px",
              position: "relative",
              top: "-7px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <p
                style={{
                  marginLeft: "2px",
                  marginRight: "12px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                Episode guide{" "}
              </p>
              <p style={{ fontSize: 14, color: "#C0C0C0", marginRight: "6px" }}>
                {data.Episodes}
              </p>
              <ChevronRight size={20} style={{ color: "white" }} />
            </div>
            <img src={UpInfo} alt="" style={{ height: 48 }} />
          </div>

          <div>
            <h1
              style={{
                color: "white",
                fontSize: "47px",
                fontWeight: "0",
                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                marginTop: 0,
                marginBottom: 0,
                paddingLeft: "19px",
              }}
            >
              {data.Title}
            </h1>
            <div
              style={{
                color: "#C0C0C0",
                paddingLeft: "19px",
                marginBottom: "10px",
                fontSize: 14,
                fontWeight: "lighter",
              }}
            >
              {data.Type} <span style={{ fontWeight: "bold" }}>·</span>{" "}
              {data.BeginingYear} – {data.EndingYear || "..."}{" "}
              <span style={{ fontWeight: "bold" }}>·</span> {data.AgeRating}{" "}
              <span style={{ fontWeight: "bold" }}>·</span> {data.EpDuration}
            </div>
          </div>

          {/* Poster */}
          <div style={{display: "flex", justifyContent: "space-evenly"}}>
            <img src={ShowPoster} alt={`${data.Title} Poster`} loading="lazy" style={{height: "414.667px"}}/>
            {/* Botões vídeos/fotos */}
            <div>
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M3 22v-20l18 10-18 10z" />
                </svg>
                {data.Videos} Videos
              </button>
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8 13l2.5 3 3.5-4.5 4.5 6H6l2-4z" />
                </svg>
                {data.Photos} Photos
              </button>
            </div>
          </div>

          <div>
            {/* Avaliações */}
            <div>
              <div>
                <span>★</span>
                <span>{data.Votes || "N/A"}</span>
              </div>
              <div>
                {data.UserReviews} User Reviews • {data.CriticReviews} Critic
                Reviews
              </div>
              <div>
                Added to watchlist by <span>{data.WatchlistNumber}</span> users
              </div>
            </div>

            {/* Sinopse */}
            <p>{data.Synopsis}</p>

            {/* Criadores e Elenco */}
            <div>
              <div>
                <h2>Creators</h2>
                <p>{renderListWithLimit(data.Creators, 4)}</p>
              </div>
              <div>
                <h2>Stars</h2>
                <p>{renderListWithLimit(data.Stars, 6)}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default SeriesPage;
