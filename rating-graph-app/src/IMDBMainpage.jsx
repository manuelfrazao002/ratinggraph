import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import { createGlobalStyle } from "styled-components";
import { ChevronRight, ChevronDown } from "lucide-react";

//Navbar
import IMDBNavbar from "./imgs/imdb/imdb_navbar.png";

//Top
import UpInfo from "./imgs/imdb/upinfo.png";
import EpisodeGuide from "./imgs/imdb/episodeguide.png";

//Poster
import ShowTitle from "./imgs/imdb/showtitle.png";
import ShowPoster from "./imgs/covers/toe_cover.png";
import ImgTrailer from "./imgs/imdb/imgTrailer.jpg";

import VideoImg from "./imgs/imdb/videoimg.png";
import ImgsSquares from "./imgs/imdb/imgsquares.png";
import StarImdb from "./imgs/imdb/starimdb.png";
import RateIMDB from "./imgs/imdb/rateimdb.png";

import IMDBRating from "./imgs/imdb/imdbrating.png";
import YourRating from "./imgs/imdb/yourrating.png";
import Popularity from "./imgs/imdb/popularity.png";

//Arrows
import ArrowUp from "./imgs/imdb/arrowup.png";
import ArrowDown from "./imgs/imdb/arrowdown.png";
import ArrowStay from "./imgs/imdb/arrowstay.png";

import Categories from "./imgs/imdb/categories.png";
import IMDBPro from "./imgs/imdb/imdbpro.png";

import SmallArrowUp from "./imgs/imdb/smallarrowup.png";

