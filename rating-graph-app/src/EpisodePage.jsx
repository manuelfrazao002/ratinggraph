import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import TopRated from "./imgs/imdb/toprated.png";
import { createGlobalStyle } from "styled-components";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { movieMap } from "./data/MovieMap";
import { useParams } from "react-router-dom";
import { getShowCoverSrc, getEpisodeSrc } from "./ShowImageSrc";
import { Link } from "react-router-dom";

//Navbar
import IMDBNavbar from "./imgs/imdb/imdb_navbar.png";
import UpInfo from "./imgs/imdb/upinfo.png";
import MostRecent from "./imgs/imdb/mostrecent.png";
import AddBtn from "./imgs/imdb/addbtn.png";
import RateEp from "./imgs/imdb/rateep.png";

import WatchOptions from "./imgs/imdb/watchoptions.png";

import Contribute from "./imgs/imdb/contribute.png";

import AddPlot from "./imgs/imdb/addaplot.png";
import AddPlot2 from "./imgs/imdb/addplot2.png";

import AsideContent from "./imgs/imdb/asidecontent.png";

import MoreTitle from "./imgs/imdb/moretitle.png";
import Footer1 from "./imgs/imdb/footer1.png";
import Footer2 from "./imgs/imdb/footer2.png";

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

  if (!movieId) return <p>Filme não especificado.</p>;
  if (!movieMap[movieId]) return <p>Filme não encontrado.</p>;

  useEffect(() => {
    if (!allEpisodes || allEpisodes.length === 0) return;

    const parseCustomDate = (dateStr) => {
      if (!dateStr) return null;
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

  // Componente para renderizar item do episódio (utilizado em Seasons e Years)
  function EpisodeItem({ episode, index, isLast }) {
    const [isEllipsisHover, setIsEllipsisHover] = React.useState(false);
    const synopsisRef = React.useRef(null);
    const [isOverflowing, setIsOverflowing] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false);
    const rating = parseFloat(episode["Average Rating 2"]);
    const votes = parseInt(episode.Votes2 || "0", 10);
    const hasRating = !isNaN(rating) && !isNaN(votes) && votes > 0;
    const hasSynopsis =
      typeof episode.Synopsis === "string" && episode.Synopsis.trim() !== "";
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

    const [imagePath, setImagePath] = useState("");

    useEffect(() => {
      const loadImage = async () => {
        const src = await getEpisodeSrc(movieId, seasonNum, episodeNum);
        setImagePath(src);
      };
      loadImage();
    }, [movieId, seasonNum, episodeNum]);

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

    const episodeList =
      activeTab === "Top-rated" ? topEpisodes : currentEpisodes;
    const isLastEpisode =
      episodeList.length === 1 || index === episodeList.length - 1;

    React.useEffect(() => {
      if (synopsisRef.current) {
        const { scrollHeight, clientHeight } = synopsisRef.current;
        setIsOverflowing(scrollHeight > clientHeight);
      }
    }, [episode.Synopsis]);

    return (
      <div
        className="episode-item flex items-start gap-4 p-4"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          marginLeft: "4px",
          marginBottom: "9px",
          borderBottom: isLast ? "none" : "1px solid #E0E0E0",
          marginTop: activeTab === "Top-rated" ? "18px" : "0",
        }}
      >
        {/* Imagem dinâmica baseada em pasta local */}
        <img
          src={
            hasRating || hasSynopsis
              ? episode.Image && episode.Image.startsWith("http")
                ? episode.Image
                : imagePath || coverSrc
              : coverSrc
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
            e.currentTarget.src = coverSrc; // fallback para imagem padrão
          }}
        />

        <div>
          <div>
            {activeTab !== "Top-rated" &&
              topEpisodesSet.has(`${episode.Season}-${episode.Title}`) &&
              (hasRating || hasSynopsis || Number(votes) > 0) && (
                <img
                  src={TopRated}
                  alt="TopRated"
                  style={{
                    width: "152px",
                    position: "relative",
                    left: -2,
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
              <Link
                key={episode.episodeId}
                to={`/episodepage/${movieId}/${episode.episodeId}`}
              >
                <h3
                  style={{
                    color: "#212121",
                    fontWeight: "",
                    margin: 0,
                    paddingBottom: 0,
                    letterSpacing: "0.00937em",
                    fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                    fontSize: "1rem",
                    position: "relative",
                    left: "-1px",
                    top: "1px",
                    lineHeight: "1.25rem",
                  }}
                >
                  {activeTab === "Top-rated"
                    ? `#${episode.positionNumber} · ${episode.Title}`
                    : episode.Title}
                </h3>
              </Link>
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
              <div style={{ position: "relative" }}>
                {/* SINOPSE (inalterada) */}
                <p
                  ref={synopsisRef}
                  style={{
                    maxWidth: "597px",
                    marginBottom: 7,
                    letterSpacing: "0.03125em",
                    marginTop: 12,
                    position: "relative",
                    fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                    lineHeight: "1.5rem",
                    overflow: "hidden",
                    maxHeight: isExpanded ? "fit-content" : "9rem",
                  }}
                >
                  {episode.Synopsis}
                </p>

                {/* OVERLAY IMDb-style */}
                {isOverflowing && !isExpanded && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0, // alinha com o topo da sinopse
                      left: 0,
                      display: "flex",
                      alignItems: "end",
                      pointerEvents: "none", // não interfere no texto
                      height: "3rem",
                      cursor: "pointer",
                      width: "100%",
                      background:
                        "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,1) 80%, rgba(255,255,255,1) 100%)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        cursor: "pointer",
                        pointerEvents: "auto", // só o botão é clicável
                        marginLeft: "-0.2rem",
                      }}
                      onMouseEnter={() => setIsEllipsisHover(true)}
                      onMouseLeave={() => setIsEllipsisHover(false)}
                      title="More options"
                      onClick={() => setIsExpanded(true)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        class="ipc-icon ipc-icon--more-horiz ipc-overflowText-overlay__affordance"
                        viewBox="0 0 24 24"
                        fill={
                          isEllipsisHover ? "rgb(245, 197, 24)" : "rgb(0, 0, 0)"
                        }
                        role="presentation"
                      >
                        <path fill="none" d="M0 0h24v24H0V0z"></path>
                        <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
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
                    <p style={{ color: "#757575", fontWeight: "" }}>
                      {formatRating(rating)}
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
            <div style={{ position: "relative", top: "27px", left: "3px" }}>
              <p
                style={{
                  color: "#BCBCBC",
                  fontWeight: "bold",
                  marginTop: "0",
                  marginBottom: "0",
                  fontSize: "20px",
                  position: "relative",
                  top: "3px",
                }}
              >
                {firstRow.Title}
              </p>
              <p
                style={{
                  color: "white",
                  fontSize: "42px",
                  margin: 0,
                  letterSpacing: 0.2,
                }}
              >
                Episode list
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="break-point" style={{ width: "100%", height: "31px" }} />
      <div style={{ display: "flex", margin: "0 auto", width: "1280px" }}>
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
                    <div style={{}}>
                      <h2
                        style={{
                          fontSize: "0.73rem",
                          marginBottom: "0px",
                          color: "#000000",
                          letterSpacing: "2.2px",
                          marginTop: 0,
                        }}
                      >
                        {Number(nextEpisode.season) === 1 &&
                        Number(nextEpisode.number) === 1
                          ? "SERIES PREMIERE"
                          : Number(nextEpisode.number) === 1
                            ? `SEASON ${Number(nextEpisode.season)} PREMIERE`
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
                        <Link
                          to={`/episodepage/${movieId}/${nextEpisode?.episodeId}`}
                        >
                          <h3
                            style={{
                              color: "#212121",
                              fontWeight: "bold",
                              margin: 0,
                              paddingTop: 1,
                              paddingBottom: 2.5,
                              letterSpacing: "0.00937em",
                              fontSize: "1rem",
                              position: "relative",
                              left: "0px",
                              top: "0px",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              lineHeight: "1.25rem",
                            }}
                          >
                            {nextEpisode.Title}
                          </h3>
                        </Link>
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
                    <div
                      style={{ marginTop: 8, position: "relative", top: -1 }}
                    >
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
                      const rating = parseFloat(ep["Average Rating 2"]);
                      const votes = parseInt(ep.Votes2);
                      const hasSynopsis =
                        ep.Synopsis && ep.Synopsis.trim() !== "";
                      const hasRating = !isNaN(rating) && rating > 0;
                      const hasVotes = !isNaN(votes) && votes > 0;

                      return (
                        ep.Date &&
                        !isNaN(new Date(ep.Date)) &&
                        (hasSynopsis || hasRating || hasVotes) // aqui OR
                      );
                    });

                    const hasOnlyOneEpisode = validEpisodes.length === 1;

                    // Separar episódios recentes e top-rated
                    const recentEpisode = validEpisodes
                      .filter((ep) => new Date(ep.Date) >= daysAgo30)
                      .sort((a, b) => {
                        const dateDiff = new Date(b.Date) - new Date(a.Date);
                        if (dateDiff !== 0) return dateDiff;

                        // Se as datas forem iguais, ordenar por número do episódio (se disponível)
                        const aEpNum = parseInt(a.Number || "0");
                        const bEpNum = parseInt(b.Number || "0");
                        return bEpNum - aEpNum;
                      })[0];

                    // Pega top rated entre os validEpisodes (exceto o recente para não duplicar)
                    // Pega top rated entre os validEpisodes (exceto o recente para não duplicar)
                    const topRatedEpisodes = validEpisodes
                      .sort((a, b) => {
                        const ratingA = parseFloat(a["Average Rating 2"]);
                        const votesA = parseInt(a.Votes2);

                        const ratingB = parseFloat(b["Average Rating 2"]);
                        const votesB = parseInt(b.Votes2);

                        const scoreA = ratingA * Math.log(votesA + 1);
                        const scoreB = ratingB * Math.log(votesB + 1);

                        return scoreB - scoreA;
                      })
                      .slice(0, 2);

                    let episodesToShow = [];

                    if (hasOnlyOneEpisode) {
                      const ep = validEpisodes[0];

                      episodesToShow.push({
                        ...ep,
                        isTopRated: false, // first card = Most Recent
                        isMostRecent: true,
                      });

                      episodesToShow.push({
                        ...ep,
                        isTopRated: true, // second card = Top Rated
                        isMostRecent: false,
                      });
                    } else if (recentEpisode) {
                      episodesToShow.push({
                        ...recentEpisode,
                        isTopRated: false,
                        isMostRecent: true,
                      });

                      if (topRatedEpisodes[0]) {
                        episodesToShow.push({
                          ...topRatedEpisodes[0],
                          isTopRated: true,
                          isMostRecent: false,
                        });
                      }
                    } else {
                      episodesToShow = topRatedEpisodes
                        .filter(Boolean)
                        .map((ep) => ({
                          ...ep,
                          isTopRated: true,
                          isMostRecent: false,
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
                            <Link
                              key={episode.episodeId}
                              to={`/episodepage/${movieId}/${episode.episodeId}`}
                            >
                              <p
                                style={{
                                  color: "#212121",
                                  fontWeight: "bold",
                                  margin: 0,
                                  paddingTop: 1,
                                  paddingBottom: 2.5,
                                  letterSpacing: 0.7,
                                  fontSize: "0.97rem",
                                  position: "relative",
                                  left: "-1px",
                                  top: "1px",
                                }}
                              >
                                {episode.Title}
                              </p>
                            </Link>
                          </div>
                          <div>
                            <p
                              style={{
                                color: "#757575",
                                fontWeight: "",
                                margin: 0,
                                letterSpacing: 0.5,
                              }}
                            >
                              {episode?.Synopsis
                                ? episode.Synopsis.length > 80
                                  ? `${episode.Synopsis.slice(0, 80)}...`
                                  : episode.Synopsis
                                : "No synopsis available."}
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
                              <p style={{ color: "#757575", fontWeight: "" }}>
                                {parseFloat(episode["Average Rating 2"]) === 10
                                  ? "10"
                                  : parseFloat(
                                      episode["Average Rating 2"],
                                    ).toFixed(1)}
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
                    topEpisodes
                      .filter((ep) => {
                        const hasSynopsis =
                          ep.Synopsis && ep.Synopsis.trim() !== "";
                        const rating = parseFloat(ep["Average Rating 2"]);
                        const votes = parseInt(ep.Votes2);
                        const hasRatingOrVotes =
                          (!isNaN(rating) && rating > 0) ||
                          (!isNaN(votes) && votes > 0);
                        return hasSynopsis || hasRatingOrVotes;
                      })
                      .map((episode, index, filteredEpisodes) => (
                        <EpisodeItem
                          key={`${episode.Season}-${episode.Title}-${index}`}
                          episode={{
                            ...episode,
                            positionNumber: index + 1,
                          }}
                          index={index}
                          isLast={index === filteredEpisodes.length - 1} // Passa isLast aqui, direto como prop!
                        />
                      ))
                  )}
                  <a
                        href="https://www.imdb.com/search/title/?title_type=tv_episode&sort=num_votes,desc"
                        style={{
                          cursor: "pointer",
                          background: "none",
                          border: "none",
                          padding: "0 1rem",
                          minHeight: "2.25rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          lineHeight: "1.25",
                          color: "rgb(14,99,190)",
                          minWidth: "3rem",
                          width:"100&",
                          display: "inline-flex",
                          alignItems: "center",
                          letterSpacing: "0.02em",
                          margin:"0 4px 0 0"
                        }}
                      >
                        <span>Show more</span>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9.29 6.71a.996.996 0 0 0 0 1.41L13.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z" />
                        </svg>
                      </a>
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
                      return (
                        <div
                          key={season}
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
                              : "transparent",
                            color: "black",
                            fontWeight: "bold",
                            userSelect: "none",
                            letterSpacing: "0.7px",
                            fontSize: "0.9rem",
                            transition:
                              "background-color 0.3s ease, transform 0.2s ease",
                            ":hover": {
                              backgroundColor: isActive ? "#F5C518" : "#EBEBEB",
                              transform: "scale(1.05)",
                            },
                          }}
                          onMouseDown={(e) => e.preventDefault()} // Previne flicker no click
                          onClick={() => setCurrentSeasonIndex(index)}
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
                      isLast={index === currentEpisodes.length - 1}
                    />
                  ))}
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginTop: "1rem",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Previous */}
                    {currentSeasonIndex > 0 && (
                      <button
                        onClick={goPrevSeason}
                        style={{
                          cursor: "pointer",
                          background: "none",
                          border: "none",
                          padding: "0 1rem",
                          minHeight: "2.25rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          lineHeight: "1.25",
                          color: "rgb(14,99,190)",
                          minWidth: "3rem",
                          display: "inline-flex",
                          alignItems: "center",
                          letterSpacing: "0.02em",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          role="presentation"
                        >
                          <path d="M14.71 6.71a.996.996 0 0 0-1.41 0L8.71 11.3a.996.996 0 0 0 0 1.41l4.59 4.59a.996.996 0 1 0 1.41-1.41L10.83 12l3.88-3.88c.39-.39.38-1.03 0-1.41z" />
                        </svg>
                        <span>{seasonList[currentSeasonIndex - 1]}</span>
                      </button>
                    )}

                    {/* Next */}
                    {currentSeasonIndex < seasonList.length - 1 && (
                      <button
                        onClick={goNextSeason}
                        style={{
                          cursor: "pointer",
                          background: "none",
                          border: "none",
                          padding: "0 1rem",
                          minHeight: "2.25rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          lineHeight: "1.25",
                          color: "rgb(14,99,190)",
                          minWidth: "3rem",
                          display: "inline-flex",
                          alignItems: "center",
                          letterSpacing: "0.02em",
                        }}
                      >
                        <span>{seasonList[currentSeasonIndex + 1]}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          role="presentation"
                        >
                          <path d="M9.29 6.71a.996.996 0 0 0 0 1.41L13.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z" />
                        </svg>
                      </button>
                    )}
                  </div>
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
                    (episode, index, list) => (
                      <EpisodeItem
                        key={`${episode.Season}-${episode.Title}`}
                        episode={episode}
                        index={index}
                        isLast={index === list.length - 1} // ✅ lista correta
                      />
                    ),
                  )}

                  {/* Navegação Previous / Next (igual às seasons) */}
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginTop: "1rem",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Previous */}
                    {currentYearIndex > 0 && (
                      <button
                        onClick={goPrevYear}
                        style={{
                          cursor: "pointer",
                          background: "none",
                          border: "none",
                          padding: "0 1rem",
                          minHeight: "2.25rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          lineHeight: "1.25",
                          color: "rgb(14,99,190)",
                          minWidth: "3rem",
                          display: "inline-flex",
                          alignItems: "center",
                          letterSpacing: "0.02em",
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M14.71 6.71a.996.996 0 0 0-1.41 0L8.71 11.3a.996.996 0 0 0 0 1.41l4.59 4.59a.996.996 0 1 0 1.41-1.41L10.83 12l3.88-3.88c.39-.39.38-1.03 0-1.41z" />
                        </svg>
                        <span>{yearList[currentYearIndex - 1]}</span>
                      </button>
                    )}

                    {/* Next */}
                    {currentYearIndex < yearList.length - 1 && (
                      <button
                        onClick={goNextYear}
                        style={{
                          cursor: "pointer",
                          background: "none",
                          border: "none",
                          padding: "0 1rem",
                          minHeight: "2.25rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          lineHeight: "1.25",
                          color: "rgb(14,99,190)",
                          minWidth: "3rem",
                          display: "inline-flex",
                          alignItems: "center",
                          letterSpacing: "0.02em",
                        }}
                      >
                        <span>{yearList[currentYearIndex + 1]}</span>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9.29 6.71a.996.996 0 0 0 0 1.41L13.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div style={{ position: "relative", left: "-20px" }}>
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
