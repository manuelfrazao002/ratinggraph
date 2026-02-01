import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import { createGlobalStyle } from "styled-components";
import { ChevronRight, ChevronDown, ChevronLeft } from "lucide-react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { getShowCoverSrc, getTrailerSrc } from "./ShowImageSrc";

//Navbar
import IMDBNavbar from "./imgs/imdb/imdb_navbar.png";

//Top
import UpInfo from "./imgs/imdb/upinfo.png";

import StarImdb from "./imgs/imdb/starimdb.png";
import RateIMDB from "./imgs/imdb/rateimdb.png";

import IMDBRating from "./imgs/imdb/imdbrating.png";
import YourRating from "./imgs/imdb/yourrating.png";

import IMDBPro from "./imgs/imdb/imdbpro.png";

import MarkedWatched from "./imgs/imdb/markwatched.png";

//More to Explore
import MoreToExplore from "./imgs/imdb/moretoexplore.png";

//Footer
import Footer1 from "./imgs/imdb/footer1.png";
import Footer2 from "./imgs/imdb/footer2.png";

import CastList from "./components/CastList.jsx";
import RatingsBarChart from "./components/RatingsBarChart.jsx";
import PlotKeywords from "./components/PlotKeywords.jsx";

//Images for section Images
import Img1 from "./imgs/imdb/imgs/img1.jpg";
import Img2 from "./imgs/imdb/imgs/img2.jpg";
import Img3 from "./imgs/imdb/imgs/img3.jpg";
import Img4 from "./imgs/imdb/imgs/img4.jpg";
import Img5 from "./imgs/imdb/imgs/img5.jpg";

import FeaturedReviews from "./imgs/imdb/featuredreviews.png";
import RelatedInterests from "./imgs/imdb/relatedinterests.png";
import DidYouKnow from "./imgs/imdb/didyouknow.png";
import MoreToExploreSticky from "./imgs/imdb/moretoexploresticky.png";
import ContributeToThisPageEpisodePage from "./imgs/imdb/contributetothispageepisodepage.png";
import { getEpisodeSrc } from "./ShowImageSrc";

//Data
import { movieMap } from "./data/MovieMap";