import MarkedWatched from "./imgs/imdb/markwatched.png";

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

  function formatVotes(votes) {
    if (!votes) return "N/A";

    // Remove vírgulas e espaços, converte para número
    const num = Number(votes.toString().replace(/[, ]+/g, ""));

    if (isNaN(num)) return "N/A";

    if (num < 1000) {
      return num.toString();
    } else if (num < 1_000_000) {
      // Milhares: arredonda pra cima na metade, divide por 1000, uma casa decimal só se necessário
      const k = Math.ceil(num / 100) / 10;
      return k % 1 === 0 ? `${k.toFixed(0)}K` : `${k.toFixed(0)}K`;
    } else {
      // Milhões: arredonda pra cima na metade, divide por 1_000_000, uma casa decimal só se necessário
      const m = Math.ceil(num / 100_000) / 10;
      return m % 1 === 0 ? `${m.toFixed(0)}M` : `${m.toFixed(1)}M`;
    }
  }

  function renderListWithDotSeparator(list) {
    if (!list) return null;

    const items = Array.isArray(list)
      ? list
      : list.split(",").map((item) => item.trim());

    const limitedItems = items.slice(0, 3);

    return limitedItems.map((item, index) => (
      <React.Fragment key={index}>
        <span style={{ color: "#528EDC" }}>{item}</span>
        {index < limitedItems.length - 1 && (
          <span style={{ color: "white", margin: "0 6px" }}>·</span>
        )}
      </React.Fragment>
    ));
  }

  function formatNumber(num) {
    if (!num) return "N/A";

    const cleanNum = Number(num.toString().replace(/[, ]+/g, ""));
    if (isNaN(cleanNum)) return "N/A";

    if (cleanNum >= 1_000_000) {
      const millions = Math.floor((cleanNum / 1_000_000) * 10) / 10;
      return millions.toString().replace(/\.0$/, "") + "M";
    }

    if (cleanNum >= 100_000) {
      // Corte seco para evitar 100.1K, exibir como 100K
      const thousands = Math.floor(cleanNum / 1_000);
      return thousands + "K";
    }

    if (cleanNum >= 1_000) {
      // Aqui sim mantemos uma casa decimal
      const thousands = Math.floor((cleanNum / 1_000) * 10) / 10;
      return thousands.toString().replace(/\.0$/, "") + "K";
    }

    return cleanNum.toString();
  }



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
              paddingLeft: "22px",
              paddingRight: "12px",
              position: "relative",
              top: "-8px",
            }}
          >
            <a href="/episodepage">
            <div style={{ display: "flex", alignItems: "center" }}>
              <p
                style={{
                  marginRight: "12px",
                  alignItems: "center",
                  display: "flex",
                }}
              >
                <img src={EpisodeGuide} alt="" />
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginLeft: -2,
                }}
              >
                <p
                  style={{ fontSize: 14, color: "#C0C0C0", marginRight: "6px" }}
                >
                  {data.Episodes}
                </p>
                <ChevronRight size={20} style={{ color: "white" }} />
              </div>
            </div>
            </a>
            <img src={UpInfo} alt="" style={{ height: 48, marginTop: 1 }} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "0 auto",
              width: "1232px",
            }}
          >
            <div style={{ display: "block" }}>
              <h1
                style={{
                  color: "white",
                  fontWeight: "0",
                  fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                  marginTop: -13,
                  marginBottom: 0,
                  height: 58,
                }}
              >
                <img src={ShowTitle} alt="" />
              </h1>
              <div
                style={{
                  color: "#C0C0C0",
                  marginBottom: "9px",
                  fontSize: "0.9rem",
                  marginTop: -3,
                  fontWeight: "lighter",
                  position: "relative",
                  top: "1px",
                  WebkitTextStroke: "0.1px #C0C0C0",
                }}
              >
                {data.Type}
                <span style={{ fontWeight: "bold", margin: "0 7px" }}>·</span>
                {data.BeginingYear}−{data.EndingYear || "..."}
                <span style={{ fontWeight: "bold", margin: "0 7px" }}>·</span>
                {data.AgeRating}
                <span style={{ fontWeight: "bold", margin: "0 7px" }}>·</span>
                {data.EpDuration}
              </div>
            </div>

            {/*Aside */}
            <div
              style={{
                height: "66px",
                padding: 0,
                margin: 0,
                display: "flex",
                position: "relative",
                top: "-7px",
              }}
            >
              <div style={{ paddingRight: 25, margin: "0 auto" }}>
                <img src={IMDBRating} alt="" />
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <img
                    src={StarImdb}
                    alt=""
                    width={32}
                    height={32}
                    style={{
                      marginRight: "0.2rem",
                      position: "relative",
                      top: "-1px",
                      left: "-1.3px",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      top: "-5px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "baseline",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "18.5px",
                          color: "white",
                          WebkitTextStroke: "1px white",
                          fontFamily: "Roboto",
                          letterSpacing: "1.5px",
                          position: "relative",
                          top: "1px",
                          left: "-1px",
                        }}
                      >
                        {data.Rating}
                      </span>
                      <span
                        style={{
                          color: "#BCBCBC",
                          fontSize: 15,
                          WebkitTextStroke: "0.1px #BCBCBC",
                          letterSpacing: "1.5px",
                        }}
                      >
                        /10
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#BCBCBC",
                        position: "relative",
                        top: "-4px",
                        left: "-1px",
                        letterSpacing: "0.8px",
                        WebkitTextStroke: "0.1px #BCBCBC",
                      }}
                    >
                      {formatVotes(data.Votes) || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ paddingRight: 18 }}>
                <img src={YourRating} alt="" />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    position: "relative",
                    top: "-2px",
                  }}
                >
                  <img
                    src={RateIMDB}
                    alt=""
                    style={{ position: "relative", left: "-1px" }}
                  />
                </div>
              </div>
              <div style={{ marginRight: "5px" }}>
                <img src={Popularity} alt="" />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    top: "-2px",
                  }}
                >
                  <img
                    src={
                      data.PopStatus === "up"
                        ? ArrowUp
                        : data.PopStatus === "down"
                        ? ArrowDown
                        : ArrowStay
                    }
                    alt=""
                    style={{ marginRight: "4px" }}
                  />

                  {/* Popularidade sempre visível */}
                  <span
                    style={{
                      marginRight: "10px",
                      fontSize: "19px",
                      WebkitTextStroke: "1px white",
                      fontFamily: "Roboto",
                      letterSpacing: "1.5px",
                      position: "relative",
                      top: "1px",
                    }}
                  >
                    {data.Popularity}
                  </span>

                  {/* Condicional para SmallArrowUp */}
                  {data.PopStatus !== "stay" && (
                    <div
                      style={{
                        paddingRight: "3px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={SmallArrowUp}
                        alt=""
                        style={{
                          width: "8px",
                          position: "relative",
                          top: "0.109rem",
                          transform:
                            data.PopStatus === "down"
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          transformOrigin: "center center",
                          transition: "transform 0.3s ease",
                          display: "block",
                        }}
                      />
                    </div>
                  )}
                  {/* Texto PopUp aparece só se PopStatus diferente de "stay" */}
                  {data.PopStatus !== "stay" && (
                    <span
                      style={{
                        color: "#A4AAB5",
                        WebkitTextStroke: "0.2px #A4AAB5",
                        fontFamily: "Roboto",
                        letterSpacing: "1.5px",
                        position: "relative",
                        top: "2px",
                      }}
                    >
                      {data.PopUp}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Poster */}
          <section
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              width: "1232px",
              margin: "0 auto",
            }}
          >
            <div>
              <img
                src={ShowPoster}
                alt={`${data.Title} Poster`}
                loading="lazy"
                style={{
                  width: "278.267px",
                  height: "414.667px",
                  objectFit: "cover",
                  borderRadius: 12,
                }}
              />
            </div>
            <div style={{ margin: "0 auto", position: "relative" }}>
              <img
                src={ImgTrailer}
                alt=""
                style={{
                  width: "737.2px",
                  height: "414.667px",
                  objectFit: "cover",
                  borderRadius: 12,
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "737.2px",
                  height: "414.667px",
                  borderRadius: 12,
                  cursor: "pointer",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  transition: "background-color 0.3s ease",
                  // Não precisa do flex center aqui mais porque vamos posicionar só no canto
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.5)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.3)")
                }
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: 20, // afastamento do canto inferior
                    left: 20, // afastamento do canto esquerdo
                    display: "flex",
                    alignItems: "center",
                    // espaço entre o círculo e o texto
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      position: "relative",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 12,
                      top: "5px",
                      left: "-4px",
                    }}
                  >
                    {/* Círculo com borda branca */}
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        border: "3px solid white", // borda branca
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        filter: "drop-shadow(0 0 4px rgba(0,0,0,0.7))",
                        transition: "background-color 0.3s ease",
                      }}
                    >
                      <svg
                        width="34"
                        height="34"
                        viewBox="0 0 24 24"
                        fill="white"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>

                    {/* Texto ao lado */}
                    <span
                      style={{
                        color: "white",
                        fontSize: 24,
                        fontWeight: "600",
                        userSelect: "none",
                        textShadow: "0 0 5px rgba(0,0,0,0.7)",
                        position: "relative",
                        top: "-2px",
                        left: "-4px",
                      }}
                    >
                      Play trailer
                    </span>
                    <span
                      style={{
                        color: "white",
                        position: "relative",
                        top: "1px",
                        left: "-7px",
                      }}
                    >
                      2:41
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões vídeos/fotos */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                maxHeight: "414.667px",
              }}
            >
              <button
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f5c518",
                  border: "none",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                  borderRadius: "12px",
                  backgroundColor: "#313131",
                  width: "208.533px",
                  height: "205.333px",
                  paddingTop: 30,
                }}
              >
                <img
                  src={VideoImg}
                  alt=""
                  style={{ width: "32px", marginBottom: 15 }}
                />
                <br />
                <p
                  style={{
                    fontSize: "0.71rem",
                    letterSpacing: "2px",
                    position: "relative",
                    top: "-9px",
                    WebkitTextStroke: "0.5px white",
                  }}
                >
                  {data.Videos} VIDEOS
                </p>
              </button>
              <button
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f5c518",
                  border: "none",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                  borderRadius: "12px",
                  backgroundColor: "#313131",
                  width: "208.533px",
                  height: "205.333px",
                  paddingTop: 30,
                }}
              >
                <img
                  src={ImgsSquares}
                  alt=""
                  style={{ width: "32px", marginBottom: 15 }}
                />
                <br />
                <p
                  style={{
                    fontSize: "0.71rem",
                    letterSpacing: "2px",
                    position: "relative",
                    top: "-9px",
                    WebkitTextStroke: "0.5px white",
                  }}
                >
                  {data.Photos}
                </p>
              </button>
            </div>
          </section>

          <section style={{ display: "flex", justifyContent: "space-between" }}>
            <div
              style={{
                width: "813.25px",
                paddingLeft: "24px",
                marginTop: "10px",
              }}
            >
              <img src={Categories} alt="" />
              <div
                style={{
                  marginTop: "5px",
                  color: "white",
                  borderBottom: "1px solid #4B4B4B",
                  paddingBottom: "13px",
                }}
              >
                {data.Synopsis}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  borderBottom: "1px solid #4B4B4B",
                  lineHeight: "1",
                }}
              >
                <p
                  style={{
                    fontWeight: "bold",
                    color: "white",
                    WebkitTextStroke: "0.4px white",
                    letterSpacing: "0.2px",
                  }}
                >
                  Creators
                </p>
                <p style={{}}>{renderListWithDotSeparator(data.Creators)}</p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  borderBottom: "1px solid #4B4B4B",
                  lineHeight: "1",
                }}
              >
                <p
                  style={{
                    fontWeight: "bold",
                    color: "white",
                    WebkitTextStroke: "0.4px white",
                    letterSpacing: "0.2px",
                  }}
                >
                  Stars
                </p>
                <p style={{}}>{renderListWithDotSeparator(data.Stars)}</p>
              </div>
              <div>
                <img src={IMDBPro} alt="" />
              </div>
            </div>

            <div
              style={{
                width: "358.617px",
                height: "204px",
                display: "grid",
                alignItems: "center",
                justifyContent: "flex-start",
                position: "relative",
                top: "38px",
                left: "-24px",
                alignContent: "center",
              }}
            >
              {data.NextEpisode && (
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  paddingRight: 24,
                }}
              >
                <div
                  style={{
                    width: "4px",
                    height: "36px",
                    borderRadius: "12px",
                    backgroundColor: "#F5C518",
                    maxHeight: 36,
                  }}
                />
                
                  <div>
                    <p
                      style={{
                        fontSize: "0.71rem",
                        letterSpacing: "2px",
                        WebkitTextStroke: "0.5px white",
                        paddingLeft: 8,
                        margin: 0,
                      }}
                    >
                      NEXT EPISODE
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        letterSpacing: "1px",
                        position: "relative",
                        color: "white",
                        paddingLeft: 8,
                        margin: 0,
                      }}
                    >
                      {data.NextEpisode}
                    </p>
                  </div>
                
              </div>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  minWidth: "310.617px",
                  maxHeight: "48px",
                  backgroundColor: "#F5C518",
                  borderRadius: 50,
                  marginTop: 16,
                }}
              >
                <div
                  style={{
                    paddingRight: 10,
                    paddingLeft: 10,
                    color: "black",
                    fontSize: 24,
                  }}
                >
                  <p>+</p>
                </div>
                <div
                  style={{
                    minWidth: "275px",
                    minHeight: "48px",
                    borderRight: "2px solid #AB8A11",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "black",
                      fontWeight: 700,
                      fontFamily: "Arial, sans-serif",
                      fontSize: 14,
                      letterSpacing: 0.2,
                      marginBottom: -1.5,
                    }}
                  >
                    Add to watchlist
                  </p>
                  <p
                    style={{
                      margin: 0,
                      color: "black",
                      fontSize: 12,
                      letterSpacing: 0.2,
                    }}
                  >
                    Added by {formatNumber(data.WatchlistNumber)} users
                  </p>
                </div>
                <div
                  style={{
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <ChevronDown
                    size={20}
                    style={{ color: "black", WebkitTextStroke: "0.9px black" }}
                  />
                </div>
              </div>
              <div style={{ minWidth: "48px", marginTop: 8 }}>
                <img src={MarkedWatched} alt="" />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  color: "#5799EF",
                  marginTop: 9,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontFamily: "Arial, sans-serif",
                      textAlign: "right", // alinha o número à direita nessa largura
                      display: "inline-block",
                      fontSize: 16,
                    }}
                  >
                    {formatNumber(data.UserReviews)}
                  </span>
                  <span style={{ fontSize: "14px" }}>User reviews</span>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontFamily: "Arial, sans-serif",

                      textAlign: "right",
                      display: "inline-block",
                    }}
                  >
                    {formatNumber(data.CriticReviews)}
                  </span>
                  <span style={{ fontSize: "14px" }}>Critic reviews</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default SeriesPage;