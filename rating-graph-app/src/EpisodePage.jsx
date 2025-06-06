import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import TopRated from "./imgs/imdb/toprated.png";
import ShowCover from "./imgs/covers/toe_cover.png";
import { createGlobalStyle } from "styled-components";
import { ChevronRight, ChevronLeft } from "lucide-react";
import images from "./imageLoader.jsx";

//Navbar
import IMDBNavbar from "./imgs/imdb/imdb_navbar.png";
import UpInfo from "./imgs/imdb/upinfo.png";
import ShowPoster from "./imgs/covers/toe_cover.png";
import MostRecent from "./imgs/imdb/mostrecent.png";
import AddBtn from "./imgs/imdb/addbtn.png";
import RateEp from "./imgs/imdb/rateep.png";

import WatchOptions from "./imgs/imdb/watchoptions.png";

import Contribute from "./imgs/imdb/contribute.png";

import AddPlot from "./imgs/imdb/addaplot.png";
import AddPlot2 from "./imgs/imdb/addplot2.png";

import AsideContent from "./imgs/imdb/asidecontent.png";
import TitleShow from "./imgs/imdb/titleshow.png";

import MoreTitle from "./imgs/imdb/moretitle.png";
import Footer1 from "./imgs/imdb/footer1.png";
import Footer2 from "./imgs/imdb/footer2.png";

