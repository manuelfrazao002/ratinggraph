import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import TopRated from "./imgs/imdb/toprated.png";
import { createGlobalStyle } from "styled-components";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { movieMap } from "./data/MovieMap";
import { useParams } from "react-router-dom";
import { getShowCoverSrc, getEpisodeSrc } from "./ShowImageSrc";
import { Link } from "react-router-dom";
import "../src/Styles.css";

//Navbar
import IMDBNavbar from "./imgs/imdb/imdb_navbar.png";
import UpInfo from "./imgs/imdb/upinfo.png";

import AsideContent from "./imgs/imdb/asidecontent.png";

import Footer1 from "./imgs/imdb/footer1.png";
import Footer2 from "./imgs/imdb/footer2.png";

import RatingByCountry from "./imgs/imdb/ratingsbycountry.png";
import RatingsBarChart from "./components/VerticalRatingsBarChart.jsx";
import RatingsHeatmap from "./components/RatingsHeatMap.jsx";

import MoreFromThisTitle from "./imgs/imdb/morefromthistitle.png";

export default function Episodes() {
  const { movieId, episodeId } = useParams();
  const [episodesBySeason, setEpisodesBySeason] = useState({});
  const [seasonList, setSeasonList] = useState([]);
  const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topEpisodesSet, setTopEpisodesSet] = useState(new Set());

  const [hoveredSeasonIndex, setHoveredSeasonIndex] = React.useState(null);

  const tabs = ["Seasons", "Years", "Top-rated"];
  const [activeTab, setActiveTab] = React.useState("Seasons");
  const [closingTab, setClosingTab] = React.useState(null);
  const [closingDirection, setClosingDirection] = React.useState(null); // "left" ou "right"

  const [yearList, setYearList] = useState([]);
  const [episodesByYear, setEpisodesByYear] = useState({});
  const [currentYearIndex, setCurrentYearIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [data, setData] = useState(null);
  const [firstRow, setFirstRow] = useState(null);
  const [hoveredYearIndex, setHoveredYearIndex] = useState(null);
  const [topEpisodes, setTopEpisodes] = useState([]); // array de episódios top-rated
  const [otherEpisodes, setOtherEpisodes] = useState([]); // para outras abas
  const [nextEpisode, setNextEpisode] = useState(null);
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [coverSrc, setCoverSrc] = useState("");

  // Load cover image dynamically
  useEffect(() => {
    const loadCover = async () => {
      if (movieId) {
        const cover = await getShowCoverSrc(movieId);
        setCoverSrc(cover);
      }
    };
    loadCover();
  }, [movieId]);

  const handleClick = (tab) => {
    if (tab !== activeTab) {
      const oldIndex = tabs.indexOf(activeTab);
      const newIndex = tabs.indexOf(tab);
      const direction = newIndex > oldIndex ? "left" : "right";

      setClosingTab(activeTab);
      setClosingDirection(direction);
      setActiveTab(tab);

      setTimeout(() => {
        setClosingTab(null);
        setClosingDirection(null);
      }, 300);
    }
  };

  const GlobalStyle = createGlobalStyle`
    #root {
      padding: 0 !important;
      font-family: Roboto,Helvetica,Arial,sans-serif;
      background-color: white;
    }
  `;

  useEffect(() => {
    document.body.style.backgroundColor = "white";
  }, []);

  useEffect(() => {
    if (!movieId || !movieMap[movieId]) {
      console.error("movieId inválido");
      return;
    }

    const urls = movieMap[movieId];
    fetch(urls[0])
      .then((res) => res.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          complete: (results) => {
            const data = results.data;
            console.log("Dados carregados:", data);
            setData(data);
            setFirstRow(data[0]);

            // Pegando o primeiro valor (primeira linha do CSV)
            const firstRow = data[0];
            console.log("Primeiro valor:", firstRow);

            // Exemplo: acessar um campo específico
            // console.log("Primeiro título:", firstRow.Title);
          },
          error: (err) => console.error("Erro ao carregar CSV", err),
        });
      });
  }, [movieId]);

  useEffect(() => {
    if (!movieId || !movieMap[movieId]) {
      console.error("movieId inválido");
      return;
    }

    const parseCustomDate = (dateStr) => {
      if (!dateStr) return null;

      // Se for apenas ano (YYYY)
      if (/^\d{4}$/.test(dateStr.trim())) {
        return new Date(`${dateStr}-12-31`);
      }

      const d = new Date(dateStr);
      return isNaN(d) ? null : d;
    };

    const urls = movieMap[movieId];

    fetch(urls[1])
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text();
      })
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log(results.data);

            results.data.forEach((ep) => {
              // Remove vírgulas e converte para número, se possível
              ep.Votes2 = ep.Votes2 ? ep.Votes2.replace(/,/g, "") : "0";
              ep.Trend = ep.Trend ? ep.Trend.replace(/,/g, "") : "0";
              ep["Average Rating 2"] = ep["Average Rating 2"] || "0";
            });

            const grouped = {};
            const allEpisodes = [];

            results.data.forEach((ep) => {
              const seasonNumber = parseInt(ep.Season);

              // Ignora episódios sem Season válida (ex: "", null, undefined, NaN)
              if (!ep.Season || isNaN(seasonNumber)) {
                return; // simplesmente salta este episódio
              }

              const season = seasonNumber.toString();

              if (!grouped[season]) grouped[season] = [];
              grouped[season].push(ep);
              allEpisodes.push(ep);
            });

            const seasons = Object.keys(grouped).sort((a, b) => a - b);
            setSeasonList(seasons);
            setEpisodesBySeason(grouped);
            setAllEpisodes(allEpisodes);

            // Agrupar por ano
            const groupedByYear = {};
            allEpisodes.forEach((ep) => {
              const year = ep.Date
                ? (parseCustomDate(ep.Date)?.getFullYear().toString() ??
                  "Desconhecido")
                : "Desconhecido";
              if (!groupedByYear[year]) groupedByYear[year] = [];
              groupedByYear[year].push(ep);
            });
            const years = Object.keys(groupedByYear).sort((a, b) => a - b); // Anos crescentes

            setYearList(years);
            setEpisodesByYear(groupedByYear);

            // Calcular os top 10 episódios
            const top10 = allEpisodes
              .filter(
                (ep) =>
                  ep["Average Rating 2"] &&
                  !isNaN(parseFloat(ep["Average Rating 2"])),
              )
              .sort((a, b) => {
                const ratingDiff =
                  parseFloat(b["Average Rating 2"]) -
                  parseFloat(a["Average Rating 2"]);
                if (ratingDiff !== 0) return ratingDiff;
                return parseInt(b.Votes2 || "0") - parseInt(a.Votes2 || "0");
              })
              .slice(0, 10);

            // Guardar identificadores dos top episódios (por temporada + título)
            const topSet = new Set(
              top10.map((ep) => `${ep.Season}-${ep.Title}`),
            );
            setTopEpisodesSet(topSet);
            setTopEpisodes(top10);

            setLoading(false);
          },
          error: (err) => {
            setError("Erro no parsing do CSV");
            console.error("Erro PapaParse:", err);
            setLoading(false);
          },
        });
      })
      .catch((err) => {
        setError("Erro ao buscar dados");
        console.error("Erro fetch:", err);
        setLoading(false);
      });
  }, [movieId]);

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

  const ratingsBreakdown = React.useMemo(() => {
    if (!firstRow) return null;

    const result = {};

    Object.keys(firstRow).forEach((key) => {
      const trimmedKey = key.trim();

      // só aceita "1" até "10"
      if (/^(10|[1-9])$/.test(trimmedKey)) {
        const value = Number(String(firstRow[key]).replace(/[^\d]/g, ""));

        result[trimmedKey] = isNaN(value) ? 0 : value;
      }
    });

    // garante que todos existem
    for (let i = 1; i <= 10; i++) {
      if (!(i in result)) result[i] = 0;
    }

    return result;
  }, [firstRow]);

  if (!movieId) return <p>Filme não especificado.</p>;
  if (!movieMap[movieId]) return <p>Filme não encontrado.</p>;

  useEffect(() => {
    if (!allEpisodes || allEpisodes.length === 0) return;

    const parseCustomDate = (dateStr) => {
      if (!dateStr) return null;

      // Se for apenas ano (YYYY)
      if (/^\d{4}$/.test(dateStr.trim())) {
        return new Date(`${dateStr}-12-31`);
      }

      const d = new Date(dateStr);
      return isNaN(d) ? null : d;
    };

    const now = new Date();

    const futureEpisodes = allEpisodes
      .map((ep) => ({
        ...ep,
        parsedDate: parseCustomDate(ep.Date),
      }))
      .filter((ep) => ep.parsedDate && ep.parsedDate > now)
      .sort((a, b) => a.parsedDate - b.parsedDate);

    if (futureEpisodes.length > 0) {
      setNextEpisode(futureEpisodes[0]);
      console.log("Próximo episódio:", futureEpisodes[0]);
    } else {
      console.log("Nenhum episódio futuro encontrado.");
    }
  }, [allEpisodes]);

  const goPrevSeason = () => {
    if (currentSeasonIndex > 0) {
      setCurrentSeasonIndex((prev) => prev - 1);
    }
  };

  const goNextSeason = () => {
    if (currentSeasonIndex < seasonList.length - 1) {
      setCurrentSeasonIndex((prev) => prev + 1);
    }
  };

  const goPrevYear = () => {
    if (currentYearIndex > 0) {
      setCurrentYearIndex((prev) => prev - 1);
    }
  };

  const goNextYear = () => {
    if (currentYearIndex < yearList.length - 1) {
      setCurrentYearIndex((prev) => prev + 1);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentSeasonIndex, currentYearIndex]);

  if (!data) {
    return <p>Loading data...</p>;
  }
  if (loading) return <p>Carregando episódios...</p>;
  if (error) return <p>{error}</p>;
  if (seasonList.length === 0) return <p>Nenhuma temporada encontrada.</p>;

  const currentSeason = seasonList[currentSeasonIndex];
  const currentEpisodes = episodesBySeason[currentSeason] || [];

  function formatRating(rating) {
    if (rating === 10) {
      return "10";
    } else {
      return rating.toFixed(1);
    }
  }

  const heatmapData = seasonList.map((season) => {
    const episodes = episodesBySeason[season] || [];

    return {
      season,
      episodes: episodes.map((ep) => {
        const rating = parseFloat(ep["Average Rating 2"]);
        return isNaN(rating) ? "-" : rating;
      }),
    };
  });

  return (
    <div>
      <GlobalStyle />
      <Link to={`/imdb/list`}>
        <img src={IMDBNavbar} alt="" />
      </Link>
      <div
        style={{
          maxHeight: "224.967px",
          backgroundColor: "#1F1F1F",
          paddingBottom: 13.2,
        }}
      >
        <section
          style={{
            paddingTop: 8,
            paddingLeft: 24,
            paddingRight: 24,
            paddingBottom: 24,
            marginTop: -20,
          }}
        >
          <div
            style={{
              width: "1280px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
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
              <a
                href={`/imdb/${movieId}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  paddingLeft: 17,
                  position: "relative",
                  top: 10.4,
                  left: -1,
                }}
              >
                <ChevronLeft
                  size={26.5}
                  style={{
                    color: isHovered ? "#F5C518" : "white",
                    transition: "color 0.2s ease",
                  }}
                />
                <p
                  style={{
                    color: "white",
                    letterSpacing: 0.3,
                    position: "relative",
                    fontSize: "0.97rem",
                  }}
                >
                  Back
                </p>
              </a>
            </div>
            <div style={{ position: "relative", top: "12px", left: "-36px" }}>
              <img src={UpInfo} alt="" style={{ height: 48, marginTop: 1 }} />
            </div>
          </div>
          <div
            style={{
              width: "1280px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
              paddingTop: 20,
            }}
          >
            <div style={{ paddingLeft: 23, position: "relative", top: "-1px" }}>
              <img
                src={coverSrc}
                alt=""
                loading="lazy"
                style={{
                  width: "87.15px",
                  height: "128.967px",
                  objectFit: "cover",
                  borderRadius: 12,
                  display: "block",
                }}
              />
            </div>
            <div style={{ position: "relative", top: "26px", left: "3px" }}>
              <p
                style={{
                  fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  letterSpacing: "0.0125em",
                  lineHeight: "1.5rem",
                  margin: "0 0 8px 0",
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                {firstRow.Title}
              </p>
              <p
                style={{
                  color: "white",
                  fontSize: "3rem",
                  fontWeight: "400",
                  lineHeight: "3.125rem",
                  letterSpacing: "normal",
                  fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                  margin: 0,
                }}
              >
                Ratings
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="break-point" style={{ width: "100%", height: "31px" }} />
      <div style={{ display: "flex", margin: "0 auto", width: "1280px" }}>
        <section
          style={{
            padding: "0 24px 24px 24px",
            width: "856px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "4px",
                height: "28.8px",
                borderRadius: "12px",
                backgroundColor: "rgb(245, 197, 24)",
                maxHeight: "28.8px",
              }}
            />
            <div>
              <h3
                style={{
                  padding: "0 0 0 8px",
                  margin: 0,
                  fontSize: "1.5rem",
                  fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                  letterSpacing: "normal",
                  lineHeight: "1.2em",
                  fontWeight: "600",
                  color: "rgba(0, 0, 0, 0.87)",
                }}
              >
                IMDb rating
              </h3>
            </div>
          </div>
          <div
            style={{
              marginBottom: "1.9rem",
              color: "rgba(0,0,0, 0.54)",
              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
              fontSize: "1rem",
              fontWeight: "400",
              letterSpacing: "0.03125em",
              lineHeight: "1.5rem",
            }}
          >
            <p
              style={{
                margin: 0,
              }}
            >
              The IMDb rating is weighted to help keep it reliable.{" "}
              <span
                style={{
                  color: "#0e63be",
                }}
              >
                Learn more
              </span>
            </p>
          </div>
          <div
            style={{
              display: "flex",
              marginBottom: "4rem",
            }}
          >
            <div
              style={{
                marginRight: "0.5rem",
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                marginRight: "1.5rem",
              }}
            >
              <span
                style={{
                  fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  letterSpacing: "0.16667em",
                  lineHeight: "1rem",
                  color: "rgb(0,0,0)",
                  marginBottom: "0.4rem",
                }}
              >
                IMDb RATING
              </span>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <svg
                  style={{
                    marginRight: "0.25rem",
                    color: "rgb(245,197,24)",
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  class="ipc-icon ipc-icon--star sc-a30a09c4-4 cUiqql"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  role="presentation"
                >
                  <path d="M12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z"></path>
                </svg>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    top: "-3px",
                    paddingRight: "0.25rem",
                  }}
                >
                  <div
                    style={{
                      lineHeight: "1.5rem",
                      marginBottom: "-0.125rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.25rem",
                        letterSpacing: "0.0125em",
                        fontWeight: "600",
                        fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                        paddingRight: "0.125rem",
                        lineHeight: "1.5rem",
                        color: "rgb(0,0,0)",
                      }}
                    >
                      {firstRow.Rating}
                    </span>
                    <span
                      style={{
                        color: "rgba(0,0,0,0.54)",
                        fontSize: "1rem",
                        fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                        fontWeight: "500",
                        letterSpacing: "0.03125em",
                        lineHeight: "1.5rem",
                        position: "relative",
                        top: "1px",
                      }}
                    >
                      /10
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(0,0,0,0.54)",
                      position: "relative",
                      letterSpacing: "0.03333em",
                      lineHeight: "1rem",
                      fontWeight: "400",
                      WebkitTextStroke: "0.1px #BCBCBC",
                      fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                    }}
                  >
                    {formatVotes(firstRow.Votes) || "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div
              style={{
                marginRight: "0.5rem",
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                marginRight: "1.5rem",
              }}
            >
              <span
                style={{
                  fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  letterSpacing: "0.16667em",
                  lineHeight: "1rem",
                  color: "rgb(0,0,0)",
                  marginBottom: "0.4rem",
                }}
              >
                YOUR RATING
              </span>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  position: "relative",
                  alignItems: "center",
                  padding: "0 1rem",
                }}
              >
                <svg
                  style={{
                    color: "rgb(14, 99, 190)",
                    marginRight: "0.25rem",
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  class="ipc-icon ipc-icon--star-border sc-6f2d6e27-4 cVdzMQ"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  role="presentation"
                >
                  <path fill="none" d="M0 0h24v24H0V0z"></path>
                  <path d="M19.65 9.04l-4.84-.42-1.89-4.45c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5 4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.73 3.67-3.18c.67-.58.32-1.68-.56-1.75zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"></path>
                </svg>
                <span
                  style={{
                    color: "rgb(14, 99, 190)",
                    lineHeight: "1.5rem",
                    fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                    fontSize: "1.25rem",
                    letterSpacing: "0.0125em",
                    fontWeight: "600",
                  }}
                >
                  Rate
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "4px",
                height: "28.8px",
                borderRadius: "12px",
                backgroundColor: "rgb(245, 197, 24)",
                maxHeight: "28.8px",
              }}
            />
            <div>
              <h3
                style={{
                  padding: "0 0 0 8px",
                  margin: 0,
                  fontSize: "1.5rem",
                  fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                  letterSpacing: "normal",
                  lineHeight: "1.2em",
                  fontWeight: "600",
                  color: "rgba(0, 0, 0, 0.87)",
                }}
              >
                User ratings
              </h3>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                fontSize: "0.75rem",
                fontWeight: "600",
                letterSpacing: "0.16667em",
                lineHeight: "1rem",
                marginBottom: "0.25rem",
              }}
            >
              FILTER BY COUNTRY
            </span>
            <span
              style={{
                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                fontSize: "0.75rem",
                fontWeight: "400",
                letterSpacing: "0.03333em",
                lineHeight: "1rem",
                marginBottom: "0.75rem",
                color: "rgba(0,0,0,0.54)",
              }}
            >
              Countries with the most ratings
            </span>
          </div>
          <div style={{
            marginBottom:"1rem",
          }}>
            <img src={RatingByCountry} alt="" />
          </div>

          <div
            style={{
              marginBottom: "0.5rem",
            }}
          >
            {ratingsBreakdown && <RatingsBarChart ratings={ratingsBreakdown} />}
          </div>
          <span
            style={{
              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
              fontSize: "0.875rem",
              fontWeight: "400",
              letterSpacing: "0.01786em",
              lineHeight: "1.25rem",              
            }}
          >
            {firstRow.UnweightMean} Unweighted mean
          </span>
          <div style={{
            marginTop:"4rem",
            marginBottom:"4rem",
          }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  width: "4px",
                  height: "28.8px",
                  borderRadius: "12px",
                  backgroundColor: "rgb(245, 197, 24)",
                  maxHeight: "28.8px",
                }}
              />
              <div>
                <Link
                  to={`/episodepage/${movieId}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "black",
                    cursor: "pointer",
                  }}
                >
                  <h3
                    style={{
                      padding: "0 0 0 10px",
                      margin: 0,
                      fontSize: "1.5rem",
                      fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                      letterSpacing: "normal",
                      lineHeight: "1.2em",
                      fontWeight: "600",
                    }}
                  >
                    Ratings by episode
                  </h3>
                  <span
                    style={{
                      paddingLeft: "12px",
                      color: "rgb(0,0,0,.54)",
                      fontSize: "0.875rem",
                      fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                      fontWeight: "400",
                      alignSelf: "center",
                      letterSpacing: "0.01786em",
                      lineHeight: "unset",
                      marginRight: "2px",
                    }}
                  >
                    {firstRow.Episodes}
                  </span>
                  <svg
                    width="19.2"
                    height="19.2"
                    xmlns="http://www.w3.org/2000/svg"
                    class="ipc-icon ipc-icon--chevron-right-inline ipc-icon--inline ipc-title-link ipc-title-link-chevron"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    role="presentation"
                    style={{
                      color: "rgba(0,0,0)",
                    }}
                  >
                    <path
                      className="chevRight"
                      d="M5.622.631A2.153 2.153 0 0 0 5 2.147c0 .568.224 1.113.622 1.515l8.249 8.34-8.25 8.34a2.16 2.16 0 0 0-.548 2.07c.196.74.768 1.317 1.499 1.515a2.104 2.104 0 0 0 2.048-.555l9.758-9.866a2.153 2.153 0 0 0 0-3.03L8.62.61C7.812-.207 6.45-.207 5.622.63z"
                    ></path>
                  </svg>
                </Link>
              </div>
            </div>
            <div style={{ marginTop: "16px" }}>
              <RatingsHeatmap data={heatmapData} />
            </div>
          </div>
          <div>
            <img
              src={MoreFromThisTitle}
              alt=""
              style={{
                marginLeft: "-24px",
              }}
            />
          </div>
        </section>
        <div style={{ position: "relative", top: "-7px", left: "-4px" }}>
          <img src={AsideContent} alt="" />
        </div>
      </div>
      <div style={{ backgroundColor: "black", marginTop: 313 }}>
        <img src={Footer1} alt="" style={{ position: "relative" }} />
        <img src={Footer2} alt="" />
      </div>
    </div>
  );
}
