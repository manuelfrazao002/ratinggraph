import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import { createGlobalStyle } from "styled-components";
import { ChevronRight, ChevronDown, MilkIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { showCoverSrc, imgTrailerSrc } from "./ShowImageSrc";

//Navbar
import IMDBNavbar from "./imgs/imdb/imdb_navbar.png";

//Top
import UpInfo from "./imgs/imdb/upinfo.png";
import EpisodeGuide from "./imgs/imdb/episodeguide.png";

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

import { movieMap } from "./data/MovieMap";

function SeriesPage() {
  const { movieId } = useParams();
  const [data, setData] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [movies, setMovie] = useState([]);

  const urls = movieMap[movieId];

  useEffect(() => {
    if (!urls || urls.length === 0) return;

    fetch(urls[0])
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
  }, [movieId]);

  console.log("movieId da URL:", movieId);
  console.log(
    "Filmes disponíveis:",
    movies.map((m) => m.id)
  );

  if (!urls) return <p>Filme não encontrado</p>;
  if (!data) return <p>Carregando dados do filme...</p>;

  const votesNumber = Number(data.Votes?.toString().replace(/[,]+/g, "")) || 0;
  const hasVotes = votesNumber > 0;

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

  const GlobalStyle = createGlobalStyle`
  #root {
    padding: 0 !important;
    font-family: Roboto,Helvetica,Arial,sans-serif;
    background-color: #1F1F1F;
  }
`;

  function formatVotes(votes) {
    if (!votes) return "N/A";

    const num = Number(votes.toString().replace(/[, ]+/g, ""));

    if (isNaN(num)) return "N/A";

    if (num < 1000) {
      return num.toString();
    } else if (num < 10_000) {
      const k = (num / 1000).toFixed(1);
      return k.endsWith(".0") ? `${parseInt(k)}K` : `${k}K`;
    } else if (num < 1_000_000) {
      return `${Math.round(num / 1000)}K`;
    } else {
      const m = (num / 1_000_000).toFixed(1);
      return m.endsWith(".0") ? `${parseInt(m)}M` : `${m}M`;
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
      const millions = Math.ceil(cleanNum / 100_000) / 10;
      return millions.toFixed(1) + "M";
    }

    if (cleanNum >= 100_000) {
      // Agora arredondamos para o inteiro mais próximo, não só para cima
      const thousands = Math.round(cleanNum / 1_000);
      return thousands + "K";
    }

    if (cleanNum >= 1_000) {
      // Aqui mantemos uma casa decimal, arredondando para baixo (floor)
      const thousands = Math.floor((cleanNum / 1_000) * 10) / 10;
      return thousands.toString().replace(/\.0$/, "") + "K";
    }

    return cleanNum.toString();
  }

  function formatNumberWatchList(num) {
    if (!num) return "N/A";

  const cleanNum = Number(num.toString().replace(/[, ]+/g, ""));
  if (isNaN(cleanNum)) return "N/A";

  if (cleanNum >= 1_000_000) {
    const millions = Math.floor(cleanNum / 100_000) / 10;
    return millions.toFixed(1) + "M";
  }

  if (cleanNum >= 100_000) {
    const thousands = Math.floor(cleanNum / 1_000);
    return thousands + "K";
  }

  if (cleanNum >= 1_000) {
    const thousands = Math.floor((cleanNum / 100)); // Get 1 decimal without rounding
    return (thousands / 10).toFixed(1) + "K";
  }

  return cleanNum.toString();
}

  const userReviewsNumber =
    Number(data.UserReviews?.toString().replace(/[,]+/g, "")) || 0;
  const criticReviewsNumber =
    Number(data.CriticReviews?.toString().replace(/[,]+/g, "")) || 0;
  const metascoreReviewsNumber =
    Number(data.Metascore?.toString().replace(/[,]+/g, "")) || 0;
  const isMovie = data.Type === "Movie";
  const isTVShow = data.Type === "TVSeries" || data.Type === "TV Mini Series";

  return (
    <>
      <GlobalStyle />
      <div>
        {isTVShow && 
        <Link to={`/`}>
          <img src={IMDBNavbar} alt="Rating Graph" />
        </Link>
        }
        {isMovie && 
        <Link to={`/ratinggraph/${movieId}`}>
          <img src={IMDBNavbar} alt="Rating Graph" />
        </Link>
        }
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
            {/* Only show the Episode Guide link for TV Series */}
            {data.Type === "TV Series" && (
              <Link to={`/episodepage/${movieId}`}>
                <div
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    textDecoration: "none",
                    transition: "background-color 0.2s ease",
                  }}
                >
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
                      style={{
                        fontSize: 14,
                        color: "#C0C0C0",
                        marginRight: "6px",
                      }}
                    >
                      {data.Episodes}
                    </p>
                    <ChevronRight
                      size={20}
                      style={{
                        color: isHovered ? "#F5C518" : "white",
                        transition: "color 0.2s ease",
                      }}
                    />
                  </div>
                </div>
              </Link>
            )}

            {/* The UpInfo image always shows, regardless of type */}
            <img
              src={UpInfo}
              alt="Up Info"
              style={{
                height: 48,
                marginLeft: "auto", // Ensures it stays right-aligned
                marginTop: 1,
              }}
            />
          </div>
          {data.Type === "Movie" && (
            <div style={{ width: "12px", height: "2px" }}></div>
          )}

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
                  fontWeight: "normal",
                  fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                  marginTop: -13,
                  marginBottom: 0,
                  height: 58,
                  fontSize: "48px",
                  position: "relative",
                  top: "3px",
                }}
              >
                {data.Title}
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
                  display: "flex",
                }}
              >
                {!isMovie && (
                  <>
                    {data.Type}
                    <span style={{ fontWeight: "bold", margin: "0 7px" }}>
                      ·
                    </span>
                  </>
                )}
                {data.BeginingYear}
                {data.Type === "TVSeries" && `—${data.EndingYear || ""}`}
                <span style={{ fontWeight: "bold", margin: "0 7px" }}>·</span>
                {data.AgeRating}
                {!isMovie && (
                  <>
                    {hasVotes && (
                      <div>
                        <span style={{ fontWeight: "bold", margin: "0 7px" }}>
                          ·
                        </span>
                        {data.EpDuration}
                      </div>
                    )}
                  </>
                )}
                {!isTVShow && (
                  <>
                    <div>
                      <span style={{ fontWeight: "bold", margin: "0 7px" }}>
                        ·
                      </span>
                      {data.MovieDuration}
                    </div>
                  </>
                )}
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
              {hasVotes && (
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
                            letterSpacing: "0.5px",
                            position: "relative",
                            top: "1px",
                            left: "-1px",
                            fontWeight: "bold",
                          }}
                        >
                          {data.Rating}
                        </span>
                        <span
                          style={{
                            color: "#BCBCBC",
                            fontSize: 15,
                            WebkitTextStroke: "0.1px #BCBCBC",
                            letterSpacing: "0.5px",
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
              )}
              {hasVotes && (
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
              )}

              <div style={{ marginRight: "5px" }}>
                <img
                  src={Popularity}
                  alt=""
                  style={{
                    display: "flex",
                    margin: "0 auto",
                    paddingBottom: "8px",
                    alignContent: "center",
                    position: "relative",
                    top: "1px",
                  }}
                />
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
                      letterSpacing: "1.5px",
                      position: "relative",
                      top: "1px",
                      fontWeight: "bold",
                      color: "white",
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
                        WebkitTextStroke: "0.18px #A4AAB5",
                        letterSpacing: "0.5px",
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
                src={showCoverSrc[movieId]}
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
                src={imgTrailerSrc[movieId]}
                alt=""
                style={{
                  width: "737.2px",
                  height: "414.667px",
                  objectFit: "cover",
                  borderRadius: 12,
                  display: "block",
                  objectPosition: "12% 12%",
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
                      top: "4px",
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
                        position: "relative",
                        top: "-1px",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="150"
                        height="150"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        role="presentation"
                        style={{ transform: "rotate(-90deg)" }}
                      >
                        <path fill="none" d="M0 0h24v24H0V0z"></path>
                        <path d="M8.71 11.71l2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71z" />
                      </svg>
                    </div>

                    {/* Texto ao lado */}
                    <span
                      style={{
                        color: "white",
                        fontSize: 24,
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
                      {data.trailerDuration}
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
                  fontWeight: "",
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
                  {data.Videos}
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
                  fontWeight: "",
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

          <section
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "813.25px",
                paddingLeft: "24px",
                marginTop: "10px",
              }}
            >
              <div style={{
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  margin: "0px 0 12px 0"
}}>
  {(data?.Genres
    ? // Primeiro dividimos por vírgula que não esteja dentro de um termo
      data.Genres.split(/(?<!\,\s)\,(?!\s\,)/)
      .map(genre => genre.trim())
      .filter(genre => genre)
    : []).map((genre, index) => (
      <div 
        key={index}
        style={{
          border: "1px solid #6F6F68",
          borderRadius: "20px",
          padding: "3px 12px",
          margin: "4px 8px 4px 0",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
          transition: "all 0.2s ease",
          cursor: "pointer",
          ":hover": {
            borderColor: "#F5C518",
            backgroundColor: "rgba(245, 197, 24, 0.1)",
            boxShadow: "0 0 0 1px #F5C518"
          }
        }}
      >
        <span style={{
          color: "white",
          fontSize: "0.9rem",
          fontWeight: 400,
          letterSpacing: "0.03px",
          whiteSpace: "nowrap",
          transition: "color 0.2s ease",
          ":hover": {
            color: "#F5C518"
          }
        }}>
          {genre}
        </span>
      </div>
    ))}
</div>
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
                    letterSpacing: "0.2px",
                  }}
                >
                  Creators
                </p>
                <p style={{}}>{renderListWithDotSeparator(data.Creators)}</p>
              </div>
              {!isTVShow && (
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
                      letterSpacing: "0.2px",
                    }}
                  >
                    Writers
                  </p>
                  <p style={{}}>{renderListWithDotSeparator(data.Writers)}</p>
                </div>
              )}
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
                left: "-24px",
                alignContent: "center",
              }}
            >
              {data.Type === "TV Series" && data.NextEpisode?.trim() ? (
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    paddingRight: 24,
                    marginBottom: 16,
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
                      {Number(data.NextEpisodeSeason) === 1 &&
                      Number(data.NextEpisodeNumber) === 1
                        ? "SERIES PREMIERE"
                        : Number(data.NextEpisodeNumber) === 1
                        ? `SEASON ${Number(data.NextEpisodeSeason)} PREMIERE`
                        : "NEXT EPISODE"}
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
              ) : data.Type === "Movie" && data.NextEpisode ? (
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    paddingRight: 24,
                    marginBottom: 16,
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
                      COMING SOON
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
                      Releases {data.NextEpisode}
                    </p>
                  </div>
                </div>
              ) : null}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  minWidth: "310.617px",
                  maxHeight: "48px",
                  backgroundColor: "#F5C518",
                  borderRadius: 50,
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
                    Added by {formatNumberWatchList(data.WatchlistNumber)} users
                  </p>
                </div>
                <div
                  style={{
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "center",
                    width: "48px"
                  }}
                >
                  <ChevronDown
                    size={20}
                    style={{ color: "black", WebkitTextStroke: "0.9px black" }}
                  />
                </div>
              </div>
              {hasVotes && (
              <div style={{ minWidth: "48px", marginTop: 8 }}>
                <img src={MarkedWatched} alt="" />
              </div> )}
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  color: "#5799EF",
                  marginTop: 12,
                  flexWrap: "wrap",
                }}
              >
                {hasVotes && userReviewsNumber > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontFamily: "Arial, sans-serif",
                        textAlign: "right",
                        display: "inline-block",
                        fontSize: 16,
                      }}
                    >
                      {formatNumber(userReviewsNumber)}
                    </span>
                    <span style={{ fontSize: "14px" }}>User reviews</span>
                  </div>
                )}

                {hasVotes && criticReviewsNumber > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontFamily: "Arial, sans-serif",
                        textAlign: "right",
                        display: "inline-block",
                      }}
                    >
                      {formatNumber(criticReviewsNumber)}
                    </span>
                    <span style={{ fontSize: "14px" }}>Critic reviews</span>
                  </div>
                )}

                {!isTVShow && (
                  <>
                    {hasVotes && criticReviewsNumber > 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            backgroundColor:
                              Number(data.Metascore) >= 61
                                ? "#54A72A"
                                : Number(data.Metascore) >= 40
                                ? "#ffcc33"
                                : "#ff0000",
                            color: "white",
                            padding: "2px 2px",
                            width: "18.1px",
                            height: "20px",
                            fontWeight: 700,
                            fontFamily: "Arial, sans-serif",
                            textAlign: "center",
                            display: "flex", // Changed to flex
                            alignItems: "center", // Vertical centering
                            justifyContent: "center", // Horizontal centering
                            lineHeight: 1,
                          }}
                        >
                          {formatNumber(metascoreReviewsNumber)}
                        </span>
                        <span style={{ fontSize: "14px" }}>Metascore</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default SeriesPage;