function SeriesPageDetails() {
  const { movieId, episodeId } = useParams();
  const episodeHeaderRef = useRef(null);
  const synopsisRef = useRef(null);
  const [episodeData, setEpisodeData] = useState(null);
  const [episodeStars, setEpisodeStars] = useState([]);
  const [episodeCharCount, setEpisodeCharCount] = useState([]);
  const [data, setData] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [movies, setMovie] = useState([]);
  const [coverSrc, setCoverSrc] = useState("");
  const [trailerSrc, setTrailerSrc] = useState("");
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [nextEpisode, setNextEpisode] = useState(null);
  const [recentAndTopEpisodes, setRecentAndTopEpisodes] = useState([]);
  const [cast, setCast] = useState([]);
  const [prevEpisode, setPrevEpisode] = useState(null);
  const [nextEpisodeNav, setNextEpisodeNav] = useState(null);

  const urls = movieMap[movieId];

  useEffect(() => {
    if (!urls || urls.length < 5) return;

    fetch(urls[4]) // 👈 índice das Stars
      .then((res) => res.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log(
              "⭐ STARS CSV (primeiras 3 linhas):",
              results.data.slice(0, 3),
            );
            console.log(
              "⭐ STARS CSV keys:",
              Object.keys(results.data[0] || {}),
            );
            setCast(results.data);
          },
        });
      });
  }, [movieId]);

  useEffect(() => {
    if (!urls || urls.length === 0) return;

    fetch(urls[0])
      .then((res) => res.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          complete: (results) => {
            setData(results.data[0]);
            console.log("CSV RAW DATA:", results.data[0]);
          },
          error: (err) => console.error("Erro ao carregar CSV", err),
        });
      });
  }, [movieId]);

  useEffect(() => {
    if (!urls || urls.length < 2) return;

    fetch(urls[1])
      .then((res) => res.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const episodes = results.data;

            episodes.forEach((ep) => {
              ep.Votes2 = ep.Votes2?.replace(/,/g, "") || "0";
            });

            setAllEpisodes(episodes);

            if (episodeId) {
              const foundEpisode = episodes.find(
                (ep) => ep.episodeId === episodeId,
              );

              setEpisodeData(foundEpisode || null);
            }
          },
          error: (err) => console.error("Erro episódios CSV", err),
        });
      });
  }, [movieId, episodeId]);

  useEffect(() => {
    if (!allEpisodes.length) return;

    const now = new Date();

    const futureEpisodes = allEpisodes
      .map((ep) => ({
        ...ep,
        parsedDate: new Date(ep.Date),
      }))
      .filter((ep) => !isNaN(ep.parsedDate) && ep.parsedDate > now)
      .sort((a, b) => a.parsedDate - b.parsedDate);

    setNextEpisode(futureEpisodes[0] || null);
  }, [allEpisodes]);

  useEffect(() => {
    if (!allEpisodes.length) return;

    const now = new Date();
    const daysAgo30 = new Date(now);
    daysAgo30.setDate(now.getDate() - 30);

    const validEpisodes = allEpisodes.filter((ep) => {
      const rating = parseFloat(ep["Average Rating 2"]);
      const votes = parseInt(ep.Votes2);
      const hasSynopsis = ep.Synopsis?.trim();

      return (
        ep.Date &&
        !isNaN(new Date(ep.Date)) &&
        (hasSynopsis || rating > 0 || votes > 0)
      );
    });

    if (!validEpisodes.length) {
      setRecentAndTopEpisodes([]);
      return;
    }

    // ✅ Most Recent:
    // tenta últimos 30 dias, senão usa o mais recente disponível
    let mostRecent =
      validEpisodes
        .filter((ep) => new Date(ep.Date) >= daysAgo30)
        .sort((a, b) => new Date(b.Date) - new Date(a.Date))[0] ||
      validEpisodes.sort((a, b) => new Date(b.Date) - new Date(a.Date))[0];

    // ✅ Top Rated (pode ser o mesmo se só existir um)
    const topRated =
      validEpisodes
        .filter((ep) => ep !== mostRecent)
        .sort((a, b) => {
          const scoreA =
            parseFloat(a["Average Rating 2"] || 0) *
            Math.log((parseInt(a.Votes2) || 0) + 1);
          const scoreB =
            parseFloat(b["Average Rating 2"] || 0) *
            Math.log((parseInt(b.Votes2) || 0) + 1);
          return scoreB - scoreA;
        })[0] || mostRecent;

    setRecentAndTopEpisodes([
      {
        ...mostRecent,
        isMostRecent: true,
        isTopRated: false,
      },
      {
        ...topRated,
        isMostRecent: false,
        isTopRated: true,
      },
    ]);
  }, [allEpisodes]);

  console.log("Recent & Top Episodes:", recentAndTopEpisodes);

  useEffect(() => {
    if (!allEpisodes.length || !episodeId) return;

    const sortedEpisodes = [...allEpisodes]
      .filter((ep) => ep.episodeId && ep.Number2)
      .sort((a, b) => Number(a.Number2) - Number(b.Number2));

    const currentIndex = sortedEpisodes.findIndex(
      (ep) => ep.episodeId === episodeId,
    );

    setPrevEpisode(currentIndex > 0 ? sortedEpisodes[currentIndex - 1] : null);

    setNextEpisodeNav(
      currentIndex < sortedEpisodes.length - 1
        ? sortedEpisodes[currentIndex + 1]
        : null,
    );

    // DEBUG (remove depois)
    console.log("CURRENT:", episodeId);
    console.log("PREV:", sortedEpisodes[currentIndex - 1]?.episodeId);
    console.log("NEXT:", sortedEpisodes[currentIndex + 1]?.episodeId);
  }, [allEpisodes, episodeId]);

  useEffect(() => {
    if (!urls || urls.length < 6) return;

    fetch(urls[5]) // 👈 EpCharCount
      .then((res) => res.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log(
              "🎭 EPCHARCOUNT CSV (primeiras 5 linhas):",
              results.data.slice(0, 5),
            );
            console.log(
              "🎭 EPCHARCOUNT CSV keys:",
              Object.keys(results.data[0] || {}),
            );
            setEpisodeCharCount(results.data);
          },
        });
      });
  }, [movieId]);

  const normalize = (v) => v?.replace(/\u00A0/g, " ").trim();

  const episodeCast = React.useMemo(() => {
    if (!cast.length || !episodeCharCount.length || !episodeId) return [];

    // 1️⃣ Set com CharacterId DIRETO do CSV
    const characterIdsInEpisode = new Set(
      episodeCharCount
        .filter((row) => row.episodeId === episodeId)
        .map((row) => normalize(row.CharacterId)),
    );

    // 2️⃣ Filtra o cast usando o mesmo campo
    return cast.filter((actor) =>
      characterIdsInEpisode.has(normalize(actor.CharacterId)),
    );
  }, [cast, episodeCharCount, episodeId]);

  const ratingsBreakdown = React.useMemo(() => {
    if (!episodeData) return null;

    const result = {};

    Object.keys(episodeData).forEach((key) => {
      const trimmedKey = key.trim();

      // só aceita "1" até "10"
      if (/^(10|[1-9])$/.test(trimmedKey)) {
        const value = Number(String(episodeData[key]).replace(/[^\d]/g, ""));

        result[trimmedKey] = isNaN(value) ? 0 : value;
      }
    });

    // garante que todos existem
    for (let i = 1; i <= 10; i++) {
      if (!(i in result)) result[i] = 0;
    }

    return result;
  }, [episodeData]);

  // Load cover and trailer images dynamically
  useEffect(() => {
    const loadImages = async () => {
      if (!movieId) return;

      // cover default da série
      let finalCover = getShowCoverSrc(movieId);

      if (episodeData?.Season && episodeData?.Number2 && episodeData?.Date3) {
        const episodeDate = new Date(episodeData.Date3.replace(/\u00A0/g, " "));
        const now = new Date();

        // 👉 só usa cover do episódio se JÁ TIVER IDO AO AR
        if (!isNaN(episodeDate) && now > episodeDate) {
          const seasonNum = `s${episodeData.Season}`;
          const episodeNum = episodeData.Episode2;
          finalCover = getEpisodeSrc(movieId, seasonNum, episodeNum);
        }
      }

      setCoverSrc(finalCover);
    };

    loadImages();
  }, [movieId, episodeData]);

  console.log("movieId da URL:", movieId);
  console.log(
    "Filmes disponíveis:",
    movies.map((m) => m.id),
  );

  if (!urls) return <p>Filme não encontrado</p>;
  if (!data) return <p>Carregando dados do filme...</p>;

  const votesNumber =
    Number(episodeData?.Votes2?.toString().replace(/[,]+/g, "")) || 0;
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

  function renderListWithDotSeparator2(list) {
    if (!list) return null;

    const items = Array.isArray(list)
      ? list
      : list.split(",").map((item) => item.trim());

    const limitedItems = items;

    return limitedItems.map((item, index) => (
      <React.Fragment key={index}>
        <span style={{ color: "#0e63be" }}>{item}</span>
        {index < limitedItems.length - 1 && (
          <span style={{ color: "black", margin: "0 6px" }}>·</span>
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

  function formatNumberNoRound(num) {
    if (!num) return "N/A";

    const cleanNum = Number(num.toString().replace(/[, ]+/g, ""));
    if (isNaN(cleanNum)) return "N/A";

    if (cleanNum >= 1_000_000) {
      // Trunca para 1 casa decimal, sem arredondar
      const millions = Math.trunc(cleanNum / 100_000) / 10;
      return millions.toString().replace(/\.0$/, "") + "M";
    }

    if (cleanNum >= 100_000) {
      // Trunca milhares (sem arredondar)
      const thousands = Math.trunc(cleanNum / 1_000);
      return thousands + "K";
    }

    if (cleanNum >= 1_000) {
      // Trunca para 1 casa decimal
      const thousands = Math.trunc((cleanNum / 1_000) * 10) / 10;
      return thousands.toString().replace(/\.0$/, "") + "K";
    }

    return cleanNum.toString();
  }

  function formatToK(num) {
    if (!num) return "N/A";

    const cleanNum = Number(num.toString().replace(/[, ]+/g, ""));
    if (isNaN(cleanNum)) return "N/A";

    if (cleanNum < 1_000) {
      return cleanNum.toString();
    }

    // Trunca para 1 casa decimal (sem arredondar)
    const value = Math.trunc((cleanNum / 1_000) * 10) / 10;

    return value.toString().replace(/\.0$/, "") + "K";
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
      const thousands = Math.floor(cleanNum / 100); // Get 1 decimal without rounding
      return (thousands / 10).toFixed(1) + "K";
    }

    return cleanNum.toString();
  }

  const userReviewsNumber =
    Number(episodeData?.UserReviews?.toString().replace(/[,]+/g, "")) || 0;
  const criticReviewsNumber =
    Number(episodeData?.CriticReviews?.toString().replace(/[,]+/g, "")) || 0;
  const metascoreReviewsNumber =
    Number(data.Metascore?.toString().replace(/[,]+/g, "")) || 0;
  const isMovie = data.Type === "Movie";
  const isTVShow = data.Type === "TV Series" || data.Type === "TV Mini Series";

  const parsedDate = episodeData?.Date3
    ? new Date(episodeData.Date3.replace(/\u00A0/g, " "))
    : null;

  const hasComingSoonEpisode = (() => {
    if (!isTVShow) return false;

    const rawDate = data?.NextEpisodeDate || episodeData?.Date3;
    if (!rawDate) return false;

    const parsed = new Date(rawDate.replace?.(/\u00A0/g, " ") ?? rawDate);

    if (isNaN(parsed)) return false;

    return parsed > new Date();
  })();

  return (
    <>
      <GlobalStyle />
      <div>
        {isTVShow && (
          <Link to={`/imdb/list`}>
            <img src={IMDBNavbar} alt="Rating Graph" />
          </Link>
        )}
        {isMovie && (
          <Link to={`/`}>
            <img src={IMDBNavbar} alt="Rating Graph" />
          </Link>
        )}
        <main>
          <div style={{ backgroundColor: "#1F1F1F", width: "100%" }}>
            <div style={{ margin: "0 auto", width: "1280px" }}>
              <Link to={`/imdb/${movieId}`}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "white",
                    cursor: "pointer",
                    marginLeft: "24px",
                    padding: "8px 8px 8px 0",
                    width: "max-content",
                    fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                    fontSize: "1rem",
                    fontWeight: "400",
                    lineHeight: "1.5rem",
                    letterSpacing: "0.03125em",
                    position: "relative",
                    top: -7,
                    left: -4,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19.2"
                    height="19.2"
                    class="ipc-icon ipc-icon--chevron-left ipc-icon--inline ipc-link__icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    role="presentation"
                    style={{
                      fontSize: "1.2em",
                      marginRight: "0.25em",
                    }}
                  >
                    <path fill="none" d="M0 0h24v24H0V0z"></path>
                    <path d="M14.71 6.71a.996.996 0 0 0-1.41 0L8.71 11.3a.996.996 0 0 0 0 1.41l4.59 4.59a.996.996 0 1 0 1.41-1.41L10.83 12l3.88-3.88c.39-.39.38-1.03 0-1.41z"></path>
                  </svg>
                  <span>{data.Title}</span>
                </div>
              </Link>
              <div
                style={{
                  display: "flex",
                  paddingLeft: "1rem",
                }}
              >
                <span
                  style={{
                    color: "rgb(245,197,24)",
                    marginLeft: "0.5rem",
                    fontSize: "1rem",
                    fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                    letterSpacing: "0.03125em",
                    lineHeight: "1.5rem",
                    maxWidth: "20vw",
                    fontWeight: "bold",
                    position: "relative",
                    top: 6,
                  }}
                >
                  {episodeData?.EpisodeName}
                </span>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingRight: "12px",
                    position: "relative",
                    top: "-8px",
                    width: "100%",
                  }}
                >
                  {/* Only show the Episode Guide link for TV Series */}
                  {isTVShow && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {/* ◀ Anterior */}
                      {prevEpisode ? (
                        <Link
                          to={`/episodepage/${movieId}/${prevEpisode.episodeId}`}
                        >
                          <ChevronLeft
                            size={27}
                            style={{
                              color: "white",
                              padding: "0.5rem",
                              cursor: "pointer",
                            }}
                          />
                        </Link>
                      ) : (
                        <ChevronLeft
                          size={27}
                          style={{
                            color: "rgba(255,255,255,0.3)",
                            padding: "0.5rem",
                            cursor: "default",
                          }}
                        />
                      )}
                      <Link to={`/episodepage/${movieId}`}>
                        <span
                          style={{
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            lineHeight: "1.25rem",
                            letterSpacing: "0.02em",
                            color: "white",
                            padding: "0 1rem",
                            cursor: "pointer",
                          }}
                        >
                          All episodes
                        </span>
                      </Link>

                      {/* ▶ Seguinte */}
                      {nextEpisodeNav ? (
                        <Link
                          to={`/episodepage/${movieId}/${nextEpisodeNav.episodeId}`}
                        >
                          <ChevronRight
                            size={27}
                            style={{
                              color: "white",
                              padding: "0.5rem",
                              cursor: "pointer",
                            }}
                          />
                        </Link>
                      ) : (
                        <ChevronRight
                          size={27}
                          style={{
                            color: "rgba(255,255,255,0.3)",
                            padding: "0.5rem",
                            cursor: "default",
                          }}
                        />
                      )}
                    </div>
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
                    {episodeData?.TitleName2}
                  </h1>
                  <div
                    style={{
                      color: "#C0C0C0",
                      marginBottom: "9px",
                      fontSize: "0.875rem",
                      fontWeight: "400",
                      position: "relative",
                      display: "flex",
                      fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                      letterSpacing: "0.01786em",
                      lineHeight: "1.25rem",
                    }}
                  >
                    {parsedDate && parsedDate < new Date() && (
                      <>Episode aired {episodeData?.Date3}</>
                    )}

                    {parsedDate && parsedDate > new Date() && (
                      <>Episode airs {episodeData?.Date3}</>
                    )}

                    <span style={{ fontWeight: "bold", margin: "0 7px" }}>
                      ·
                    </span>
                    {episodeData?.AgeRating}
                    <div>
                      <span style={{ fontWeight: "bold", margin: "0 7px" }}>
                        ·
                      </span>
                      {episodeData?.epDuration2}
                    </div>
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
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
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
                                fontSize: "1.25rem",
                                color: "white",
                                letterSpacing: "0.0125em",
                                position: "relative",
                                top: "1px",
                                paddingRight: "0.125rem",
                                fontWeight: "bold",
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              }}
                            >
                              {episodeData?.["Average Rating 2"]}
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
                              fontSize: "0.75rem",
                              color: "#BCBCBC",
                              position: "relative",
                              top: "-4px",
                              left: "-1px",
                              letterSpacing: "0.03333em",
                              lineHeight: "1rem",
                              fontWeight: "400",
                              WebkitTextStroke: "0.1px #BCBCBC",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            }}
                          >
                            {formatVotes(episodeData?.Votes2) || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {hasVotes && (
                    <div style={{ paddingRight: 4 }}>
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
                </div>
              </div>

              <section
                style={{
                  display: "flex",
                }}
              >
                {/* Poster */}
                <section
                  style={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    height: "fit-content",
                  }}
                >
                  <div>
                    <img
                      src={coverSrc}
                      onError={async (e) => {
                        e.currentTarget.src = await getShowCoverSrc(movieId);
                      }}
                      alt=""
                      loading="lazy"
                      style={{
                        width: "166px",
                        height: "246.05px",
                        objectFit: "cover",
                        borderRadius: 12,
                        marginLeft: "24px",
                        marginRight: "8px",
                      }}
                    />
                  </div>
                </section>
                {/* Informationa about episode */}
                <section
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingBottom: "12px",
                    margin: "0 24px 0 8px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "629.333px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        margin: "0px 0 12px 0",
                      }}
                    >
                      {(data?.Genres
                        ? // Primeiro dividimos por vírgula que não esteja dentro de um termo
                          data.Genres.split(/(?<!\,\s)\,(?!\s\,)/)
                            .map((genre) => genre.trim())
                            .filter((genre) => genre)
                        : []
                      ).map((genre, index) => (
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
                              boxShadow: "0 0 0 1px #F5C518",
                            },
                          }}
                        >
                          <span
                            style={{
                              color: "white",
                              fontSize: "0.9rem",
                              fontWeight: 400,
                              letterSpacing: "0.03px",
                              whiteSpace: "nowrap",
                              transition: "color 0.2s ease",
                              ":hover": {
                                color: "#F5C518",
                              },
                            }}
                          >
                            {genre}
                          </span>
                        </div>
                      ))}
                    </div>
                    {episodeData?.Synopsis && (
                      <div
                        style={{
                          marginTop: "5px",
                          color: "white",
                          borderBottom: "1px solid #4B4B4B",
                          paddingBottom: "12px",
                        }}
                      >
                        {episodeData?.Synopsis}
                      </div>
                    )}
                    {!episodeData?.Synopsis && (
                      <div
                        style={{
                          marginTop: "5px",
                          color: "white",
                          borderBottom: "1px solid #4B4B4B",
                          paddingBottom: "12px",
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          height: "36px",
                        }}
                      >
                        <svg
                          style={{
                            marginRight: "0.25rem",
                            marginLeft: "-0.375rem",
                          }}
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          class="ipc-icon ipc-icon--add ipc-btn__icon ipc-btn__icon--pre"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          role="presentation"
                        >
                          <path d="M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z"></path>
                        </svg>
                        <span
                          style={{
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            lineHeight: "1.25rem",
                            letterSpacing: "0.02em",
                          }}
                        >
                          Add a plot in your language
                        </span>
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        borderBottom: "1px solid #4B4B4B",
                        height: "49.283px",
                      }}
                    >
                      <p
                        style={{
                          paddingRight: "0.75rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          letterSpacing: "0.00937em",
                          fontWeight: "600",
                          color: "white",
                        }}
                      >
                        Directors
                      </p>
                      <p
                        style={{
                          fontWeight: "400",
                          letterSpacing: "0.03125em",
                          wordBreak: "break-word",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                        }}
                      >
                        {renderListWithDotSeparator(episodeData?.Directors)}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        borderBottom: "1px solid #4B4B4B",
                        height: "49.283px",
                      }}
                    >
                      <p
                        style={{
                          paddingRight: "0.75rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          letterSpacing: "0.00937em",
                          fontWeight: "600",
                          color: "white",
                        }}
                      >
                        Writers
                      </p>
                      <p
                        style={{
                          fontWeight: "400",
                          letterSpacing: "0.03125em",
                          wordBreak: "break-word",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                        }}
                      >
                        {renderListWithDotSeparator(episodeData?.Writers)}
                      </p>
                    </div>
                    <div
                      style={{
                        borderBottom: "1px solid #4B4B4B",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          height: "49.283px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <p
                            style={{
                              paddingRight: "0.75rem",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              fontSize: "1rem",
                              lineHeight: "1.5rem",
                              letterSpacing: "0.00937em",
                              fontWeight: "600",
                              color: "white",
                            }}
                          >
                            Stars
                          </p>
                          <p
                            style={{
                              fontWeight: "400",
                              letterSpacing: "0.03125em",
                              wordBreak: "break-word",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              fontSize: "1rem",
                            }}
                          >
                            {renderListWithDotSeparator(data.Stars)}
                          </p>
                        </div>
                        <ChevronRight
                          size={20}
                          style={{
                            color: isHovered ? "#F5C518" : "white",
                            transition: "color 0.2s ease",
                            cursor: "pointer",
                            marginLeft: "auto",
                            alignSelf: "center",
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <img src={IMDBPro} alt="" />
                    </div>
                  </div>

                  <div
                    style={{
                      width: "358.617px",
                      height: "max-content",
                      display: "grid",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      position: "relative",
                      alignContent: "center",
                    }}
                  >
                    {hasComingSoonEpisode ? (
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
                              fontSize: "0.75rem",
                              letterSpacing: "0.16667em",
                              paddingLeft: 8,
                              margin: 0,
                              color: "white",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              fontWeight: 600,
                              lineHeight: "1rem",
                            }}
                          >
                            COMING SOON
                          </p>
                          <p
                            style={{
                              fontSize: "0.875rem",
                              letterSpacing: "0.01786em",
                              position: "relative",
                              color: "white",
                              paddingLeft: 8,
                              margin: 0,
                              lineHeight: "1.25rem",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              fontWeight: 400,
                            }}
                          >
                            {" "}
                            {episodeData.Date3}{" "}
                          </p>
                        </div>
                      </div>
                    ) : null}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        minWidth: "max-content",
                        maxHeight: "48px",
                        backgroundColor: "#F5C518",
                        borderRadius: 50,
                      }}
                    >
                      <div
                        style={{
                          paddingRight: 6,
                          paddingLeft: 4,
                          color: "black",
                          fontSize: 24,
                          display: "flex",
                          position: "relative",
                          left: "2px",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          class="ipc-icon ipc-icon--add ipc-btn__icon ipc-btn__icon--pre"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          role="presentation"
                        >
                          <path d="M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z"></path>
                        </svg>
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
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            fontSize: 14.2,
                            letterSpacing: 0.2,
                            marginBottom: "-1.8px",
                          }}
                        >
                          Add to Watchlist
                        </p>
                        {episodeData?.WatchlistNumber >= 1000 && (
                          <p
                            style={{
                              margin: 0,
                              color: "black",
                              fontSize: "0.75em",
                              letterSpacing: "0.03333em",
                              position: "relative",
                              bottom: "1.2px",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              fontWeight: 400,
                            }}
                          >
                            Added by{" "}
                            {formatNumberWatchList(
                              episodeData?.WatchlistNumber,
                            )}{" "}
                            users
                          </p>
                        )}
                      </div>
                      <div
                        style={{
                          margin: "0 auto",
                          display: "flex",
                          justifyContent: "center",
                          width: "48px",
                        }}
                      >
                        <ChevronDown
                          size={20}
                          style={{
                            color: "black",
                            WebkitTextStroke: "0.9px black",
                          }}
                        />
                      </div>
                    </div>
                    {hasVotes && (
                      <>
                        <div style={{ minWidth: "48px", marginTop: 8 }}>
                          <img src={MarkedWatched} alt="" />
                        </div>

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
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 600,
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  textAlign: "right",
                                  display: "inline-block",
                                  fontSize: "1rem",
                                  letterSpacing: "0.00937em",
                                  lineHeight: "1.25rem",
                                  marginRight: "0.25rem",
                                }}
                              >
                                {formatNumber(userReviewsNumber)}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.875rem",
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  fontWeight: 400,
                                  letterSpacing: "0.01786em",
                                  lineHeight: "1.25rem",
                                }}
                              >
                                {userReviewsNumber === 1
                                  ? "User review"
                                  : "User reviews"}
                              </span>
                            </div>
                          )}

                          {hasVotes && criticReviewsNumber > 0 && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 600,
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  textAlign: "right",
                                  display: "inline-block",
                                  fontSize: "1rem",
                                  letterSpacing: "0.00937em",
                                  lineHeight: "1.25rem",
                                  marginRight: "0.25rem",
                                }}
                              >
                                {formatNumber(criticReviewsNumber)}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.875rem",
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  fontWeight: 400,
                                  letterSpacing: "0.01786em",
                                  lineHeight: "1.25rem",
                                }}
                              >
                                {criticReviewsNumber === 1
                                  ? "Critic review"
                                  : "Critic reviews"}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </section>
              </section>
            </div>
          </div>

          {/* Bottom Section - Top TV Shows */}
          <div style={{ backgroundColor: "#FFFFFF", width: "100%" }}>
            <div
              style={{
                maxWidth: "1280px",
                backgroundColor: "white",
                margin: "0 auto",
                boxSizing: "border-box",
                color: "black",
                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                display: "flex",
              }}
            >
              <div
                style={{
                  width: "856px",
                }}
              >
                <section
                  style={{
                    minHeight: "50vh",
                    overflowX: "clip",
                    position: "relative",
                    background: "#FFFFFF",
                    color: "black",
                    margin: "0",
                    padding: "0",
                  }}
                >
                  {/*Images*/}
                  {episodeData?.Photos > 5 && (
                    <section
                      style={{
                        padding: "24px",
                        width: "856px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "block",
                          marginBottom: "30px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "20px",
                            width: "808px",
                            height: "38.4px",
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
                              onMouseEnter={() => setHovered(true)}
                              onMouseLeave={() => setHovered(false)}
                            >
                              <h3
                                style={{
                                  padding: "0 0 0 10px",
                                  margin: 0,
                                  fontSize: "1.5rem",
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  letterSpacing: "normal",
                                  lineHeight: "1.2em",
                                  fontWeight: "600",
                                }}
                              >
                                Photos
                              </h3>
                              <span
                                style={{
                                  paddingLeft: "12px",
                                  color: "rgb(0,0,0,.54)",
                                  fontSize: "0.875rem",
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  fontWeight: "400",
                                  alignSelf: "center",
                                  letterSpacing: "0.01786em",
                                  lineHeight: "unset",
                                  marginRight: "2px",
                                }}
                              >
                                {episodeData?.Photos}
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
                                  color: hovered ? "#F5C518" : "rgba(0,0,0)",
                                  transition: "color 0.2s ease",
                                }}
                              >
                                <path d="M5.622.631A2.153 2.153 0 0 0 5 2.147c0 .568.224 1.113.622 1.515l8.249 8.34-8.25 8.34a2.16 2.16 0 0 0-.548 2.07c.196.74.768 1.317 1.499 1.515a2.104 2.104 0 0 0 2.048-.555l9.758-9.866a2.153 2.153 0 0 0 0-3.03L8.62.61C7.812-.207 6.45-.207 5.622.63z"></path>
                              </svg>
                            </Link>
                          </div>
                          <div
                            style={{
                              marginLeft: "auto",
                              display: "flex",
                              alignItems: "center",
                              color: "rgb(14,99,190)",
                              cursor: "pointer",
                              padding: "0 16px 0 16px",
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              class="ipc-icon ipc-icon--add ipc-btn__icon ipc-btn__icon--pre"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              role="presentation"
                              style={{
                                marginRight: "4px",
                              }}
                            >
                              <path d="M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z"></path>
                            </svg>
                            <span
                              style={{
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                lineHeight: "1.25rem",
                                letterSpacing: ".02em",
                                height: "24px",
                                display: "flex",
                                alignItems: "center",
                                position: "relative",
                                top: "1px",
                              }}
                            >
                              Add photo
                            </span>
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              flexFlow: "row",
                              gap: "1rem",
                              marginBottom: "1rem",
                            }}
                          >
                            <img
                              src={Img1}
                              style={{
                                width: "396px",
                                height: "162.5px",
                                borderRadius: "0.75rem",
                                objectFit: "cover",
                                objectPosition: "15% 15%",
                                cursor: "pointer",
                              }}
                            />
                            <img
                              src={Img2}
                              style={{
                                width: "396px",
                                height: "162.5px",
                                borderRadius: "0.75rem",
                                objectFit: "cover",
                                cursor: "pointer",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexFlow: "row",
                              gap: "1rem",
                              marginBottom: "1rem",
                            }}
                          >
                            <img
                              src={Img3}
                              style={{
                                width: "338.333px",
                                height: "149.817px",
                                borderRadius: "0.75rem",
                                objectFit: "cover",
                                objectPosition: "15% 15%",
                                cursor: "pointer",
                              }}
                            />
                            <img
                              src={Img4}
                              style={{
                                width: "338.333px",
                                height: "149.817px",
                                borderRadius: "0.75rem",
                                objectFit: "cover",
                                objectPosition: "20% 20%",
                                cursor: "pointer",
                              }}
                            />
                            <div
                              style={{
                                position: "relative",
                                width: "100px",
                                height: "149.817px",
                                borderRadius: "0.75rem",
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={Img5}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  objectPosition: "70% 70%",
                                  cursor: "pointer",
                                }}
                              />

                              {/* Overlay */}
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "rgba(0,0,0,0.5)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontWeight: 600,
                                  fontSize: "0.875rem",
                                  textAlign: "center",
                                  borderRadius: "0.75rem",
                                  pointerEvents: "none",
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  lineHeight: "1.25rem",
                                  letterSpacing: "normal",
                                }}
                              >
                                + {formatVotes(episodeData?.Photos - 4)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                  {/*Images*/}
                  {episodeData?.Photos < 5 && (
                    <section
                      style={{
                        padding: "24px",
                        width: "856px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "block",
                          marginBottom: "30px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "20px",
                            width: "808px",
                            height: "38.4px",
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
                              to={`#`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                color: "black",
                                cursor: "pointer",
                              }}
                              onMouseEnter={() => setHovered(true)}
                              onMouseLeave={() => setHovered(false)}
                            >
                              <h3
                                style={{
                                  padding: "0 0 0 10px",
                                  margin: 0,
                                  fontSize: "1.5rem",
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  letterSpacing: "normal",
                                  lineHeight: "1.2em",
                                  fontWeight: "600",
                                }}
                              >
                                Photos
                              </h3>
                            </Link>
                          </div>
                          <div
                            style={{
                              marginLeft: "auto",
                              display: "flex",
                              alignItems: "center",
                              color: "rgb(14,99,190)",
                              cursor: "pointer",
                              padding: "0 16px 0 16px",
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              class="ipc-icon ipc-icon--add ipc-btn__icon ipc-btn__icon--pre"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              role="presentation"
                              style={{
                                marginRight: "4px",
                              }}
                            >
                              <path d="M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z"></path>
                            </svg>
                            <span
                              style={{
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                lineHeight: "1.25rem",
                                letterSpacing: ".02em",
                                height: "24px",
                                display: "flex",
                                alignItems: "center",
                                position: "relative",
                                top: "1px",
                              }}
                            >
                              Add photo
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/*Stars*/}
                  {episodeData?.Sum > 0 && (
                    <section
                      style={{
                        padding: "24px",
                        width: "856px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "block",
                          marginBottom: "24px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "20px",
                            width: "808px",
                            height: "38.4px",
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
                              onMouseEnter={() => setHovered(true)}
                              onMouseLeave={() => setHovered(false)}
                            >
                              <h3
                                style={{
                                  padding: "0 0 0 10px",
                                  margin: 0,
                                  fontSize: "1.5rem",
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  letterSpacing: "normal",
                                  lineHeight: "1.2em",
                                  fontWeight: "600",
                                }}
                              >
                                Top Cast
                              </h3>
                              <span
                                style={{
                                  paddingLeft: "12px",
                                  color: "rgb(0,0,0,.54)",
                                  fontSize: "0.875rem",
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  fontWeight: "400",
                                  alignSelf: "center",
                                  letterSpacing: "0.01786em",
                                  lineHeight: "unset",
                                  marginRight: "2px",
                                }}
                              >
                                {episodeCast.length}
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
                                  color: hovered ? "#F5C518" : "rgba(0,0,0)",
                                  transition: "color 0.2s ease",
                                }}
                              >
                                <path d="M5.622.631A2.153 2.153 0 0 0 5 2.147c0 .568.224 1.113.622 1.515l8.249 8.34-8.25 8.34a2.16 2.16 0 0 0-.548 2.07c.196.74.768 1.317 1.499 1.515a2.104 2.104 0 0 0 2.048-.555l9.758-9.866a2.153 2.153 0 0 0 0-3.03L8.62.61C7.812-.207 6.45-.207 5.622.63z"></path>
                              </svg>
                            </Link>
                          </div>
                          <div
                            style={{
                              marginLeft: "auto",
                              display: "flex",
                              alignItems: "center",
                              color: "rgb(0,0,0,.54)",
                              cursor: "pointer",
                              padding: "0 16px 0 16px",
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              class="ipc-icon ipc-icon--edit ipc-responsive-button__icon"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              role="presentation"
                              style={{ marginRight: "4px" }}
                            >
                              <path fill="none" d="M0 0h24v24H0V0z"></path>
                              <path d="M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                            </svg>
                            <span
                              style={{
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                lineHeight: "1.25rem",
                                letterSpacing: ".02em",
                                height: "24px",
                                display: "flex",
                                alignItems: "center",
                                position: "relative",
                                top: "1px",
                              }}
                            >
                              Edit
                            </span>
                          </div>
                        </div>
                        <CastList cast={episodeCast} showEpisodes={false} />
                      </div>
                      <div
                        style={{
                          width: "808px",
                        }}
                      >
                        <div
                          style={{
                            borderTopWidth: "1px",
                            borderTopStyle: "solid",
                            borderColor: "rgb(0,0,0,0.12)",
                            display: "flex",
                            flexWrap: "wrap",
                            paddingBottom: "0.75rem",
                            paddingTop: "0.75rem",
                          }}
                        >
                          <span
                            style={{
                              paddingRight: "0.75rem",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              fontSize: "1rem",
                              lineHeight: "1.5rem",
                              letterSpacing: "0.00937em",
                              fontWeight: "600",
                            }}
                          >
                            Directors
                          </span>
                          <span
                            style={{
                              fontWeight: "400",
                              letterSpacing: "0.03125em",
                              wordBreak: "break-word",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              fontSize: "1rem",
                              lineHeight: "1.5rem",
                            }}
                          >
                            {renderListWithDotSeparator2(
                              episodeData?.Directors,
                            )}
                          </span>
                        </div>
                        <div
                          style={{
                            borderTopWidth: "1px",
                            borderTopStyle: "solid",
                            borderColor: "rgb(0,0,0,0.12)",
                            display: "flex",
                            flexWrap: "wrap",
                            paddingBottom: "0.75rem",
                            paddingTop: "0.75rem",
                          }}
                        >
                          <span
                            style={{
                              paddingRight: "0.75rem",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              fontSize: "1rem",
                              lineHeight: "1.5rem",
                              letterSpacing: "0.00937em",
                              fontWeight: "600",
                            }}
                          >
                            Writer
                          </span>
                          <span
                            style={{
                              fontWeight: "400",
                              letterSpacing: "0.03125em",
                              wordBreak: "break-word",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              fontSize: "1rem",
                              lineHeight: "1.5rem",
                            }}
                          >
                            {renderListWithDotSeparator2(episodeData?.Writers)}
                          </span>
                        </div>
                        <div
                          style={{
                            borderTopWidth: "1px",
                            borderTopStyle: "solid",
                            borderColor: "rgb(0,0,0,0.12)",
                            display: "flex",
                            flexWrap: "wrap",
                            paddingBottom: "0.75rem",
                            paddingTop: "0.75rem",
                          }}
                        >
                          <span
                            style={{
                              paddingRight: "0.75rem",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              fontSize: "1rem",
                              lineHeight: "1.5rem",
                              letterSpacing: "0.00937em",
                              fontWeight: "600",
                            }}
                          >
                            All cast & crew
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginLeft: "auto",
                            }}
                          >
                            <svg
                              style={{ color: "rgb(0,0,0,0.54)" }}
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              class="ipc-icon ipc-icon--chevron-right"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              role="presentation"
                            >
                              <path fill="none" d="M0 0h24v24H0V0z"></path>
                              <path d="M9.29 6.71a.996.996 0 0 0 0 1.41L13.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z"></path>
                            </svg>
                          </div>
                        </div>
                        <div
                          style={{
                            borderTopWidth: "1px",
                            borderBottomWidth: "1px",
                            borderTopStyle: "solid",
                            borderBottomStyle: "solid",
                            borderColor: "rgb(0,0,0,0.12)",
                            display: "flex",
                            flexWrap: "wrap",
                            paddingBottom: "0.75rem",
                            paddingTop: "0.75rem",
                          }}
                        >
                          <span
                            style={{
                              paddingRight: "0.75rem",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              fontSize: "1rem",
                              lineHeight: "1.5rem",
                              letterSpacing: "0.00937em",
                              fontWeight: "600",
                            }}
                          >
                            Production, box office & more at IMDbPro
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginLeft: "auto",
                            }}
                          >
                            <svg
                              style={{ color: "rgb(0,0,0,0.54)" }}
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              class="ipc-icon ipc-icon--launch"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              role="presentation"
                            >
                              <path d="M16 16.667H8A.669.669 0 0 1 7.333 16V8c0-.367.3-.667.667-.667h3.333c.367 0 .667-.3.667-.666C12 6.3 11.7 6 11.333 6h-4C6.593 6 6 6.6 6 7.333v9.334C6 17.4 6.6 18 7.333 18h9.334C17.4 18 18 17.4 18 16.667v-4c0-.367-.3-.667-.667-.667-.366 0-.666.3-.666.667V16c0 .367-.3.667-.667.667zm-2.667-10c0 .366.3.666.667.666h1.727L9.64 13.42a.664.664 0 1 0 .94.94l6.087-6.087V10c0 .367.3.667.666.667.367 0 .667-.3.667-.667V6h-4c-.367 0-.667.3-.667.667z"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/*User Reviews*/}
                  {userReviewsNumber > 0 && (
                    <section
                      style={{
                        padding: "24px",
                        width: "856px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "block",
                          marginBottom: "30px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "20px",
                            width: "808px",
                            height: "38.4px",
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
                              onMouseEnter={() => setHovered(true)}
                              onMouseLeave={() => setHovered(false)}
                            >
                              <h3
                                style={{
                                  padding: "0 0 0 10px",
                                  margin: 0,
                                  fontSize: "1.5rem",
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  letterSpacing: "normal",
                                  lineHeight: "1.2em",
                                  fontWeight: "600",
                                }}
                              >
                                User reviews
                              </h3>
                              <span
                                style={{
                                  paddingLeft: "12px",
                                  color: "rgb(0,0,0,.54)",
                                  fontSize: "0.875rem",
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  fontWeight: "400",
                                  alignSelf: "center",
                                  letterSpacing: "0.01786em",
                                  lineHeight: "unset",
                                  marginRight: "2px",
                                }}
                              >
                                {formatNumberNoRound(userReviewsNumber)}
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
                                  color: hovered ? "#F5C518" : "rgba(0,0,0)",
                                  transition: "color 0.2s ease",
                                }}
                              >
                                <path d="M5.622.631A2.153 2.153 0 0 0 5 2.147c0 .568.224 1.113.622 1.515l8.249 8.34-8.25 8.34a2.16 2.16 0 0 0-.548 2.07c.196.74.768 1.317 1.499 1.515a2.104 2.104 0 0 0 2.048-.555l9.758-9.866a2.153 2.153 0 0 0 0-3.03L8.62.61C7.812-.207 6.45-.207 5.622.63z"></path>
                              </svg>
                            </Link>
                          </div>
                          <div
                            style={{
                              marginLeft: "auto",
                              display: "flex",
                              alignItems: "center",
                              color: "rgb(14,99,190)",
                              cursor: "pointer",
                              padding: "0 8px 0 8px",
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              class="ipc-icon ipc-icon--add ipc-btn__icon ipc-btn__icon--pre"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              role="presentation"
                              style={{
                                marginRight: "4px",
                              }}
                            >
                              <path d="M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z"></path>
                            </svg>
                            <span
                              style={{
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                lineHeight: "1.25rem",
                                letterSpacing: ".02em",
                                height: "24px",
                                display: "flex",
                                alignItems: "center",
                                position: "relative",
                                top: "1px",
                              }}
                            >
                              Review
                            </span>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            width: "808px",
                            maxHeight: "84px",
                            alignItems: "stretch",
                            flexDirection: "row",
                            gap: "1.5rem",
                            marginBottom: "16px",
                          }}
                        >
                          <div
                            style={{
                              display: "block",
                              width: "max-content",
                              textAlign: "center",
                            }}
                          >
                            <span
                              style={{
                                display: "flex",
                                height: "max-content",
                                alignItems: "center",
                              }}
                            >
                              <svg
                                style={{
                                  color: "#f5c518",
                                  marginRight: "9px",
                                }}
                                width="60"
                                height="48"
                                xmlns="http://www.w3.org/2000/svg"
                                class="ipc-icon ipc-icon--star-inline"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                role="presentation"
                              >
                                <path d="M12 20.1l5.82 3.682c1.066.675 2.37-.322 2.09-1.584l-1.543-6.926 5.146-4.667c.94-.85.435-2.465-.799-2.567l-6.773-.602L13.29.89a1.38 1.38 0 0 0-2.581 0l-2.65 6.53-6.774.602C.052 8.126-.453 9.74.486 10.59l5.147 4.666-1.542 6.926c-.28 1.262 1.023 2.26 2.09 1.585L12 20.099z"></path>
                              </svg>
                              <span
                                style={{
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  fontSize: "3.75rem",
                                  fontWeight: "300",
                                  letterSpacing: "normal",
                                  lineHeight: "3.75rem",
                                }}
                              >
                                {episodeData?.["Average Rating 2"]}
                              </span>
                            </span>
                            <span
                              style={{
                                color: "rgb(0,0,0,0.54)",
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                                fontSize: "1rem",
                                fontWeight: "400",
                                lineHeight: "1.5rem",
                                letterSpacing: "0.03125em",
                                display: "flex",
                                alignContent: "center",
                                justifyContent: "center",
                                height: "24px",
                              }}
                            >
                              {formatToK(episodeData?.Votes2)}
                            </span>
                          </div>
                          <div>
                            {ratingsBreakdown && (
                              <RatingsBarChart ratings={ratingsBreakdown} />
                            )}
                          </div>
                        </div>

                        <div>
                          {userReviewsNumber > 2 && (
                            <div>
                              <h3
                                style={{
                                  margin: "0 0 0 0",
                                  fontSize: "1.5rem",
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  letterSpacing: "normal",
                                  lineHeight: "1.2em",
                                  fontWeight: "600",
                                }}
                              >
                                Featured reviews
                              </h3>
                              <img
                                src={FeaturedReviews}
                                alt=""
                                style={{
                                  marginLeft: "-24px",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                  )}

                  {/*Related Interests*/}
                  <section>
                    <img src={RelatedInterests} alt="" />
                  </section>

                  {/*Storyline*/}
                  <section
                    style={{
                      padding: "24px",
                      width: "856px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "block",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "20px",
                          width: "808px",
                          height: "38.4px",
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
                              padding: "0 0 0 10px",
                              margin: 0,
                              fontSize: "1.5rem",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              letterSpacing: "normal",
                              lineHeight: "1.2em",
                              fontWeight: "600",
                            }}
                          >
                            Storyline
                          </h3>
                        </div>
                        <div
                          style={{
                            marginLeft: "auto",
                            display: "flex",
                            alignItems: "center",
                            color: "rgb(0,0,0,.54)",
                            cursor: "pointer",
                            padding: "0 16px 0 16px",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            class="ipc-icon ipc-icon--edit ipc-responsive-button__icon"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            role="presentation"
                            style={{ marginRight: "4px" }}
                          >
                            <path fill="none" d="M0 0h24v24H0V0z"></path>
                            <path d="M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                          </svg>
                          <span
                            style={{
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              fontSize: "0.875rem",
                              fontWeight: "600",
                              lineHeight: "1.25rem",
                              letterSpacing: ".02em",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              position: "relative",
                              top: "1px",
                            }}
                          >
                            Edit
                          </span>
                        </div>
                      </div>
                      {episodeData?.Votes2 > 0 && (
                        <>
                          <div>
                            <span
                              style={{
                                color: "rgb(0,0,0,0.87)",
                                fontSize: "1rem",
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                                lineHeight: "1.5rem",
                                letterSpacing: "0.03125em",
                                fontWeight: "400",
                              }}
                            >
                              {data.Storyline}
                            </span>
                            —
                            <span
                              style={{
                                fontSize: "1rem",
                                lineHeight: "1.5rem",
                                letterSpacing: "0.03125em",
                                color: "rgb(14,99,190)",
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              }}
                            >
                              {data.StorylineAuthor}
                            </span>
                          </div>

                          <div
                            style={{
                              marginBottom: "16px",
                              width: "808px",
                              marginTop: "1rem",
                            }}
                          >
                            <PlotKeywords
                              keyword={data.PlotKeywords}
                              total={data.PlotKeywords2}
                            />
                          </div>
                        </>
                      )}
                      <div style={{ marginTop: "16px" }}>
                        <span
                          style={{
                            color: "rgb(14,99,190)",
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            fontSize: "1rem",
                            fontWeight: "400",
                            lineHeight: "1.5rem",
                            letterSpacing: "0.03125em",
                          }}
                        >
                          Plot summary
                        </span>
                        <span style={{ color: "black", margin: "0 6px" }}>
                          ·
                        </span>
                        <span
                          style={{
                            color: "rgb(14,99,190)",
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            fontSize: "1rem",
                            fontWeight: "400",
                            lineHeight: "1.5rem",
                            letterSpacing: "0.03125em",
                          }}
                        >
                          Plot synopsis
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        width: "808px",
                        marginTop: "1rem",
                      }}
                    >
                      <div
                        style={{
                          borderTopWidth: "1px",
                          borderTopStyle: "solid",
                          borderColor: "rgb(0,0,0,0.12)",
                          display: "flex",
                          flexWrap: "wrap",
                          paddingBottom: "0.75rem",
                          paddingTop: "0.75rem",
                        }}
                      >
                        <span
                          style={{
                            paddingRight: "0.75rem",
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            fontSize: "1rem",
                            lineHeight: "1.5rem",
                            letterSpacing: "0.00937em",
                            fontWeight: "600",
                          }}
                        >
                          Genres
                        </span>
                        <span
                          style={{
                            fontWeight: "400",
                            letterSpacing: "0.03125em",
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            fontSize: "1rem",
                            lineHeight: "1.5rem",
                          }}
                        >
                          {renderListWithDotSeparator2(data.Genres2)}
                        </span>
                      </div>
                      <div
                        style={{
                          borderTopWidth: "1px",
                          borderTopStyle: "solid",
                          borderColor: "rgb(0,0,0,0.12)",
                          display: "flex",
                          flexWrap: "wrap",
                          paddingBottom: "0.75rem",
                          paddingTop: "0.75rem",
                        }}
                      >
                        <span
                          style={{
                            paddingRight: "0.75rem",
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            fontSize: "1rem",
                            lineHeight: "1.5rem",
                            letterSpacing: "0.00937em",
                            fontWeight: "600",
                          }}
                        >
                          Certificate
                        </span>
                        <span
                          style={{
                            fontWeight: "400",
                            letterSpacing: "0.03125em",
                            wordBreak: "break-word",
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            fontSize: "1rem",
                            lineHeight: "1.5rem",
                          }}
                        >
                          {data.AgeRating}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "auto",
                          }}
                        >
                          <svg
                            style={{ color: "rgb(0,0,0,0.54)" }}
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            class="ipc-icon ipc-icon--chevron-right"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            role="presentation"
                          >
                            <path fill="none" d="M0 0h24v24H0V0z"></path>
                            <path d="M9.29 6.71a.996.996 0 0 0 0 1.41L13.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z"></path>
                          </svg>
                        </div>
                      </div>
                      <div
                        style={{
                          borderTopWidth: "1px",
                          borderBottomWidth: "1px",
                          borderTopStyle: "solid",
                          borderBottomStyle: "solid",
                          borderColor: "rgb(0,0,0,0.12)",
                          display: "flex",
                          flexWrap: "wrap",
                          paddingBottom: "0.75rem",
                          paddingTop: "0.75rem",
                        }}
                      >
                        <span
                          style={{
                            paddingRight: "0.75rem",
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            fontSize: "1rem",
                            lineHeight: "1.5rem",
                            letterSpacing: "0.00937em",
                            fontWeight: "600",
                          }}
                        >
                          Parents guide
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "auto",
                          }}
                        >
                          <svg
                            style={{ color: "rgb(0,0,0,0.54)" }}
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            class="ipc-icon ipc-icon--chevron-right"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            role="presentation"
                          >
                            <path fill="none" d="M0 0h24v24H0V0z"></path>
                            <path d="M9.29 6.71a.996.996 0 0 0 0 1.41L13.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </section>
                </section>

                {/*Did You Know*/}
                {episodeData?.Votes2 > 0 && (
                  <section
                    style={{
                      paddingBottom: "24px",
                      marginBottom: "8px",
                    }}
                  >
                    <img src={DidYouKnow} alt="" />
                  </section>
                )}

                {/*Details*/}
                <section
                  style={{
                    padding: "24px",
                    width: "856px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "block",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "20px",
                        width: "808px",
                        height: "38.4px",
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
                            padding: "0 0 0 10px",
                            margin: 0,
                            fontSize: "1.5rem",
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            letterSpacing: "normal",
                            lineHeight: "1.2em",
                            fontWeight: "600",
                          }}
                        >
                          Details
                        </h3>
                      </div>
                      <div
                        style={{
                          marginLeft: "auto",
                          display: "flex",
                          alignItems: "center",
                          color: "rgb(0,0,0,.54)",
                          cursor: "pointer",
                          padding: "0 16px 0 16px",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          class="ipc-icon ipc-icon--edit ipc-responsive-button__icon"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          role="presentation"
                          style={{ marginRight: "4px" }}
                        >
                          <path fill="none" d="M0 0h24v24H0V0z"></path>
                          <path d="M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                        </svg>
                        <span
                          style={{
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            lineHeight: "1.25rem",
                            letterSpacing: ".02em",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            position: "relative",
                            top: "1px",
                          }}
                        >
                          Edit
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      width: "808px",
                    }}
                  >
                    <div
                      style={{
                        borderTopWidth: "1px",
                        borderTopStyle: "solid",
                        borderColor: "rgb(0,0,0,0.12)",
                        display: "flex",
                        flexWrap: "wrap",
                        paddingBottom: "0.75rem",
                        paddingTop: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          paddingRight: "0.75rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          letterSpacing: "0.00937em",
                          fontWeight: "600",
                        }}
                      >
                        Release date
                      </span>
                      <span
                        style={{
                          fontWeight: "400",
                          letterSpacing: "0.03125em",
                          wordBreak: "break-word",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          color: "rgb(14,99,190)",
                        }}
                      >
                        {data.ReleaseDate} {"(United States)"}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginLeft: "auto",
                        }}
                      >
                        <svg
                          style={{ color: "rgb(0,0,0,0.54)" }}
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          class="ipc-icon ipc-icon--chevron-right"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          role="presentation"
                        >
                          <path fill="none" d="M0 0h24v24H0V0z"></path>
                          <path d="M9.29 6.71a.996.996 0 0 0 0 1.41L13.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z"></path>
                        </svg>
                      </div>
                    </div>
                    <div
                      style={{
                        borderTopWidth: "1px",
                        borderTopStyle: "solid",
                        borderColor: "rgb(0,0,0,0.12)",
                        display: "flex",
                        flexWrap: "wrap",
                        paddingBottom: "0.75rem",
                        paddingTop: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          paddingRight: "0.75rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          letterSpacing: "0.00937em",
                          fontWeight: "600",
                        }}
                      >
                        Countries of origin
                      </span>
                      <span
                        style={{
                          fontWeight: "400",
                          letterSpacing: "0.03125em",
                          wordBreak: "break-word",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          color: "rgb(14,99,190)",
                        }}
                      >
                        {renderListWithDotSeparator2(data.CountriesOrigin)}
                      </span>
                    </div>
                    <div
                      style={{
                        borderTopWidth: "1px",
                        borderTopStyle: "solid",
                        borderColor: "rgb(0,0,0,0.12)",
                        display: "flex",
                        flexWrap: "wrap",
                        paddingBottom: "0.75rem",
                        paddingTop: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          paddingRight: "0.75rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          letterSpacing: "0.00937em",
                          fontWeight: "600",
                        }}
                      >
                        Official sites
                      </span>
                      <span
                        style={{
                          fontWeight: "400",
                          letterSpacing: "0.03125em",
                          wordBreak: "break-word",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          color: "rgb(14,99,190)",
                        }}
                      >
                        Official Facebook
                        <svg
                          style={{ marginLeft: "0.4em" }}
                          width="10"
                          height="10"
                          xmlns="http://www.w3.org/2000/svg"
                          class="ipc-icon ipc-icon--launch-inline ipc-icon--inline ipc-link__launch-icon"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          role="presentation"
                        >
                          <path d="M21.6 21.6H2.4V2.4h7.2V0H0v24h24v-9.6h-2.4v7.2zM14.4 0v2.4h4.8L7.195 14.49l2.4 2.4L21.6 4.8v4.8H24V0h-9.6z"></path>
                        </svg>
                        <span style={{ color: "black", margin: "0 6px" }}>
                          ·
                        </span>
                        Official Instagram
                        <svg
                          style={{ marginLeft: "0.4em" }}
                          width="10"
                          height="10"
                          xmlns="http://www.w3.org/2000/svg"
                          class="ipc-icon ipc-icon--launch-inline ipc-icon--inline ipc-link__launch-icon"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          role="presentation"
                        >
                          <path d="M21.6 21.6H2.4V2.4h7.2V0H0v24h24v-9.6h-2.4v7.2zM14.4 0v2.4h4.8L7.195 14.49l2.4 2.4L21.6 4.8v4.8H24V0h-9.6z"></path>
                        </svg>
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginLeft: "auto",
                        }}
                      >
                        <svg
                          style={{ color: "rgb(0,0,0,0.54)" }}
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          class="ipc-icon ipc-icon--chevron-right"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          role="presentation"
                        >
                          <path fill="none" d="M0 0h24v24H0V0z"></path>
                          <path d="M9.29 6.71a.996.996 0 0 0 0 1.41L13.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z"></path>
                        </svg>
                      </div>
                    </div>
                    <div
                      style={{
                        borderTopWidth: "1px",
                        borderTopStyle: "solid",
                        borderColor: "rgb(0,0,0,0.12)",
                        display: "flex",
                        flexWrap: "wrap",
                        paddingBottom: "0.75rem",
                        paddingTop: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          paddingRight: "0.75rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          letterSpacing: "0.00937em",
                          fontWeight: "600",
                        }}
                      >
                        Language
                      </span>
                      <span
                        style={{
                          fontWeight: "400",
                          letterSpacing: "0.03125em",
                          wordBreak: "break-word",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          color: "rgb(14,99,190)",
                        }}
                      >
                        {data.Language}
                      </span>
                    </div>
                    <div
                      style={{
                        borderTopWidth: "1px",
                        borderTopStyle: "solid",
                        borderColor: "rgb(0,0,0,0.12)",
                        display: "flex",
                        flexWrap: "wrap",
                        paddingBottom: "0.75rem",
                        paddingTop: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          paddingRight: "0.75rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          letterSpacing: "0.00937em",
                          fontWeight: "600",
                        }}
                      >
                        Also known as
                      </span>
                      <span
                        style={{
                          fontWeight: "400",
                          letterSpacing: "0.03125em",
                          wordBreak: "break-word",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          color: "rgb(14,99,190)",
                        }}
                      >
                        {data.AlsoKnownAs}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginLeft: "auto",
                        }}
                      >
                        <svg
                          style={{ color: "rgb(0,0,0,0.54)" }}
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          class="ipc-icon ipc-icon--chevron-right"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          role="presentation"
                        >
                          <path fill="none" d="M0 0h24v24H0V0z"></path>
                          <path d="M9.29 6.71a.996.996 0 0 0 0 1.41L13.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z"></path>
                        </svg>
                      </div>
                    </div>
                    <div
                      style={{
                        borderTopWidth: "1px",
                        borderTopStyle: "solid",
                        borderColor: "rgb(0,0,0,0.12)",
                        display: "flex",
                        flexWrap: "wrap",
                        paddingBottom: "0.75rem",
                        paddingTop: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          paddingRight: "0.75rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          letterSpacing: "0.00937em",
                          fontWeight: "600",
                        }}
                      >
                        Production companies
                      </span>
                      <span
                        style={{
                          fontWeight: "400",
                          letterSpacing: "0.03125em",
                          wordBreak: "break-word",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          color: "rgb(14,99,190)",
                        }}
                      >
                        {renderListWithDotSeparator2(data.ProductionCompanies)}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginLeft: "auto",
                        }}
                      >
                        <svg
                          style={{ color: "rgb(0,0,0,0.54)" }}
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          class="ipc-icon ipc-icon--chevron-right"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          role="presentation"
                        >
                          <path fill="none" d="M0 0h24v24H0V0z"></path>
                          <path d="M9.29 6.71a.996.996 0 0 0 0 1.41L13.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z"></path>
                        </svg>
                      </div>
                    </div>
                    <div
                      style={{
                        borderTopWidth: "1px",
                        borderBottomWidth: "1px",
                        borderTopStyle: "solid",
                        borderBottomStyle: "solid",
                        borderColor: "rgb(0,0,0,0.12)",
                        display: "flex",
                        flexWrap: "wrap",
                        paddingBottom: "0.75rem",
                        paddingTop: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          paddingRight: "0.75rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          letterSpacing: "0.00937em",
                          fontWeight: "600",
                        }}
                      >
                        See more company credits at IMDbPro
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginLeft: "auto",
                        }}
                      >
                        <svg
                          style={{ color: "rgb(0,0,0,0.54)" }}
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          class="ipc-icon ipc-icon--launch"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          role="presentation"
                        >
                          <path d="M16 16.667H8A.669.669 0 0 1 7.333 16V8c0-.367.3-.667.667-.667h3.333c.367 0 .667-.3.667-.666C12 6.3 11.7 6 11.333 6h-4C6.593 6 6 6.6 6 7.333v9.334C6 17.4 6.6 18 7.333 18h9.334C17.4 18 18 17.4 18 16.667v-4c0-.367-.3-.667-.667-.667-.366 0-.666.3-.666.667V16c0 .367-.3.667-.667.667zm-2.667-10c0 .366.3.666.667.666h1.727L9.64 13.42a.664.664 0 1 0 .94.94l6.087-6.087V10c0 .367.3.667.666.667.367 0 .667-.3.667-.667V6h-4c-.367 0-.667.3-.667.667z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </section>

                {/*Tech Specs*/}
                <section
                  style={{
                    padding: "24px",
                    width: "856px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "block",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "20px",
                        width: "808px",
                        height: "38.4px",
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
                          onMouseEnter={() => setHovered(true)}
                          onMouseLeave={() => setHovered(false)}
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
                            Tech specs
                          </h3>
                          <span
                            style={{
                              paddingLeft: "2px",
                              color: "rgb(0,0,0,.54)",
                              fontSize: "0.875rem",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              fontWeight: "400",
                              alignSelf: "center",
                              letterSpacing: "0.01786em",
                              lineHeight: "unset",
                              marginRight: "2px",
                            }}
                          ></span>
                          <svg
                            width="19.2"
                            height="19.2"
                            xmlns="http://www.w3.org/2000/svg"
                            class="ipc-icon ipc-icon--chevron-right-inline ipc-icon--inline ipc-title-link ipc-title-link-chevron"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            role="presentation"
                            style={{
                              color: hovered ? "#F5C518" : "rgba(0,0,0)",
                              transition: "color 0.2s ease",
                            }}
                          >
                            <path d="M5.622.631A2.153 2.153 0 0 0 5 2.147c0 .568.224 1.113.622 1.515l8.249 8.34-8.25 8.34a2.16 2.16 0 0 0-.548 2.07c.196.74.768 1.317 1.499 1.515a2.104 2.104 0 0 0 2.048-.555l9.758-9.866a2.153 2.153 0 0 0 0-3.03L8.62.61C7.812-.207 6.45-.207 5.622.63z"></path>
                          </svg>
                        </Link>
                      </div>
                      <div
                        style={{
                          marginLeft: "auto",
                          display: "flex",
                          alignItems: "center",
                          color: "rgb(0,0,0,.54)",
                          cursor: "pointer",
                          padding: "0 16px 0 16px",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          class="ipc-icon ipc-icon--edit ipc-responsive-button__icon"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          role="presentation"
                          style={{ marginRight: "4px" }}
                        >
                          <path fill="none" d="M0 0h24v24H0V0z"></path>
                          <path d="M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                        </svg>
                        <span
                          style={{
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            lineHeight: "1.25rem",
                            letterSpacing: ".02em",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            position: "relative",
                            top: "1px",
                          }}
                        >
                          Edit
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      width: "808px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        paddingBottom: "0.25rem",
                        paddingTop: "0.25rem",
                      }}
                    >
                      <span
                        style={{
                          paddingRight: "0.75rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          letterSpacing: "0.00937em",
                          fontWeight: "600",
                        }}
                      >
                        Runtime
                      </span>
                      <span
                        style={{
                          fontWeight: "400",
                          letterSpacing: "0.03125em",
                          wordBreak: "break-word",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                        }}
                      >
                        {episodeData?.epDuration}m
                      </span>
                      {episodeData?.epDuration > 60 && (
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            color: "rgb(0,0,0,.54)",
                            fontWeight: "400",
                            letterSpacing: "0.03125",
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            fontSize: "1rem",
                            lineHeight: "1.5rem",
                          }}
                        >
                          ({episodeData?.epDuration2})
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        paddingBottom: "0.25rem",
                        paddingTop: "0.25rem",
                      }}
                    >
                      <span
                        style={{
                          paddingRight: "0.75rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          letterSpacing: "0.00937em",
                          fontWeight: "600",
                        }}
                      >
                        Color
                      </span>
                      <span
                        style={{
                          fontWeight: "400",
                          letterSpacing: "0.03125em",
                          wordBreak: "break-word",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          color: "rgb(14,99,190)",
                        }}
                      >
                        Color
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        paddingBottom: "0.25rem",
                        paddingTop: "0.25rem",
                      }}
                    >
                      <span
                        style={{
                          paddingRight: "0.75rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          letterSpacing: "0.00937em",
                          fontWeight: "600",
                        }}
                      >
                        Sound mix
                      </span>
                      <span
                        style={{
                          fontWeight: "400",
                          letterSpacing: "0.03125em",
                          wordBreak: "break-word",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          color: "rgb(14,99,190)",
                        }}
                      >
                        Dolby Digital
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        paddingBottom: "0.25rem",
                        paddingTop: "0.25rem",
                      }}
                    >
                      <span
                        style={{
                          paddingRight: "0.75rem",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          letterSpacing: "0.00937em",
                          fontWeight: "600",
                        }}
                      >
                        Aspect ratio
                      </span>
                      <span
                        style={{
                          fontWeight: "400",
                          letterSpacing: "0.03125em",
                          wordBreak: "break-word",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                        }}
                      >
                        2.35 : 1
                      </span>
                    </div>
                  </div>
                </section>

                {/*Contribute to this page*/}
                <section>
                  <img src={ContributeToThisPageEpisodePage} alt="" />
                </section>
              </div>

              {/* Aside */}
              <div
                style={{
                  padding: "24px 0 24px 12px",
                  display: "block",
                  width: "412px",
                  position: "relative",
                }}
              >
                <img
                  src={MoreToExplore}
                  alt=""
                  style={{
                    width: "364px",
                    height: "max-content",
                    margin: "0 24px 0 24px",
                  }}
                />
                <img
                  src={MoreToExploreSticky}
                  alt=""
                  style={{
                    width: "412px",
                    position: "sticky",
                    top: "0px",
                    marginBottom: "23rem",
                  }}
                />
              </div>
            </div>
          </div>
        </main>
        <div style={{ backgroundColor: "black" }}>
          <img src={Footer1} alt="" style={{ position: "relative" }} />
          <img src={Footer2} alt="" />
        </div>
      </div>
    </>
  );
}

export default SeriesPageDetails;