export default function Episodes() {
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
    fetch(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJw0CO3rwdc7Zuc_x-Gn2mx_SU15aSJDVKqij3HPAdeSJKyOys69vM8nOYOY19rJy_pV_V_S6uFWc1/pub?gid=1334662158&single=true&output=csv"
    )
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
  }, []);

  useEffect(() => {
    fetch(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJw0CO3rwdc7Zuc_x-Gn2mx_SU15aSJDVKqij3HPAdeSJKyOys69vM8nOYOY19rJy_pV_V_S6uFWc1/pub?gid=190829179&single=true&output=csv"
    )
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
              ep.Votes = ep.Votes ? ep.Votes.replace(/,/g, "") : "0";
              ep.Trend = ep.Trend ? ep.Trend.replace(/,/g, "") : "0";
              ep["Average Rating"] = ep["Average Rating"] || "0";
            });

            const grouped = {};
            const allEpisodes = [];

            results.data.forEach((ep) => {
              const season = ep.Season || "Desconhecida";
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
                ? new Date(ep.Date).getFullYear().toString()
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
                  ep["Average Rating"] &&
                  !isNaN(parseFloat(ep["Average Rating"]))
              )
              .sort((a, b) => {
                const ratingDiff =
                  parseFloat(b["Average Rating"]) -
                  parseFloat(a["Average Rating"]);
                if (ratingDiff !== 0) return ratingDiff;
                return parseInt(b.Votes || "0") - parseInt(a.Votes || "0");
              })
              .slice(0, 10);

            // Guardar identificadores dos top episódios (por temporada + título)
            const topSet = new Set(
              top10.map((ep) => `${ep.Season}-${ep.Title}`)
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
  }, []);

  useEffect(() => {
    if (!allEpisodes || allEpisodes.length === 0) return;

    const parseCustomDate = (dateStr) => {
      if (!dateStr) return null;
      return new Date(dateStr);
    };

    const now = new Date();

    const futureEpisodes = allEpisodes
      .filter((ep) => {
        const parsedDate = parseCustomDate(ep.Date);
        return parsedDate && parsedDate > now;
      })
      .sort((a, b) => parseCustomDate(a.Date) - parseCustomDate(b.Date));

    if (futureEpisodes.length > 0) {
      setNextEpisode(futureEpisodes[0]);
      console.log("Próximo episódio:", futureEpisodes[0]);
    } else {
      console.log("Nenhum episódio futuro encontrado.");
    }
  }, [allEpisodes]);

  if (!data) {
    return <p>Loading data...</p>;
  }
  if (loading) return <p>Carregando episódios...</p>;
  if (error) return <p>{error}</p>;
  if (seasonList.length === 0) return <p>Nenhuma temporada encontrada.</p>;

  const currentSeason = seasonList[currentSeasonIndex];
  const currentEpisodes = episodesBySeason[currentSeason] || [];

  // Componente para renderizar item do episódio (utilizado em Seasons e Years)
  function EpisodeItem({ episode, index }) {
    const rating = parseFloat(episode["Average Rating"]);
    const votes = parseInt(episode.Votes || "0", 10);
    const hasRating = !isNaN(rating) && !isNaN(votes) && votes > 0;
    const hasSynopsis = episode.Synopsis && episode.Synopsis.trim() !== "";
    const showWatchOptions = hasRating || hasSynopsis;
    // Estilos da imagem do cover
    const coverStyle = {
      width: "199px",
      height: "111.933px",
      objectFit: "cover",
      objectPosition: "center",
      borderRadius: "12px",
      flexShrink: 0,
      position: "relative",
      top: "-1px",
    };

    const match = episode.Title.match(/S(\d+)\.E(\d+)/i);
    const seasonNum = match ? `s${match[1]}` : "s1"; // s1, s2 etc
    const episodeNum = match ? match[2] : "1";

    const imagePath = `/imgs/show/toe/${seasonNum}/ep${episodeNum}.png`;

    function formatVotes(votes) {
      if (!votes) return "0";

      const numericVotes = Number(votes.toString().replace(/,/g, ""));
      if (isNaN(numericVotes)) return "0";

      if (numericVotes < 1000) {
        return numericVotes.toString();
      } else if (numericVotes < 10_000) {
        return (numericVotes / 1000).toFixed(1).replace(/\.0$/, "") + "K";
      } else if (numericVotes < 1_000_000) {
        return Math.round(numericVotes / 1000) + "K";
      } else {
        return (numericVotes / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
      }
    }

    const sanitizeTitle = (title) =>
      title.toLowerCase().replace(/[^a-z0-9]/gi, "-");

    return (
      <div
        className="episode-item flex items-start gap-4 p-4 border-b"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          marginLeft: "4px",
          marginBottom: "9px",
          borderBottom:
            index ===
            (activeTab === "Top-rated"
              ? topEpisodes.length - 1
              : currentEpisodes.length - 1)
              ? "none"
              : "1px solid #E0E0E0",
          marginTop: activeTab === "Top-rated" ? "18px" : "0",
        }}
      >
        {/* Imagem dinâmica baseada em pasta local */}
        <img
          src={
            hasRating || hasSynopsis
              ? episode.Image && episode.Image.startsWith("http")
                ? episode.Image
                : imagePath
              : ShowCover
          }
          alt=""
          style={{
            width: "199px",
            height: "111.933px",
            objectFit: "cover",
            objectPosition: "center",
            borderRadius: "12px",
            flexShrink: 0,
            position: "relative",
            top: "-1px",
            marginBottom: 7,
          }}
          onError={(e) => {
            e.currentTarget.src = ShowCover; // fallback para imagem padrão
          }}
        />

        <div>
          <div>
            {activeTab !== "Top-rated" &&
              topEpisodesSet.has(`${episode.Season}-${episode.Title}`) && (
                <img
                  src={TopRated}
                  alt="TopRated"
                  style={{
                    width: "152px",
                    position: "relative",
                    left: -2, // top-rated
                    top: -2,
                  }}
                />
              )}

            {activeTab === "Most Recent" &&
              topEpisodesSet.has(`${episode.Season}-${episode.Title}`) && (
                <img
                  src={MostRecent}
                  alt="MostRecent"
                  style={{
                    width: "152px",
                    position: "relative",
                    left: -1, // most recent
                    top: -2,
                  }}
                />
              )}
          </div>

          <div style={{ maxWidth: "597px", width: "597px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: "15px",
              }}
            >
              <h3
                style={{
                  color: "#212121",
                  fontWeight: "bold",
                  margin: 0,
                  paddingBottom: 0,
                  letterSpacing: 0.1,
                  fontFamily: '"HelveticaNeue", Helvetica, Arial, sans-serif',
                  fontSize: "0.96rem",
                  position: "relative",
                  left: "-1px",
                  top: "1px",
                }}
              >
                {episode.Title}
              </h3>

              <div>
                <p
                  style={{
                    margin: 0,
                    color: "#757575",
                    fontSize: "14px",
                    paddingTop: 3,
                    letterSpacing: 0.3,
                  }}
                >
                  {episode.Date}
                  <br />
                </p>
              </div>
            </div>

            {hasSynopsis ? (
              <p
                style={{
                  maxWidth: "597px",
                  marginBottom: 7,
                  letterSpacing: 0.4,
                  marginTop: 12,
                  position: "relative",
                  top: 0.02,
                }}
              >
                {episode.Synopsis}
              </p>
            ) : (
              <img
                src={AddPlot}
                alt="Add Plot"
                style={{
                  marginTop: 20,
                  height: "20px",
                }}
              />
            )}

            {hasRating && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "32px",
                  marginBottom: 9,
                }}
              >
                <div style={{ marginRight: 4, position: "relative", top: 1 }}>
                  <svg
                    width="16"
                    height="12.6"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ipc-icon ipc-icon--star-inline"
                    viewBox="0 0 24 24"
                    fill="#F5C518"
                    role="presentation"
                  >
                    <path d="M12 20.1l5.82 3.682c1.066.675 2.37-.322 2.09-1.584l-1.543-6.926 5.146-4.667c.94-.85.435-2.465-.799-2.567l-6.773-.602L13.29.89a1.38 1.38 0 0 0-2.581 0l-2.65 6.53-6.774.602C.052 8.126-.453 9.74.486 10.59l5.147 4.666-1.542 6.926c-.28 1.262 1.023 2.26 2.09 1.585L12 20.099z" />
                  </svg>
                </div>

                <div
                  style={{
                    display: "flex",
                    marginRight: 6.2,
                    position: "relative",
                    left: "-1.8px",
                    letterSpacing: 0.5,
                    top: 1,
                  }}
                >
                  <div style={{ display: "flex", marginRight: 4 }}>
                    <p style={{ color: "#757575", fontWeight: "bold" }}>
                      {rating.toFixed(1)}
                    </p>
                    <p style={{ color: "#757575" }}>/10</p>
                  </div>

                  <div style={{ marginRight: 8 }}>
                    <p style={{ color: "#757575" }}>({formatVotes(votes)})</p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={RateEp}
                      alt=""
                      style={{ maxHeight: "24px", height: "24px" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {showWatchOptions && (
              <div style={{ marginBottom: 10 }}>
                <img src={WatchOptions} alt="Watch Options" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <GlobalStyle />
      <a href="/">
        <img src={IMDBNavbar} alt="" />
      </a>
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
                href="/imdb"
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
                src={ShowPoster}
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
            <div style={{position: "relative", top: "27px", left: "3px"}}>
              <img src={TitleShow} alt=""  style={{position: "relative", top: "6px"}}/>
              <p style={{ color: "white", fontSize: "42px", margin: 0, letterSpacing: 0.2}}>Episode list</p>
            </div>
          </div>
        </section>
      </div>

      <div className="break-point" style={{ width: "100%", height: "31px" }} />
      <div style={{display: "flex", margin: "0 auto", width: "1280px"}}>
        <div>
          {/* Next Episode */}
          <div>
            <section
              style={{
                margin: "0 auto",
                width: "856px",
              }}
            >
              {nextEpisode && (
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
                        : ShowCover
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
                    <div style={{}}>
                      <h2
                        style={{
                          fontSize: "0.705rem",
                          marginBottom: "0px",
                          color: "#000000",
                          letterSpacing: "2.5px",
                          WebkitTextStroke: "0.65px #000000",
                          marginTop: 0,
                        }}
                      >
                        {nextEpisode && nextEpisode.season
                          ? `SEASON ${nextEpisode.season} PREMIERE`
                          : "NEXT EPISODE"}
                      </h2>
                    </div>
                    <div style={{ display: "flex", marginTop: 10 }}>
                      <div>
                        <img
                          src={AddBtn}
                          alt=""
                          style={{ position: "relative", top: "1px" }}
                        />
                      </div>
                      <div
                        style={{
                          marginLeft: 12,
                          position: "relative",
                          top: "-2px",
                        }}
                      >
                        <h3
                          style={{
                            color: "#212121",
                            fontWeight: "bold",
                            margin: 0,
                            paddingTop: 1,
                            paddingBottom: 2.5,
                            letterSpacing: 0.7,
                            fontFamily:
                              '"Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontSize: "0.95rem",
                            position: "relative",
                            left: "-1px",
                            top: "1px",
                          }}
                        >
                          {nextEpisode.Title}
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            color: "#7C7C7C",
                            letterSpacing: 0.5,
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
              )}
            </section>
          </div>
          <div>
            {/*Most Recent*/}
            <section
              id="recent-ep"
              style={{
                margin: "0 auto",
                width: "856px",
              }}
            >
              <div style={{ width: "808px", marginLeft: 8 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                  {(() => {
                    const now = new Date();
                    const daysAgo30 = new Date(now);
                    daysAgo30.setDate(now.getDate() - 30);

                    const allEpisodes = Object.values(episodesByYear).flat();

                    const validEpisodes = allEpisodes.filter((ep) => {
                      const rating = parseFloat(ep["Average Rating"]);
                      const votes = parseInt(ep.Votes);
                      return (
                        ep.Date &&
                        !isNaN(new Date(ep.Date)) &&
                        ep.Synopsis &&
                        ep.Synopsis.trim() !== "" &&
                        !isNaN(rating) &&
                        !isNaN(votes) &&
                        votes > 0
                      );
                    });

                    // Separar episódios recentes e top-rated
                    const recentEpisode = validEpisodes
                      .filter((ep) => new Date(ep.Date) >= daysAgo30)
                      .sort((a, b) => new Date(b.Date) - new Date(a.Date))[0];

                    const topRatedEpisodes = validEpisodes
                      .sort(
                        (a, b) =>
                          parseFloat(b["Average Rating"]) -
                          parseFloat(a["Average Rating"])
                      )
                      .filter((ep) => ep !== recentEpisode) // evita duplicar
                      .slice(0, 2);

                    let episodesToShow = [];

                    if (recentEpisode) {
                      episodesToShow.push({
                        ...recentEpisode,
                        isTopRated: false,
                      });
                      episodesToShow.push({
                        ...topRatedEpisodes[0],
                        isTopRated: true,
                      });
                    } else {
                      episodesToShow = topRatedEpisodes.map((ep) => ({
                        ...ep,
                        isTopRated: true,
                      }));
                    }

                    return episodesToShow.map((episode, index) => (
                      <div
                        key={`${episode.Season}-${episode.Title}-${index}`}
                        style={{
                          backgroundColor: "white",
                          paddingTop: "16px",
                          paddingRight: "16px",
                          paddingLeft: "16px",
                          paddingBottom: "8px",
                          borderRadius: "5px",
                          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.4)",
                          flexShrink: 0,
                          position: "relative",
                          top: "-3.5px",
                          maxHeight: "163px",
                          maxWidth: "360px",
                          width: "360px",
                          height: "163px",
                        }}
                      >
                        <div style={{ display: "flex" }}>
                          <div style={{ marginRight: "12px" }}>
                            <img
                              src={AddBtn}
                              alt=""
                              style={{ position: "relative", top: "1px" }}
                            />
                          </div>
                          <div>
                            <div style={{ height: "20px" }}>
                              <img
                                src={episode.isTopRated ? TopRated : MostRecent}
                                alt={
                                  episode.isTopRated
                                    ? "Top Rated"
                                    : "Most Recent"
                                }
                                style={{
                                  minHeight: "19px",
                                  position: "relative",
                                  left: episode.isTopRated ? "-2px" : "-1px",
                                }}
                              />
                            </div>
                            <p
                              style={{
                                marginTop: 5,
                                fontSize: "0.85rem",
                                color: "#757575",
                                letterSpacing: 0.4,
                                position: "relative",
                                top: "1px",
                              }}
                            >
                              {episode.Date}
                            </p>
                          </div>
                        </div>
                        <section>
                          <div>
                            <p
                              style={{
                                color: "#212121",
                                fontWeight: "bold",
                                margin: 0,
                                paddingTop: 1,
                                paddingBottom: 2.5,
                                letterSpacing: 0.7,
                                fontFamily:
                                  '"Helvetica Neue", Helvetica, Arial, sans-serif',
                                fontSize: "0.97rem",
                                position: "relative",
                                left: "-1px",
                                top: "1px",
                              }}
                            >
                              {episode.Title}
                            </p>
                          </div>
                          <div>
                            <p
                              style={{
                                color: "#757575",
                                fontWeight: "bold",
                                margin: 0,
                                letterSpacing: 0.5,
                              }}
                            >
                              {episode.Synopsis.length > 80
                                ? episode.Synopsis.slice(0, 80) + "..."
                                : episode.Synopsis}
                            </p>
                          </div>
                        </section>
                        <section>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              maxHeight: "32px",
                              letterSpacing: 0.5,
                            }}
                          >
                            <div
                              style={{
                                marginRight: 4,
                                position: "relative",
                                top: 1,
                              }}
                            >
                              <svg
                                width="16"
                                height="12.6"
                                xmlns="http://www.w3.org/2000/svg"
                                className="ipc-icon ipc-icon--star-inline"
                                viewBox="0 0 24 24"
                                fill="#F5C518"
                                role="presentation"
                              >
                                <path d="M12 20.1l5.82 3.682c1.066.675 2.37-.322 2.09-1.584l-1.543-6.926 5.146-4.667c.94-.85.435-2.465-.799-2.567l-6.773-.602L13.29.89a1.38 1.38 0 0 0-2.581 0l-2.65 6.53-6.774.602C.052 8.126-.453 9.74.486 10.59l5.147 4.666-1.542 6.926c-.28 1.262 1.023 2.26 2.09 1.585L12 20.099z" />
                              </svg>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                marginRight: 6.2,
                                position: "relative",
                                left: "-1px",
                                top: "1px",
                              }}
                            >
                              <p
                                style={{ color: "#757575", fontWeight: "bold" }}
                              >
                                {parseFloat(episode["Average Rating"]).toFixed(
                                  1
                                )}
                              </p>
                              <p style={{ color: "#757575" }}>/10</p>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                position: "relative",
                                top: "1px",
                              }}
                            >
                              <img
                                src={RateEp}
                                alt=""
                                style={{ maxHeight: "24px", height: "24px" }}
                              />
                            </div>
                          </div>
                        </section>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </section>
          </div>

          <div
            style={{
              padding: "20px",
              color: "#000",
              width: "856px",
              margin: "0 auto",
            }}
          >
            <section style={{ width: "856px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: "10px",
                  marginTop: "36px",
                  backgroundColor: "#FAFAFA",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  alignItems: "center", // alinha verticalmente no meio (caso a altura varie)
                  height: "auto", // só para garantir
                  width: "808px",
                  position: "relative",
                  left: 4,
                  top: 1,
                }}
              >
                {tabs.map((tab) => {
                  const isActive = tab === activeTab;
                  const isClosing = tab === closingTab;
                  return (
                    <button
                      key={tab}
                      onClick={() => handleClick(tab)}
                      className={`tab-button ${isActive ? "active" : ""} ${
                        isClosing ? `closing-${closingDirection}` : ""
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
              {activeTab === "Top-rated" && (
                <div>
                  {topEpisodes.length === 0 ? (
                    <p>Nenhum episódio top-rated encontrado.</p>
                  ) : (
                    topEpisodes.map((episode, index) => (
                      <EpisodeItem
                        key={index}
                        episode={episode}
                        index={index}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === "Seasons" && (
                <div>
                  <div
                    style={{
                      marginBottom: "20px",
                      display: "flex",
                      justifyContent: "flex-start",
                      gap: "0px",
                      width: "808px",
                      position: "relative",
                      left: "4px",
                      top: "3px",
                    }}
                  >
                    {seasonList.map((season, index) => {
                      const isActive = index === currentSeasonIndex;
                      const isHovered = index === hoveredSeasonIndex;

                      return (
                        <div
                          className="season-ball"
                          key={season}
                          onClick={() => setCurrentSeasonIndex(index)}
                          onMouseEnter={() =>
                            !isActive && setHoveredSeasonIndex(index)
                          }
                          onMouseLeave={() =>
                            !isActive && setHoveredSeasonIndex(null)
                          }
                          style={{
                            width: "48.03333px",
                            height: "48px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            backgroundColor: isActive
                              ? "#F5C518"
                              : isHovered
                              ? "#EBEBEB"
                              : "transparent",
                            color: "black",
                            fontWeight: "bold",
                            userSelect: "none",
                            letterSpacing: 0.7,
                            fontFamily:
                              '"Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontSize: "0.9rem",
                          }}
                          title={`Temporada ${season}`}
                        >
                          {season}
                        </div>
                      );
                    })}
                  </div>

                  {currentEpisodes.length === 0 && (
                    <p>Nenhum episódio encontrado.</p>
                  )}
                  {currentEpisodes.map((episode, index) => (
                    <EpisodeItem
                      key={`${episode.Season}-${episode.Episode}`}
                      episode={episode}
                      index={index}
                    />
                  ))}
                </div>
              )}

              {activeTab === "Years" && (
                <div>
                  {/* Navegação em bolinhas dos anos */}
                  <div
                    className="flex gap-2 justify-center mb-4"
                    style={{
                      marginBottom: "20px",
                      display: "flex",
                      justifyContent: "flex-start",
                      gap: "0px",
                      width: "808px",
                      position: "relative",
                      left: "4px",
                      top: "3px",
                    }}
                  >
                    {yearList.map((year, index) => {
                      const isActive = currentYearIndex === index;
                      const isHovered = hoveredYearIndex === index;

                      return (
                        <div
                          key={year}
                          onClick={() => setCurrentYearIndex(index)}
                          onMouseEnter={() =>
                            !isActive && setHoveredYearIndex(index)
                          }
                          onMouseLeave={() =>
                            !isActive && setHoveredYearIndex(null)
                          }
                          style={{
                            width: "72.133px",
                            height: "48px",
                            borderRadius: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            backgroundColor: isActive
                              ? "#F5C518"
                              : isHovered
                              ? "#EBEBEB"
                              : "transparent",
                            color: "black",
                            fontWeight: "bold",
                            userSelect: "none",
                            fontFamily:
                              '"Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontSize: "0.9rem",
                            transition: "background-color 0.2s ease",
                          }}
                          title={`Ano ${year}`}
                        >
                          {year}
                        </div>
                      );
                    })}
                  </div>

                  {/* Lista de episódios do ano selecionado */}
                  {(episodesByYear[yearList[currentYearIndex]] || []).map(
                    (episode, index) => (
                      <EpisodeItem
                        key={`${episode.Season}-${episode.Title}`}
                        episode={episode}
                        index={index}
                      />
                    )
                  )}
                </div>
              )}
              <div style={{position: "relative", left: "-20px"}}>
              <div style={{ marginTop: 29 }}>
                <img src={Contribute} alt="" />
              </div>
              <div style={{ marginTop: 1 }}>
                <img src={MoreTitle} alt="" />
              </div>
              </div>
            </section>
            <section></section>
          </div>
          </div>
          <div style={{position: "relative", top: "-7px", left: "-4px"}}>
            <img src={AsideContent} alt="" />
          </div>
      </div>
      <div style={{backgroundColor: "black", marginTop: 313}}>
        <img src={Footer1} alt="" style={{position: "relative"}}/>
        <img src={Footer2} alt=""/>
      </div>
    </div>
  );
}
