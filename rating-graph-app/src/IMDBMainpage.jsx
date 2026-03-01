import React, { useEffect, useState, useRef, useMemo } from "react";
import Papa from "papaparse";
import { createGlobalStyle } from "styled-components";
import { ChevronRight, ChevronDown, MilkIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  getShowCoverSrc,
  getTrailerSrc,
  getVideoThumbnail,
} from "./ShowImageSrc";

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

import IMDBPro from "./imgs/imdb/imdbpro.png";

import SmallArrowUp from "./imgs/imdb/smallarrowup.png";

import MarkedWatched from "./imgs/imdb/markwatched.png";

//More to Explore
import MoreToExplore from "./imgs/imdb/moretoexplore.png";

//Small Icon
import SmallIcon from "./imgs/imdb/smallicon.png";

//Footer
import Footer1 from "./imgs/imdb/footer1.png";
import Footer2 from "./imgs/imdb/footer2.png";

import NextEpisode from "./components/NextEpisode.jsx";
import RecentAndTopEpisodes from "./components/RecentandTopEpisodes.jsx";
import CastList from "./components/CastList.jsx";
import RatingsBarChart from "./components/RatingsBarChart.jsx";
import ThemesChips from "./components/ThemeChips.jsx";
import PlotKeywords from "./components/PlotKeywords.jsx";

import FeaturedReviews from "./imgs/imdb/featuredreviews.png";
import MoreLikeThis from "./imgs/imdb/morelikethis.png";
import RelatedInterests from "./imgs/imdb/relatedinterests.png";
import DidYouKnow from "./imgs/imdb/didyouknow.png";
import TopPicks from "./imgs/imdb/toppicks.png";
import RelatedNews from "./imgs/imdb/relatednews.png";
import ContributeToThisPage from "./imgs/imdb/contributetothispage.png";
import MoreToExploreSticky from "./imgs/imdb/moretoexploresticky.png";

//Data
import { movieMap } from "./data/MovieMap";

function SeriesPage() {
  const { movieId, episodeId } = useParams();
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
  const [videos, setVideos] = useState([]);
  const [allImages, setAllImages] = React.useState([]);

  const urls = movieMap[movieId];

  useEffect(() => {
    // Buscar e parsear CSV
    fetch(urls[6])
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true }).data;
        console.log("CSV completo:", parsed); // <--- Mostra tudo que vem do CSV

        // Filtra apenas os vídeos do movieId atual
        const filtered = parsed.filter(
          (v) => v.movieId === movieId || v.movieId === undefined,
        );
        console.log("Vídeos filtrados para movieId:", movieId, filtered); // <--- Mostra os vídeos que vão ser renderizados

        setVideos(filtered);
      })
      .catch((err) => console.error("Erro ao carregar vídeos:", err));
  }, [movieId]);

  useEffect(() => {
    if (!urls || urls.length < 5) return;

    fetch(urls[4]) // 👈 índice das Stars
      .then((res) => res.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
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
          },
          error: (err) => console.error("Erro episódios CSV", err),
        });
      });
  }, [movieId]);

  function parseEpisodeDate(dateStr) {
  if (!dateStr) return null;

  // Se for apenas ano (ex: "2026")
  if (/^\d{4}$/.test(dateStr)) {
    return new Date(`${dateStr}-12-31`);
  }

  return new Date(dateStr);
}

useEffect(() => {
  if (!allEpisodes.length) return;

  const now = new Date();

  const futureEpisodes = allEpisodes
    .map((ep) => {
      const parsedDate = parseEpisodeDate(ep.Date);
      return { ...ep, parsedDate };
    })
    .filter((ep) => ep.parsedDate && ep.parsedDate > now)
    .sort((a, b) => a.parsedDate - b.parsedDate);

  setNextEpisode(futureEpisodes[0] || null);
}, [allEpisodes]);

  useEffect(() => {
    if (!allEpisodes.length) return;

    const now = new Date();
    const daysAgo30 = new Date(now);
    daysAgo30.setDate(now.getDate() - 30);

const validEpisodes = allEpisodes.filter((ep) => {
  const parsedDate = parseEpisodeDate(ep.Date);

  const rating = parseFloat(ep["Average Rating 2"]);
  const votes = parseInt(ep.Votes2);
  const hasSynopsis = ep.Synopsis?.trim();

  return (
    parsedDate &&
    !isNaN(parsedDate) &&
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
        .filter((ep) => ep.parsedDate >= daysAgo30)
        .sort((a, b) => b.parsedDate - a.parsedDate)[0] ||
      validEpisodes.sort((a, b) => b.parsedDate - a.parsedDate)[0];

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

  const ratingsBreakdown = React.useMemo(() => {
    if (!data) return null;

    const result = {};

    Object.keys(data).forEach((key) => {
      const trimmedKey = key.trim();

      // só aceita "1" até "10"
      if (/^(10|[1-9])$/.test(trimmedKey)) {
        const value = Number(String(data[key]).replace(/[^\d]/g, ""));

        result[trimmedKey] = isNaN(value) ? 0 : value;
      }
    });

    // garante que todos existem
    for (let i = 1; i <= 10; i++) {
      if (!(i in result)) result[i] = 0;
    }

    return result;
  }, [data]);

  // Load cover and trailer images dynamically
  useEffect(() => {
    const loadImages = async () => {
      if (movieId) {
        const cover = await getShowCoverSrc(movieId);
        const trailer = await getTrailerSrc(movieId);
        setCoverSrc(cover);
        setTrailerSrc(trailer);
      }
    };
    loadImages();
  }, [movieId]);

  console.log("movieId da URL:", movieId);
  console.log(
    "Filmes disponíveis:",
    movies.map((m) => m.id),
  );

  useEffect(() => {
    fetch(`https://backend-ratinggraph.onrender.com/api/all-images/${movieId}`) // ou URL do Render
      .then((res) => res.json())
      .then((data) => {
        console.log("Imagens do backend:", data); // <--- veja no console
        if (data?.images) setAllImages(data.images);
      });
  }, []);

  const sortedImages = useMemo(() => {
    return [...allImages].sort((a, b) => b.publicId.localeCompare(a.publicId));
  }, [allImages]);

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
    Number(data.UserReviews?.toString().replace(/[,]+/g, "")) || 0;
  const criticReviewsNumber =
    Number(data.CriticReviews?.toString().replace(/[,]+/g, "")) || 0;
  const metascoreReviewsNumber =
    Number(data.Metascore?.toString().replace(/[,]+/g, "")) || 0;
  const isMovie = data.Type === "Movie";
  const isTVShow = data.Type === "TV Series" || data.Type === "TV Mini Series";

const getPluralLabel = (text, singular, plural) => {
  if (!text) return singular;

  const items = text
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);

  return items.length > 1 ? plural : singular;
};

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
                {isTVShow && (
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
                    {data.Type === "TV Series" && `—${data.EndingYear || ""}`}
                    <span style={{ fontWeight: "bold", margin: "0 7px" }}>
                      ·
                    </span>
                    {data.AgeRating}
                    {!isMovie && (
                      <>
                        {hasVotes && (
                          <div>
                            <span
                              style={{ fontWeight: "bold", margin: "0 7px" }}
                            >
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
                    top: "-10px",
                  }}
                >
                  {hasVotes && (
                    <div
                      style={{
                        padding: "4px",
                        marginRight: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <img
                        src={IMDBRating}
                        alt=""
                        style={{
                          marginBottom: "7px",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          padding: "0 8px 0 8px",
                        }}
                      >
                        <img
                          src={StarImdb}
                          alt=""
                          width={32}
                          height={32}
                          style={{
                            marginRight: "0.25rem",
                            position: "relative",
                            top: "-1px",
                            left: "1px",
                          }}
                        />
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
                                color: "white",
                                letterSpacing: "0.0125em",
                                fontWeight: "600",
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                                paddingRight: "0.125rem",
                                lineHeight: "1.5rem",
                              }}
                            >
                              {data.Rating}
                            </span>
                            <span
                              style={{
                                color: "rgb(255,255,255,0.7)",
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
                              color: "#BCBCBC",
                              position: "relative",
                              letterSpacing: "0.03333em",
                              lineHeight: "1rem",
                              fontWeight: "400",
                              WebkitTextStroke: "0.1px #BCBCBC",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            }}
                          >
                            {formatVotes(data.Votes) || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {hasVotes && (
                    <div
                      style={{
                        padding: "4px",
                        marginRight: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <img
                        src={YourRating}
                        alt=""
                        style={{
                          marginBottom: "7px",
                        }}
                      />
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

                  <Link
                    to={"https://www.imdb.com/chart/tvmeter/?ref_=tt_ov_pop"}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <img
                        src={Popularity}
                        alt=""
                        style={{
                          display: "flex",
                          paddingBottom: "7px",
                          alignContent: "center",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          position: "relative",
                          top: "-1.5px",
                          padding: "0 8px",
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
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            letterSpacing: "0.0125em",
                            paddingRight: "0.125rem",
                            color: "white",
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
                              width: "24px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: "-0.25rem",
                            }}
                          >
                            <img
                              src={SmallArrowUp}
                              alt=""
                              style={{
                                width: "8px",
                                position: "relative",
                                top: data.PopStatus === "down" ? "1px" : "0px",
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
                              color: "rgba(255,255,255,0.7)",
                              letterSpacing: "0.03125em",
                              fontSize: "1rem",
                              fontWeight: "500",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              position: "relative",
                              lineHeight: "1.5rem",
                              top: "1px",
                            }}
                          >
                            {data.PopUp}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
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
                    src={coverSrc}
                    alt=""
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
                    src={trailerSrc}
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
                      (e.currentTarget.style.backgroundColor =
                        "rgba(0,0,0,0.5)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgba(0,0,0,0.3)")
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
                            border: "3px solid white", // borda branca
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            filter: "drop-shadow(0 0 4px rgba(0,0,0,0.7))",
                            transition: "background-color 0.3s ease",
                            position: "relative",
                            top: "0px",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="150"
                            height="150"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            role="presentation"
                            style={{
                              transform: "rotate(-90deg)",
                              color: "white",
                            }}
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
                            top: "-1px",
                            left: "-4px",
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          }}
                        >
                          Play trailer
                        </span>
                        <span
                          style={{
                            color: "white",
                            position: "relative",
                            top: "2px",
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
                      style={{ width: "32px", marginBottom: 14 }}
                    />
                    <br />
                    <p
                      style={{
                        fontSize: "0.75rem",
                        letterSpacing: "0.16667em",
                        position: "relative",
                        top: "-9px",
                        fontWeight: "600",
                        fontFamily: "Roboto,Helvetica,Arial,sans-serif",
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
                      style={{ width: "32px", marginBottom: 14 }}
                    />
                    <br />
                    <p
                      style={{
                        fontSize: "0.75rem",
                        letterSpacing: "0.16667em",
                        position: "relative",
                        top: "-9px",
                        fontWeight: "600",
                        fontFamily: "Roboto,Helvetica,Arial,sans-serif",
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
                  paddingBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "813.25px",
                    paddingLeft: "24px",
                    marginTop: "10px",
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
                  <div
                    style={{
                      marginTop: "5px",
                      color: "white",
                      borderBottom: "1px solid #4B4B4B",
                      paddingBottom: "12px",
                    }}
                  >
                    {data.Synopsis}
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
                      {getPluralLabel(data.Creators, "Creator", "Creators")}
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
                      {renderListWithDotSeparator(data.Creators)}
                    </p>
                  </div>
                  {!isTVShow && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        borderBottom: "1px solid #4B4B4B",
                        lineHeight: "1",
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
                        {getPluralLabel(data.Writers, "Writer", "Writers")}
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
                        {renderListWithDotSeparator(data.Writers)}
                      </p>
                    </div>
                  )}
                  {data.Cast > 0 && (<>
                  {Array.isArray(cast) &&
                    cast.length > 0 &&
                    (() => {
                      const topThree = cast.slice(0, 3);
                      const hasMoreThanThree = cast.length > 3;
                      return (
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
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  fontSize: "1rem",
                                  lineHeight: "1.5rem",
                                  letterSpacing: "0.00937em",
                                  fontWeight: "600",
                                  color: "white",
                                }}
                              >
                                {hasMoreThanThree ? "Stars" : "Star"}
                              </p>
                              <p
                                style={{
                                  fontWeight: "400",
                                  letterSpacing: "0.03125em",
                                  wordBreak: "break-word",
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  fontSize: "1rem",
                                  color: "#5799ef",
                                }}
                              >
                                {renderListWithDotSeparator(
                                  topThree.map((actor) => actor.Name),
                                )}
                              </p>
                            </div>
                            {hasMoreThanThree && (
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
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    </>)}
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
                    left: "-24px",
                    alignContent: "center",
                    marginTop: "5px",
                  }}
                >
                  {isTVShow && data.NextEpisode?.trim() ? (
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
                          {Number(data.NextEpisodeSeason) === 1 &&
                          Number(data.NextEpisodeNumber) === 1
                            ? "SERIES PREMIERE"
                            : Number(data.NextEpisodeNumber) === 1
                              ? `SEASON ${Number(data.NextEpisodeSeason)} PREMIERE`
                              : "NEXT EPISODE"}
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
                          {data.NextEpisode}
                        </p>
                      </div>
                    </div>
                  ) : isTVShow && data.NextEpisode2?.trim() ? (
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
                          {Number(data.NextEpisodeSeason) === 1 &&
                          Number(data.NextEpisodeNumber) === 1
                            ? "SERIES PREMIERE"
                            : Number(data.NextEpisodeNumber) === 1
                              ? `SEASON ${Number(data.NextEpisodeSeason)} PREMIERE`
                              : "NEXT EPISODE"}
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
                          {data.NextEpisode2}
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
                  {data.Status > 0 && (
                    <div>
                      <div style={{ width: "118.333px" }}>
                        <p
                          style={{
                            margin: "0 0 0.25rem 0",
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            fontWeight: "600",
                            letterSpacing: "0.16667em",
                            lineHeight: "1rem",
                            textTransform: "uppercase",
                            fontSize: "0.625rem",
                            color: "rgb(245,197,24)",
                            height: "1rem",
                            overflow: "hidden",
                            textWrap: "nowrap",
                            textOverflow: "ellipsis",
                          }}
                        >
                          STREAMING
                        </p>
                        <img
                          width="116.333px"
                          height="65.4333px"
                          src={SmallIcon}
                          alt=""
                          style={{ marginBottom: "-6px", marginTop: "1px" }}
                        />
                        <p
                          style={{
                            color: "rgb(255,255,255,0.7)",
                            fontSize: "0.625rem",
                            lineHeight: "1rem",
                            textAlign: "center",
                            margin: "0",
                          }}
                        >
                          {data.Streaming}
                        </p>
                      </div>
                      <div
                        style={{
                          marginBottom: "24px",
                          padding: "0 16px 0 16px",
                          color: "rgb(87,153,239)",
                          display: "flex",
                          alignItems: "center",
                          height: "36px",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          class="ipc-icon ipc-icon--settings ipc-btn__icon ipc-btn__icon--pre"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          role="presentation"
                          style={{
                            position: "relative",
                            right: "6px",
                          }}
                        >
                          <path fill="none" d="M0 0h24v24H0V0z"></path>
                          <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.488.488 0 0014 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path>
                        </svg>
                        <span
                          style={{
                            cursor: "pointer",
                            fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            lineHeight: "1.25rem",
                            letterSpacing: "0.02em",
                            textTransform: "none",
                            position: "relative",
                            right: "2px",
                          }}
                        >
                          Set your preferred services
                        </span>
                      </div>
                    </div>
                  )}
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
                        Added by {formatNumberWatchList(data.WatchlistNumber)}{" "}
                        users
                      </p>
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
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
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
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
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
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
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
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
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
                                <span style={{ fontSize: "14px" }}>
                                  Metascore
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
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
                  {/*Top Rated */}
                  {(data.TopRatedPos < 250 ||
                    data.AwardsWon > 0 ||
                    data.AwardsNom > 0 ||
                    data.Wins > 0 ||
                    data.Nom > 0) && (
                    <section
                      style={{
                        paddingTop: "24px",
                        paddingBottom: "24px",
                        width: "856px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "806px",
                          marginLeft: "24px",
                          marginRight: "24px",
                          borderWidth: "1px",
                          borderStyle: "solid",
                          borderRadius: "4px",
                          borderImage: "none",
                          borderColor: "rgb(245, 197, 24)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {data.TopRatedPos < 250 && (
                          <div
                            style={{
                              backgroundColor: "rgba(245, 197, 24)",
                              height: "49.2833px",
                              width: "max-content",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <a
                              href="https://www.imdb.com/chart/toptv/?ref_=tt_awd"
                              style={{
                                color: "black",
                                textDecoration: "none",
                                fontSize: "1rem",
                                fontWeight: "600",
                                letterSpacing: "0.00937em",
                                lineHeight: "1.25rem",
                                textTransform: "none",
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                                padding: "12px 7.5px 12px 12px",
                                zIndex: 1,
                                width: "max-content",
                              }}
                            >
                              {" "}
                              Top rated TV #{data.TopRatedPos}
                            </a>
                          </div>
                        )}

                        {data.TopRatedPos > 250 && (
                          <div
                            style={{
                              backgroundColor: "rgba(245, 197, 24)",
                              height: "49.2833px",
                              minWidth: "24px",
                              width: "max-content",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <a
                              href="https://www.imdb.com/chart/toptv/?ref_=tt_awd"
                              style={{
                                color: "black",
                                textDecoration: "none",
                                fontSize: "1rem",
                                fontWeight: "600",
                                letterSpacing: "0.00937em",
                                lineHeight: "1.25rem",
                                textTransform: "none",
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                                padding: "12px 7.5px 12px 12px",
                                zIndex: 1,
                                width: "max-content",
                              }}
                            ></a>
                          </div>
                        )}

                        <div
                          style={{
                            aspectRatio: "0.364 / 1",
                            height: "49.283px",
                            backgroundColor: "rgb(245,197,24)",
                            transform: "skewX(-20deg) translateX(-50%)",
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "625.867px",
                          }}
                        >
                          <div
                            style={{
                              paddingLeft: "1rem",
                              display: "flex",
                              paddingTop: "12px",
                              paddingBottom: "12px",
                              paddingRight: "26px",
                              alignItems: "end",
                            }}
                          >
                            {(data.AwardsWon > 0 ||
                              data.AwardsNom > 0 ||
                              data.Wins > 0 ||
                              data.Nom > 0) && (
                              <div>
                                {data.AwardsWon > 0 && (
                                  <a
                                    href=""
                                    style={{
                                      cursor: "pointer",
                                      color: "black",
                                      fontFamily:
                                        "Roboto,Helvetica,Arial,sans-serif",
                                      paddingRight: "0.75rem",
                                      textAlign: "start",
                                      fontWeight: "600",
                                      letterSpacing: "0.00937em",
                                      fontSize: "1rem",
                                      lineHeight: "1.5rem",
                                    }}
                                  >
                                    Won {data.AwardsWon} Primetime Emmy
                                    {data.AwardsWon > 1 ? "s" : ""}
                                  </a>
                                )}

                                {data.AwardsWon < 1 && data.AwardsNom > 0 && (
                                  <a
                                    href=""
                                    style={{
                                      cursor: "pointer",
                                      color: "black",
                                      fontFamily:
                                        "Roboto,Helvetica,Arial,sans-serif",
                                      paddingRight: "0.75rem",
                                      textAlign: "start",
                                      fontWeight: "600",
                                      letterSpacing: "0.00937em",
                                      fontSize: "1rem",
                                      lineHeight: "1.5rem",
                                    }}
                                  >
                                    Nominated for {data.AwardsNom} Primetime
                                    Emmy
                                    {data.AwardsNom > 1 ? "s" : ""}
                                  </a>
                                )}

                                {data.AwardsWon < 1 && data.AwardsNom < 1 && (
                                  <a
                                    href=""
                                    style={{
                                      cursor: "pointer",
                                      color: "black",
                                      fontFamily:
                                        "Roboto,Helvetica,Arial,sans-serif",
                                      paddingRight: "0.75rem",
                                      textAlign: "start",
                                      fontWeight: "600",
                                      letterSpacing: "0.00937em",
                                      fontSize: "1rem",
                                      lineHeight: "1.5rem",
                                    }}
                                  >
                                    Awards
                                  </a>
                                )}
                              </div>
                            )}
                            <div style={{ cursor: "pointer" }}>
                              {data.Wins > 0 && data.Nom > 0 ? (
                                <a
                                  style={{
                                    textDecoration: "none",
                                    color: "black",
                                    cursor: "pointer",
                                    letterSpacing: "0.03125em",
                                    fontWeight: "400",
                                    fontFamily:
                                      "Roboto,Helvetica,Arial,sans-serif",
                                  }}
                                >
                                  {data.Wins} win{data.Wins > 1 ? "s" : ""} &{" "}
                                  {data.Nom} nomination{data.Nom > 1 ? "s" : ""}{" "}
                                  total
                                </a>
                              ) : data.Wins > 0 ? (
                                <a
                                  style={{
                                    textDecoration: "none",
                                    color: "black",
                                    cursor: "pointer",
                                    letterSpacing: "0.03125em",
                                    fontWeight: "400",
                                    fontFamily:
                                      "Roboto,Helvetica,Arial,sans-serif",
                                  }}
                                >
                                  {data.Wins} win{data.Wins > 1 ? "s" : ""}{" "}
                                  total
                                </a>
                              ) : data.Nom > 0 ? (
                                <a
                                  style={{
                                    textDecoration: "none",
                                    color: "black",
                                    cursor: "pointer",
                                    letterSpacing: "0.03125em",
                                    fontWeight: "400",
                                    fontFamily:
                                      "Roboto,Helvetica,Arial,sans-serif",
                                  }}
                                >
                                  {data.Nom} nomination{data.Nom > 1 ? "s" : ""}{" "}
                                  total
                                </a>
                              ) : null}
                            </div>
                            {[
                              data.AwardsWon,
                              data.AwardsNom,
                              data.Wins,
                              data.Nom,
                            ]
                              .map(Number)
                              .every((value) => value === 0) && (
                              <div>
                                <span
                                  style={{
                                    fontWeight: "400",
                                    letterSpacing: "0.03125em",
                                    wordBreak: "break-word",
                                    fontFamily:
                                      "Roboto,Helvetica,Arial,sans-serif",
                                    fontSize: "1rem",
                                    textTransform: "none",
                                    lineHeight: "1.5rem",
                                    cursor: "pointer",
                                  }}
                                >
                                  See the Top 250 TV shows as rated by IMDb
                                  users
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
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
                    </section>
                  )}

                  {/*Episodes*/}
                  <section
                    style={{
                      padding: "24px",
                      width: "856px",
                      marginBottom: "8px",
                    }}
                  >
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
                            Episodes
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
                            {data.Episodes}
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
                    </div>
                    <NextEpisode
                      nextEpisode={nextEpisode}
                      coverSrc={coverSrc}
                    />
                    <RecentAndTopEpisodes episodes={allEpisodes} />
                    <div
                      style={{
                        marginTop: "20px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          marginRight: "12px",
                          color: "black",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          letterSpacing: "0.16667em",
                          lineHeight: "1rem",
                          textTransform: "uppercase",
                        }}
                      >
                        Browse episodes
                      </span>
                      {data.Status != 0 && (
                      <span
                        style={{
                          padding: "0 12px 0 12px",
                          cursor: "pointer",
                          color: "rgb(14,99,190)",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          lineHeight: "1.25rem",
                          letterSpacing: "0.02em",
                        }}
                      >
                        Top-rated
                      </span>
                      )}
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0 12px 0 12px",
                          cursor: "pointer",
                          color: "rgb(14,99,190)",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          lineHeight: "1.25rem",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {data.Seasons} season{data.Seasons > 1 ? "s" : ""}
                        {data.Seasons > 1 && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          class="ipc-icon ipc-icon--arrow-drop-down ipc-simple-select__icon--post"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          role="presentation"
                        >
                          <path fill="none" d="M0 0h24v24H0V0z"></path>
                          <path d="M8.71 11.71l2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71z"></path>
                        </svg>
                        )}
                      </span>
                      {data.Years > 1 && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0 12px 0 12px",
                          cursor: "pointer",
                          color: "rgb(14,99,190)",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          lineHeight: "1.25rem",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {data.Years} year{data.Years > 1 ? "s" : ""}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          class="ipc-icon ipc-icon--arrow-drop-down ipc-simple-select__icon--post"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          role="presentation"
                        >
                          <path fill="none" d="M0 0h24v24H0V0z"></path>
                          <path d="M8.71 11.71l2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71z"></path>
                        </svg>
                      </span>
                      )}
                      {data.Years < 2 && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0 12px 0 12px",
                          cursor: "pointer",
                          color: "rgb(14,99,190)",
                          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          lineHeight: "1.25rem",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {data.BeginingYear}
                      </span>
                      )}
                    </div>
                  </section>

                  {/*Videos*/}
                  <section
                    style={{
                      padding: "24px",
                      width: "856px",
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
                              Videos
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
                              {data.Videos2}
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
                      </div>
                      {/* Lista de vídeos */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Primeira linha: 2 vídeos */}
                        {videos.slice(0, 2).map((video) => (
                          <div
                            key={video.videoId}
                            style={{ flex: "0 0 calc(50% - 1rem)" }} // 50% da largura - metade do gap
                          >
                            <div style={{ position: "relative" }}>
                              <img
                                src={getVideoThumbnail(movieId, video.videoId)}
                                alt={video.Title}
                                style={{
                                  width: "396px",
                                  height: "222.75px",
                                  borderRadius: "0.75rem",
                                  objectFit: "cover",
                                  cursor: "pointer",
                                  objectPosition: "15% 15%",
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 20, // afastamento do canto inferior
                                  left: 20, // afastamento do canto esquerdo
                                  display: "flex",
                                  alignItems: "center",
                                  // espaço entre o círculo e o texto
                                  cursor: "pointer",
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
                                    left: "-8px",
                                  }}
                                >
                                  {/* Círculo com borda branca */}
                                  <div
                                    style={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: "50%",
                                      border: "3px solid white", // borda branca
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      filter:
                                        "drop-shadow(0 0 4px rgba(0,0,0,0.7))",
                                      transition: "background-color 0.3s ease",
                                      position: "relative",
                                      top: "0px",
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      role="presentation"
                                      style={{
                                        transform: "rotate(-90deg)",
                                        color: "white",
                                      }}
                                    >
                                      <path
                                        fill="none"
                                        d="M0 0h24v24H0V0z"
                                      ></path>
                                      <path d="M8.71 11.71l2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71z" />
                                    </svg>
                                  </div>

                                  {/* Texto ao lado */}
                                  <span
                                    style={{
                                      color: "white",
                                      fontSize: "1rem",
                                      userSelect: "none",
                                      textShadow: "0 0 5px rgba(0,0,0,0.7)",
                                      position: "relative",
                                      left: "-4px",
                                      fontFamily:
                                        "Roboto,Helvetica,Arial,sans-serif",
                                    }}
                                  >
                                    {video.Type}
                                  </span>
                                  <span
                                    style={{
                                      color: "white",
                                      position: "relative",
                                      left: "-7px",
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {video.Duration}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p
                              style={{
                                padding: ".50rem .25rem .25rem",
                                fontSize: "1rem",
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                                fontWeight: "400",
                                lineHeight: "1.5rem",
                                letterSpacing: "0.03125em",
                                display: "block",
                                cursor: "pointer",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxHeight: "48px",
                                maxWidth: "396px",
                                margin: "0",
                              }}
                            >
                              {video.Title}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                marginLeft: "-0.25rem",
                                height: "24px",
                                alignItems: "center",
                              }}
                            >
                              {video.Likes > 0 && (
                                <>
                                  <div
                                    style={{
                                      width: "24px",
                                      height: "16px",
                                      display: "flex",
                                      alignContent: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="1rem"
                                      height="1rem"
                                      style={{ color: "rgb(0,0,0,.54)" }}
                                      class="ipc-icon ipc-icon--thumb-up ipc-reaction-summary__likes-icon"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      role="presentation"
                                    >
                                      <path d="M13.12 2.06c.58-.59 1.52-.59 2.11-.01.36.36.51.87.41 1.37L14.69 8h5.65c2.15 0 3.6 2.2 2.76 4.18l-3.26 7.61C19.52 20.52 18.8 21 18 21H9c-1.1 0-2-.9-2-2V9.01c0-.53.21-1.04.58-1.41l5.54-5.54zM9.293 8.707A1 1 0 0 0 9 9.414V18a1 1 0 0 0 1 1h7.332a1 1 0 0 0 .924-.617c1.663-4.014 2.527-6.142 2.594-6.383.07-.253.12-.587.15-1v-.002A1 1 0 0 0 20 10h-8l1.34-5.34-4.047 4.047zM3 21c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2s-2 .9-2 2v8c0 1.1.9 2 2 2z"></path>
                                    </svg>
                                  </div>
                                  <p
                                    style={{
                                      margin: "0",
                                      fontSize: "0.75rem",
                                      color: "rgba(0,0,0,.54)",
                                      marginRight: "0.5rem",
                                      fontFamily:
                                        "Roboto,Helvetica,Arial,sans-serif",
                                      lineHeight: "1rem",
                                      letterSpacing: "0.03333em",
                                      fontWeight: "400",
                                    }}
                                  >
                                    {formatNumber(video.Likes)}
                                  </p>
                                </>
                              )}
                              {video.Reactions > 0 && (
                                <>
                                  <div
                                    style={{
                                      opacity: "0.7",
                                      height: "19px",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      xmlns:xlink="http://www.w3.org/1999/xlink"
                                      role="presentation"
                                      preserveAspectRatio="xMidYMid meet"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 500 500"
                                      class="ipc-reaction ipc-reaction--heart ipc-reaction--inline ipc-reaction-summary__reaction"
                                      fill="currentColor"
                                    >
                                      <g>
                                        <g opacity="0">
                                          <g transform=" translate(130, 250) scale(0.16, 0.16) ">
                                            <g transform=" translate(0, 6.312) scale(1, 1.1) translate(-250, -255.738)">
                                              <path
                                                fill="#ee3e81"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,349.69 247.14,372.56 C248.01,373.16 249,372.87 250,372.86 C251,372.87 252,373.16 252.86,372.56 C286.03,349.69 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                              >
                                                <animate
                                                  repeatCount="1"
                                                  dur="2.002002s"
                                                  begin="indefinite"
                                                  fill="remove"
                                                  attributeName="d"
                                                  attributeType="XML"
                                                  from="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,349.69 247.14,372.56 C248.01,373.16 249,372.87 250,372.86 C251,372.87 252,373.16 252.86,372.56 C286.03,349.69 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                  to="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                  keyTimes="0;0.0416667;1"
                                                  values="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,349.69 247.14,372.56 C248.01,373.16 249,372.87 250,372.86 C251,372.87 252,373.16 252.86,372.56 C286.03,349.69 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                  keySplines="0.167 0.167 0.833 0.833;0 0 0 0"
                                                  calcMode="spline"
                                                ></animate>
                                              </path>
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="opacity"
                                                from="1"
                                                to="0"
                                                keyTimes="0;0.2083334;0.6041667;1"
                                                values="1;1;0;0"
                                                keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </g>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.0416667;0.6041667;1"
                                              path="M0 0 C0,0 0,0 0,0 C0,0 -58,40 -70,-164 C-70,-164 -70,-164 -70,-164"
                                              keyPoints="0;0;1;1"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="0.16 0.16"
                                              to="0.16 0.16"
                                              type="scale"
                                              additive="sum"
                                              keyTimes="0;1"
                                              values="1 1;1 1"
                                              keySplines="0 0 1 1"
                                              calcMode="spline"
                                            ></animateTransform>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="0"
                                            keyTimes="0;0.1875;0.1875021;0.875;0.875;1"
                                            values="0;0;1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g opacity="0">
                                          <g transform=" translate(130, 250) scale(0.16, 0.16) ">
                                            <g transform=" translate(102.692, -80.302) scale(1, 1.1) translate(-352.692, -176.998)">
                                              <path
                                                fill="#f8bbad"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M348.84 166.12 C366.26,174.01 369.73,188 371.64,201.64 C372.13,205.08 375.77,206.98 378.45,206.53 C381.58,206 382.52,203.95 382.62,197.95 C382.87,181.95 370.32,157.23 351.07,153.75 C347.65,153.13 344.39,155.4 343.77,158.82 C343.39,160.91 343.29,163.61 348.84,166.12z "
                                              ></path>
                                              <path
                                                fill="#f8bbad"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M332.5 157.18 C334.74,154.96 334.76,151.34 332.54,149.1 C330.32,146.86 326.7,146.84 324.46,149.06 C322.22,151.28 322.2,154.89 324.42,157.13 C326.64,159.38 330.25,159.39 332.5,157.18z "
                                              ></path>
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="opacity"
                                                from="1"
                                                to="0"
                                                keyTimes="0;0.2083334;0.6041667;1"
                                                values="1;1;0;0"
                                                keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </g>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.0416667;0.6041667;1"
                                              path="M0 0 C0,0 0,0 0,0 C0,0 -58,40 -70,-164 C-70,-164 -70,-164 -70,-164"
                                              keyPoints="0;0;1;1"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="0.16 0.16"
                                              to="0.16 0.16"
                                              type="scale"
                                              additive="sum"
                                              keyTimes="0;1"
                                              values="1 1;1 1"
                                              keySplines="0 0 1 1"
                                              calcMode="spline"
                                            ></animateTransform>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="0"
                                            keyTimes="0;0.1875;0.1875021;0.875;0.875;1"
                                            values="0;0;1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g opacity="0">
                                          <g transform=" translate(130, 250) scale(0.16, 0.16) ">
                                            <g transform=" translate(-37.868, 6.312) scale(1, 1.1) translate(-212.132, -255.738)">
                                              <path
                                                fill="#b23f64"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,374.67 250.46,374.67 C250.46,374.67 251.25,374.13 252.65,373.17 C230.15,355.29 151.58,321.6 125.02,263.95z "
                                              >
                                                <animate
                                                  repeatCount="1"
                                                  dur="2.002002s"
                                                  begin="indefinite"
                                                  fill="remove"
                                                  attributeName="d"
                                                  attributeType="XML"
                                                  from="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,374.67 250.46,374.67 C250.46,374.67 251.25,374.13 252.65,373.17 C230.15,355.29 151.58,321.6 125.02,263.95z "
                                                  to="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z "
                                                  keyTimes="0;0.0416667;1"
                                                  values="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,374.67 250.46,374.67 C250.46,374.67 251.25,374.13 252.65,373.17 C230.15,355.29 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z "
                                                  keySplines="0.167 0.167 0.833 0.833;0 0 0 0"
                                                  calcMode="spline"
                                                ></animate>
                                              </path>
                                              <path
                                                fill="#b23f64"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M333.93 124.88 C296.58,121.15 257.89,141.21 246.59,155.72 C246.59,155.72 251.52,161.62 251.52,161.62 C253.64,164.15 257.59,163.99 259.45,161.26 C267.52,149.35 291.39,126.04 333.93,124.88z "
                                              ></path>
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="opacity"
                                                from="1"
                                                to="0"
                                                keyTimes="0;0.2083334;0.6041667;1"
                                                values="1;1;0;0"
                                                keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </g>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.0416667;0.6041667;1"
                                              path="M0 0 C0,0 0,0 0,0 C0,0 -58,40 -70,-164 C-70,-164 -70,-164 -70,-164"
                                              keyPoints="0;0;1;1"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="0.16 0.16"
                                              to="0.16 0.16"
                                              type="scale"
                                              additive="sum"
                                              keyTimes="0;1"
                                              values="1 1;1 1"
                                              keySplines="0 0 1 1"
                                              calcMode="spline"
                                            ></animateTransform>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="0"
                                            keyTimes="0;0.1875;0.1875021;0.875;0.875;1"
                                            values="0;0;1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g opacity="0">
                                          <g transform=" translate(130, 250) scale(0.16, 0.16) ">
                                            <g transform=" translate(0, 6.312) scale(1, 1.1) translate(-250, -255.738)">
                                              <path
                                                fill="#ee3e81"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                              >
                                                <animate
                                                  repeatCount="1"
                                                  dur="2.002002s"
                                                  begin="indefinite"
                                                  fill="remove"
                                                  attributeName="d"
                                                  attributeType="XML"
                                                  from="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                  to="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                  keyTimes="0;0.0416667;0.1041667;1"
                                                  values="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,349.69 247.14,372.56 C248.01,373.16 249,372.87 250,372.86 C251,372.87 252,373.16 252.86,372.56 C286.03,349.69 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                  keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                                  calcMode="spline"
                                                ></animate>
                                              </path>
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="opacity"
                                                from="1"
                                                to="0"
                                                keyTimes="0;0.2708334;0.6666667;1"
                                                values="1;1;0;0"
                                                keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </g>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.1041667;0.6666667;1"
                                              path="M0 0 C0,0 0,0 0,0 C0,0 -90,108 -102,-96 C-102,-96 -102,-96 -102,-96"
                                              keyPoints="0;0;1;1"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="0.16 0.16"
                                              to="0.16 0.16"
                                              type="scale"
                                              additive="sum"
                                              keyTimes="0;1"
                                              values="1 1;1 1"
                                              keySplines="0 0 1 1"
                                              calcMode="spline"
                                            ></animateTransform>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="0"
                                            keyTimes="0;0.25;0.2500021;0.9375;0.9375;1"
                                            values="0;0;1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g opacity="0">
                                          <g transform=" translate(130, 250) scale(0.16, 0.16) ">
                                            <g transform=" translate(102.692, -80.302) scale(1, 1.1) translate(-352.692, -176.998)">
                                              <path
                                                fill="#f8bbad"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M348.84 166.12 C366.26,174.01 369.73,188 371.64,201.64 C372.13,205.08 375.77,206.98 378.45,206.53 C381.58,206 382.52,203.95 382.62,197.95 C382.87,181.95 370.32,157.23 351.07,153.75 C347.65,153.13 344.39,155.4 343.77,158.82 C343.39,160.91 343.29,163.61 348.84,166.12z "
                                              ></path>
                                              <path
                                                fill="#f8bbad"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M332.5 157.18 C334.74,154.96 334.76,151.34 332.54,149.1 C330.32,146.86 326.7,146.84 324.46,149.06 C322.22,151.28 322.2,154.89 324.42,157.13 C326.64,159.38 330.25,159.39 332.5,157.18z "
                                              ></path>
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="opacity"
                                                from="1"
                                                to="0"
                                                keyTimes="0;0.2708334;0.6666667;1"
                                                values="1;1;0;0"
                                                keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </g>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.1041667;0.6666667;1"
                                              path="M0 0 C0,0 0,0 0,0 C0,0 -90,108 -102,-96 C-102,-96 -102,-96 -102,-96"
                                              keyPoints="0;0;1;1"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="0.16 0.16"
                                              to="0.16 0.16"
                                              type="scale"
                                              additive="sum"
                                              keyTimes="0;1"
                                              values="1 1;1 1"
                                              keySplines="0 0 1 1"
                                              calcMode="spline"
                                            ></animateTransform>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="0"
                                            keyTimes="0;0.25;0.2500021;0.9375;0.9375;1"
                                            values="0;0;1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g opacity="0">
                                          <g transform=" translate(130, 250) scale(0.16, 0.16) ">
                                            <g transform=" translate(-37.868, 6.312) scale(1, 1.1) translate(-212.132, -255.738)">
                                              <path
                                                fill="#b23f64"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z "
                                              >
                                                <animate
                                                  repeatCount="1"
                                                  dur="2.002002s"
                                                  begin="indefinite"
                                                  fill="remove"
                                                  attributeName="d"
                                                  attributeType="XML"
                                                  from="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z "
                                                  to="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z "
                                                  keyTimes="0;0.0416667;0.1041667;1"
                                                  values="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,374.67 250.46,374.67 C250.46,374.67 251.25,374.13 252.65,373.17 C230.15,355.29 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z "
                                                  keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                                  calcMode="spline"
                                                ></animate>
                                              </path>
                                              <path
                                                fill="#b23f64"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M333.93 124.88 C296.58,121.15 257.89,141.21 246.59,155.72 C246.59,155.72 251.52,161.62 251.52,161.62 C253.64,164.15 257.59,163.99 259.45,161.26 C267.52,149.35 291.39,126.04 333.93,124.88z "
                                              ></path>
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="opacity"
                                                from="1"
                                                to="0"
                                                keyTimes="0;0.2708334;0.6666667;1"
                                                values="1;1;0;0"
                                                keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </g>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.1041667;0.6666667;1"
                                              path="M0 0 C0,0 0,0 0,0 C0,0 -90,108 -102,-96 C-102,-96 -102,-96 -102,-96"
                                              keyPoints="0;0;1;1"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="0.16 0.16"
                                              to="0.16 0.16"
                                              type="scale"
                                              additive="sum"
                                              keyTimes="0;1"
                                              values="1 1;1 1"
                                              keySplines="0 0 1 1"
                                              calcMode="spline"
                                            ></animateTransform>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="0"
                                            keyTimes="0;0.25;0.2500021;0.9375;0.9375;1"
                                            values="0;0;1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g transform=" translate(250, 250) scale(1.1, 1.1) ">
                                          <g transform=" translate(0, 5.738) translate(-250, -255.738)">
                                            <path
                                              fill="#ee3e81"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                            >
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="d"
                                                attributeType="XML"
                                                from="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                to="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                keyTimes="0;0.0625;0.1041667;0.1666667;1"
                                                values="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,349.69 247.14,372.56 C248.01,373.16 249,372.87 250,372.86 C251,372.87 252,373.16 252.86,372.56 C286.03,349.69 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </path>
                                            <path
                                              stroke="#b23f64"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                              fill="none"
                                              stroke-width="6"
                                              stroke-opacity="1"
                                              d=" M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                            >
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="d"
                                                attributeType="XML"
                                                from="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                to="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                keyTimes="0;0.0625;0.1041667;0.1666667;1"
                                                values="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,349.69 247.14,372.56 C248.01,373.16 249,372.87 250,372.86 C251,372.87 252,373.16 252.86,372.56 C286.03,349.69 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </path>
                                          </g>
                                          <animateMotion
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            keyTimes="0;0.1041667;0.1666667;0.2291667;0.2916667;0.3958334;0.5416667;0.7291667;1"
                                            path="M0 0 C0,16.670000000000016 0,83.32999999999998 0,100 C0,100 0,100 0,100 C0,83.32999999999998 0,20 0,0 C0,-20 0,-20.330000000000013 0,-20 C0,-19.669999999999987 0,0.3300000000000125 0,2 C0,3.6699999999999875 0,-9.669999999999987 0,-10 C0,-10.330000000000013 0,-1.6699999999999875 0,0 C0,0 0,0 0,0"
                                            keyPoints="0;0.38;0.38;0.76;0.83;0.92;0.96;1;1"
                                            keySplines="0.333 0 0.667 1;0.333 0.333 0.667 0.667;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                            calcMode="spline"
                                          ></animateMotion>
                                          <animateTransform
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="transform"
                                            from="1.1 1.1"
                                            to="1.1 1.1"
                                            type="scale"
                                            additive="sum"
                                            keyTimes="0;0.1041667;0.1666667;0.2291667;0.2916667;0.3958334;0.5416667;0.7291667;1"
                                            values="1 1;0.7272727272727273 0.6818181818181818;0.7272727272727273 0.6818181818181818;0.9636363636363636 1;1.0272727272727273 1.0272727272727273;0.8909090909090909 0.8909090909090909;0.9909090909090909 0.9909090909090909;1 1;1 1"
                                            keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                            calcMode="spline"
                                          ></animateTransform>
                                        </g>
                                        <g transform=" translate(250, 250) scale(1.1, 1.1) ">
                                          <g transform=" translate(102.692, -73.002) translate(-352.692, -176.998)">
                                            <path
                                              fill="#f8bbad"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M348.84 166.12 C366.26,174.01 369.73,188 371.64,201.64 C372.13,205.08 375.77,206.98 378.45,206.53 C381.58,206 382.52,203.95 382.62,197.95 C382.87,181.95 370.32,157.23 351.07,153.75 C347.65,153.13 344.39,155.4 343.77,158.82 C343.39,160.91 343.29,163.61 348.84,166.12z "
                                            ></path>
                                            <path
                                              fill="#f8bbad"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M332.5 157.18 C334.74,154.96 334.76,151.34 332.54,149.1 C330.32,146.86 326.7,146.84 324.46,149.06 C322.22,151.28 322.2,154.89 324.42,157.13 C326.64,159.38 330.25,159.39 332.5,157.18z "
                                            ></path>
                                          </g>
                                          <animateMotion
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            keyTimes="0;0.1041667;0.1666667;0.2291667;0.2916667;0.3958334;0.5416667;0.7291667;1"
                                            path="M0 0 C0,16.670000000000016 0,83.32999999999998 0,100 C0,100 0,100 0,100 C0,83.32999999999998 0,20 0,0 C0,-20 0,-20.330000000000013 0,-20 C0,-19.669999999999987 0,0.3300000000000125 0,2 C0,3.6699999999999875 0,-9.669999999999987 0,-10 C0,-10.330000000000013 0,-1.6699999999999875 0,0 C0,0 0,0 0,0"
                                            keyPoints="0;0.38;0.38;0.76;0.83;0.92;0.96;1;1"
                                            keySplines="0.333 0 0.667 1;0.333 0.333 0.667 0.667;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                            calcMode="spline"
                                          ></animateMotion>
                                          <animateTransform
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="transform"
                                            from="1.1 1.1"
                                            to="1.1 1.1"
                                            type="scale"
                                            additive="sum"
                                            keyTimes="0;0.1041667;0.1666667;0.2291667;0.2916667;0.3958334;0.5416667;0.7291667;1"
                                            values="1 1;0.7272727272727273 0.6818181818181818;0.7272727272727273 0.6818181818181818;0.9636363636363636 1;1.0272727272727273 1.0272727272727273;0.8909090909090909 0.8909090909090909;0.9909090909090909 0.9909090909090909;1 1;1 1"
                                            keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                            calcMode="spline"
                                          ></animateTransform>
                                        </g>
                                        <g transform=" translate(250, 250) scale(1.1, 1.1) ">
                                          <g transform=" translate(-37.868, 5.738) translate(-212.132, -255.738)">
                                            <path
                                              fill="#b23f64"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C173.18,114.09 127.39,121.03 99.82,166.99 C72.31,213.85 99.37,261.03 126.37,291.83 C151.21,320.15 248.74,389.94 248.74,389.94 C248.74,389.94 250.05,387.79 251.44,386.83 C228.94,368.96 151.58,321.6 125.02,263.95z "
                                            >
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="d"
                                                attributeType="XML"
                                                from="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C173.18,114.09 127.39,121.03 99.82,166.99 C72.31,213.85 99.37,261.03 126.37,291.83 C151.21,320.15 248.74,389.94 248.74,389.94 C248.74,389.94 250.05,387.79 251.44,386.83 C228.94,368.96 151.58,321.6 125.02,263.95z "
                                                to="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.66,114.6 129.01,119.67 101.45,165.63 C73.93,212.49 98.91,260.06 125.92,290.86 C150.76,319.18 249,389.45 249,389.45 C249,389.45 250.05,387.79 251.44,386.83 C228.94,368.96 151.58,321.6 125.02,263.95z "
                                                keyTimes="0;0.0625;0.1041667;0.1666667;0.2916667;1"
                                                values="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C173.18,114.09 127.39,121.03 99.82,166.99 C72.31,213.85 99.37,261.03 126.37,291.83 C151.21,320.15 248.74,389.94 248.74,389.94 C248.74,389.94 250.05,387.79 251.44,386.83 C228.94,368.96 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C176.57,115.1 128.46,118.81 100.9,164.77 C73.38,211.63 98.36,259.85 125.36,290.65 C150.21,318.98 250.1,388.12 250.1,388.12 C250.41,388.12 250.48,387.79 251.44,386.83 C228.94,368.96 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.94,114.33 127.93,119 100.36,164.96 C72.85,211.82 99.23,260.52 126.23,291.31 C151.07,319.64 250.46,374.67 250.46,374.67 C250.46,374.67 251.25,374.13 252.65,373.17 C230.15,355.29 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C178.75,115.33 128.24,118.67 100.68,164.63 C73.16,211.49 97.35,259.52 124.35,290.31 C149.2,318.64 250.1,388.12 250.1,388.12 C250.1,388.12 250.05,387.79 251.44,386.83 C228.94,368.96 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.66,114.6 129.01,119.67 101.45,165.63 C73.93,212.49 98.91,260.06 125.92,290.86 C150.76,319.18 249,389.45 249,389.45 C249,389.45 250.05,387.79 251.44,386.83 C228.94,368.96 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.66,114.6 129.01,119.67 101.45,165.63 C73.93,212.49 98.91,260.06 125.92,290.86 C150.76,319.18 249,389.45 249,389.45 C249,389.45 250.05,387.79 251.44,386.83 C228.94,368.96 151.58,321.6 125.02,263.95z "
                                                keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </path>
                                            <path
                                              fill="#b23f64"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M333.93 124.88 C296.58,121.15 257.89,141.21 246.59,155.72 C246.59,155.72 251.52,161.62 251.52,161.62 C253.64,164.15 257.59,163.99 259.45,161.26 C267.52,149.35 291.39,126.04 333.93,124.88z "
                                            ></path>
                                          </g>
                                          <animateMotion
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            keyTimes="0;0.1041667;0.1666667;0.2291667;0.2916667;0.3958334;0.5416667;0.7291667;1"
                                            path="M0 0 C0,16.670000000000016 0,83.32999999999998 0,100 C0,100 0,100 0,100 C0,83.32999999999998 0,20 0,0 C0,-20 0,-20.330000000000013 0,-20 C0,-19.669999999999987 0,0.3300000000000125 0,2 C0,3.6699999999999875 0,-9.669999999999987 0,-10 C0,-10.330000000000013 0,-1.6699999999999875 0,0 C0,0 0,0 0,0"
                                            keyPoints="0;0.38;0.38;0.76;0.83;0.92;0.96;1;1"
                                            keySplines="0.333 0 0.667 1;0.333 0.333 0.667 0.667;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                            calcMode="spline"
                                          ></animateMotion>
                                          <animateTransform
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="transform"
                                            from="1.1 1.1"
                                            to="1.1 1.1"
                                            type="scale"
                                            additive="sum"
                                            keyTimes="0;0.1041667;0.1666667;0.2291667;0.2916667;0.3958334;0.5416667;0.7291667;1"
                                            values="1 1;0.7272727272727273 0.6818181818181818;0.7272727272727273 0.6818181818181818;0.9636363636363636 1;1.0272727272727273 1.0272727272727273;0.8909090909090909 0.8909090909090909;0.9909090909090909 0.9909090909090909;1 1;1 1"
                                            keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                            calcMode="spline"
                                          ></animateTransform>
                                        </g>
                                      </g>
                                    </svg>
                                    <svg
                                      style={{
                                        position: "relative",
                                        left: "-12px",
                                        opacity: "0.7",
                                      }}
                                      xmlns="http://www.w3.org/2000/svg"
                                      xmlns:xlink="http://www.w3.org/1999/xlink"
                                      role="presentation"
                                      preserveAspectRatio="xMidYMid meet"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 500 500"
                                      class="ipc-reaction ipc-reaction--clap ipc-reaction--inline ipc-reaction-summary__reaction ipc-reaction-summary__reaction-front"
                                      fill="currentColor"
                                    >
                                      <g>
                                        <g>
                                          <g>
                                            <path
                                              fill="#ee9dc4"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M234.12 170.88 C233.44,172.09 231.77,172.38 230.75,171.47 C230.75,171.47 184.59,130.07 184.59,130.07 C180.97,126.83 182.72,121.3 187.8,119.91 C187.8,119.91 199.75,116.65 199.75,116.65 C203.1,115.74 206.63,117.07 208.07,119.78 C208.07,119.78 234.15,168.97 234.15,168.97 C234.46,169.56 234.45,170.28 234.12,170.88z "
                                            ></path>
                                            <animate
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="opacity"
                                              from="1"
                                              to="0"
                                              keyTimes="0;0.0833333;0.3541667;1"
                                              values="1;1;0;0"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animate>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="1"
                                            to="0"
                                            keyTimes="0;0.3958333;0.3958334;1"
                                            values="1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g>
                                          <g>
                                            <path
                                              fill="#ee82ae"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M282.18 163.83 C282.76,164.8 284.13,165 284.94,164.23 C284.94,164.23 321.54,129.36 321.54,129.36 C324.4,126.63 322.85,122.17 318.67,121.16 C318.67,121.16 308.86,118.8 308.86,118.8 C306.11,118.14 303.26,119.31 302.15,121.56 C302.15,121.56 282.11,162.27 282.11,162.27 C281.87,162.77 281.89,163.35 282.18,163.83z "
                                            ></path>
                                            <animate
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="opacity"
                                              from="1"
                                              to="0"
                                              keyTimes="0;0.0833333;0.3541667;1"
                                              values="1;1;0;0"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animate>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="1"
                                            to="0"
                                            keyTimes="0;0.3958333;0.3958334;1"
                                            values="1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g>
                                          <g>
                                            <path
                                              fill="#5ba7db"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M251.84 168.62 C253.37,169.68 255.56,169.03 256.25,167.32 C256.25,167.32 287.35,89.94 287.35,89.94 C289.79,83.88 284.39,78.24 277.44,79.59 C277.44,79.59 261.08,82.76 261.08,82.76 C256.5,83.65 253.03,87.35 252.9,91.48 C252.9,91.48 250.67,166.33 250.67,166.33 C250.64,167.24 251.08,168.09 251.84,168.62z "
                                            ></path>
                                            <animate
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="opacity"
                                              from="1"
                                              to="0"
                                              keyTimes="0;0.0833333;0.3541667;1"
                                              values="1;1;0;0"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animate>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="1"
                                            to="0"
                                            keyTimes="0;0.3958333;0.3958334;1"
                                            values="1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g opacity="0">
                                          <g opacity="0">
                                            <path
                                              fill="#ee9dc4"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M234.12 170.88 C233.44,172.09 231.77,172.38 230.75,171.47 C230.75,171.47 184.59,130.07 184.59,130.07 C180.97,126.83 182.72,121.3 187.8,119.91 C187.8,119.91 199.75,116.65 199.75,116.65 C203.1,115.74 206.63,117.07 208.07,119.78 C208.07,119.78 234.15,168.97 234.15,168.97 C234.46,169.56 234.45,170.28 234.12,170.88z "
                                              transform=" translate(22, 40)"
                                            ></path>
                                            <animate
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="opacity"
                                              from="0"
                                              to="1"
                                              keyTimes="0;0.375;0.5625;0.9583333;1"
                                              values="0;0;1;1;1"
                                              keySplines="0.306 0 0.648 1;0.306 0 0.648 1;0.394 0 0.829 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animate>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.0416667;0.375;0.7083333;1"
                                              path="M0 0 C0,0 0,0 0,0 C-0.3299999999999841,0 1.670000000000016,6.670000000000016 -2,0 C-5.670000000000016,-6.670000000000016 -18.669999999999987,-33.329999999999984 -22,-40 C-22,-40 -22,-40 -22,-40"
                                              keyPoints="0;0;0.13;1;1"
                                              keySplines="0.167 0 0.833 1;0.167 0 0.833 1;0.167 0 0 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="1"
                                            keyTimes="0;0.375;0.3750021;1"
                                            values="0;0;1;1"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g opacity="0">
                                          <g opacity="0">
                                            <path
                                              fill="#ee82ae"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M282.18 163.83 C282.76,164.8 284.13,165 284.94,164.23 C284.94,164.23 321.54,129.36 321.54,129.36 C324.4,126.63 322.85,122.17 318.67,121.16 C318.67,121.16 308.86,118.8 308.86,118.8 C306.11,118.14 303.26,119.31 302.15,121.56 C302.15,121.56 282.11,162.27 282.11,162.27 C281.87,162.77 281.89,163.35 282.18,163.83z "
                                              transform=" translate(-18, 40)"
                                            ></path>
                                            <animate
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="opacity"
                                              from="0"
                                              to="1"
                                              keyTimes="0;0.375;0.5625;0.9583333;1"
                                              values="0;0;1;1;1"
                                              keySplines="0.306 0 0.648 1;0.306 0 0.648 1;0.394 0 0.829 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animate>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.0416667;0.375;0.7083333;1"
                                              path="M0 0 C0,0 0,0 0,0 C-0.3300000000000125,0 -5,6.670000000000016 -2,0 C1,-6.670000000000016 14.669999999999987,-33.329999999999984 18,-40 C18,-40 18,-40 18,-40"
                                              keyPoints="0;0;0.14;1;1"
                                              keySplines="0.167 0 0.833 1;0.167 0 0.833 1;0.167 0 0 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="1"
                                            keyTimes="0;0.375;0.3750021;1"
                                            values="0;0;1;1"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g opacity="0">
                                          <g opacity="0">
                                            <path
                                              fill="#5ba7db"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M251.84 168.62 C253.37,169.68 255.56,169.03 256.25,167.32 C256.25,167.32 287.35,89.94 287.35,89.94 C289.79,83.88 284.39,78.24 277.44,79.59 C277.44,79.59 261.08,82.76 261.08,82.76 C256.5,83.65 253.03,87.35 252.9,91.48 C252.9,91.48 250.67,166.33 250.67,166.33 C250.64,167.24 251.08,168.09 251.84,168.62z "
                                              transform=" translate(2, 40)"
                                            ></path>
                                            <animate
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="opacity"
                                              from="0"
                                              to="1"
                                              keyTimes="0;0.375;0.5625;0.9583333;1"
                                              values="0;0;1;1;1"
                                              keySplines="0.195 0 0.562 1;0.195 0 0.562 1;0.352 0 0.843 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animate>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.0416667;0.375;0.7083333;1"
                                              path="M0 0 C0,0 0,0 0,0 C-0.3300000000000125,0 -1.6699999999999875,6.670000000000016 -2,0 C-2.3300000000000125,-6.670000000000016 -2,-33.329999999999984 -2,-40 C-2,-40 -2,-40 -2,-40"
                                              keyPoints="0;0;0.14;1;1"
                                              keySplines="0.167 0 0.833 1;0.167 0 0.833 1;0.167 0 0 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="1"
                                            keyTimes="0;0.375;0.3750021;1"
                                            values="0;0;1;1"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g transform=" translate(250, 250) scale(5, 5) translate(0, 0)">
                                          <g>
                                            <path
                                              stroke="#af772a"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                              fill="none"
                                              stroke-width="2"
                                              stroke-opacity="1"
                                              d=" M58.11 33.75 C57.87,32.96 57.41,32.31 56.83,31.83 C56.15,31.27 55.21,31.15 54.4,31.5 C54.4,31.5 39.2,38.1 39.2,38.1 C39.04,38.17 38.88,38.17 38.73,38.11 C38.59,38.05 38.46,37.94 38.4,37.78 C38.26,37.46 38.41,37.1 38.72,36.96 C38.72,36.96 55.58,29.64 55.58,29.64 C56.4,29.28 56.97,28.5 57.03,27.6 C57.08,26.91 56.96,26.19 56.63,25.51 C56.41,25.07 56.13,24.7 55.79,24.38 C55.09,23.74 54.08,23.58 53.22,23.96 C52.45,24.3 51.53,24.71 51.49,24.72 C51.49,24.72 35.51,31.66 35.51,31.66 C35.35,31.73 35.19,31.73 35.04,31.67 C34.9,31.61 34.77,31.5 34.71,31.34 C34.57,31.02 34.72,30.66 35.03,30.52 C35.03,30.52 49.55,24.22 49.55,24.22 C50.75,23.7 51.34,22.28 50.83,21.06 C50.83,21.05 50.82,21.04 50.82,21.03 C49.96,18.98 47.62,18.03 45.61,18.91 C45.61,18.91 31.79,24.91 31.79,24.91 C31.79,24.91 28.28,26.42 28.28,26.42 C26.51,27.21 25.14,27.65 23.52,28 C23.52,28 23.49,28.01 23.49,28.01 C22.81,28.15 22.19,27.57 22.29,26.88 C22.29,26.88 22.92,22.07 22.92,22.07 C23.21,19.86 21.69,17.83 19.52,17.53 C17.35,17.24 15.35,18.78 15.06,20.99 C15.06,20.99 12.82,37.91 12.82,37.91 C12.75,38.45 12.64,38.99 12.53,39.52 C11.93,42.48 12.17,45.64 13.43,48.62 C16.71,56.43 25.6,60.05 33.28,56.71 C33.28,56.71 40.35,53.64 40.35,53.64 C40.52,53.59 40.69,53.54 40.86,53.47 C40.86,53.47 54.33,47.61 54.33,47.61 C56.35,46.74 57.28,44.37 56.42,42.32 C56.3,42.02 56.13,41.74 55.95,41.48 C55.29,40.6 54.11,40.3 53.1,40.74 C53.1,40.74 42.1,45.51 42.1,45.51 C41.93,45.59 41.75,45.58 41.6,45.52 C41.44,45.46 41.31,45.33 41.24,45.16 C41.1,44.83 41.25,44.43 41.58,44.29 C41.58,44.29 56.73,37.71 56.73,37.71 C57.29,37.47 57.75,37.02 57.98,36.45 C58.33,35.61 58.4,34.67 58.11,33.75z "
                                              transform=" translate(-31.995000000000005, -32.004)"
                                            ></path>
                                            <path
                                              fill="#f4b642"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M58.11 33.75 C57.87,32.96 57.41,32.31 56.83,31.83 C56.15,31.27 55.21,31.15 54.4,31.5 C54.4,31.5 39.2,38.1 39.2,38.1 C39.04,38.17 38.88,38.17 38.73,38.11 C38.59,38.05 38.46,37.94 38.4,37.78 C38.26,37.46 38.41,37.1 38.72,36.96 C38.72,36.96 55.58,29.64 55.58,29.64 C56.4,29.28 56.97,28.5 57.03,27.6 C57.08,26.91 56.96,26.19 56.63,25.51 C56.41,25.07 56.13,24.7 55.79,24.38 C55.09,23.74 54.08,23.58 53.22,23.96 C52.45,24.3 51.53,24.71 51.49,24.72 C51.49,24.72 35.51,31.66 35.51,31.66 C35.35,31.73 35.19,31.73 35.04,31.67 C34.9,31.61 34.77,31.5 34.71,31.34 C34.57,31.02 34.72,30.66 35.03,30.52 C35.03,30.52 49.55,24.22 49.55,24.22 C50.75,23.7 51.34,22.28 50.83,21.06 C50.83,21.05 50.82,21.04 50.82,21.03 C49.96,18.98 47.62,18.03 45.61,18.91 C45.61,18.91 31.79,24.91 31.79,24.91 C31.79,24.91 28.28,26.42 28.28,26.42 C26.51,27.21 25.14,27.65 23.52,28 C23.52,28 23.49,28.01 23.49,28.01 C22.81,28.15 22.19,27.57 22.29,26.88 C22.29,26.88 22.92,22.07 22.92,22.07 C23.21,19.86 21.69,17.83 19.52,17.53 C17.35,17.24 15.35,18.78 15.06,20.99 C15.06,20.99 12.82,37.91 12.82,37.91 C12.75,38.45 12.64,38.99 12.53,39.52 C11.93,42.48 12.17,45.64 13.43,48.62 C16.71,56.43 25.6,60.05 33.28,56.71 C33.28,56.71 40.35,53.64 40.35,53.64 C40.52,53.59 40.69,53.54 40.86,53.47 C40.86,53.47 54.33,47.61 54.33,47.61 C56.35,46.74 57.28,44.37 56.42,42.32 C56.3,42.02 56.13,41.74 55.95,41.48 C55.29,40.6 54.11,40.3 53.1,40.74 C53.1,40.74 42.1,45.51 42.1,45.51 C41.93,45.59 41.75,45.58 41.6,45.52 C41.44,45.46 41.31,45.33 41.24,45.16 C41.1,44.83 41.25,44.43 41.58,44.29 C41.58,44.29 56.73,37.71 56.73,37.71 C57.29,37.47 57.75,37.02 57.98,36.45 C58.33,35.61 58.4,34.67 58.11,33.75z "
                                              transform=" translate(-31.995000000000005, -32.004)"
                                            ></path>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.1510417;0.2708334;0.3420208;1"
                                              path="M0 0 C0,0 0,0 0,0 C0.8799999999999999,-0.4399999999999995 5.33,-2.6599999999999997 5.33,-2.6599999999999997 C5.33,-2.6599999999999997 0.8799999999999999,-0.4399999999999995 0,0 C0,0 0,0 0,0"
                                              keyPoints="0;0;0.5;1;1"
                                              keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="0"
                                              to="0"
                                              type="rotate"
                                              additive="sum"
                                              keyTimes="0;0.1510417;0.2708334;0.3420208;1"
                                              values="0;0;-10;0;0"
                                              keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                              calcMode="spline"
                                            ></animateTransform>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="1 1"
                                              to="1 1"
                                              type="scale"
                                              additive="sum"
                                              keyTimes="0;0.1510417;0.2708334;0.3420208;1"
                                              values="1 1;1 1;0.8 0.8;1 1;1 1"
                                              keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                              calcMode="spline"
                                            ></animateTransform>
                                          </g>
                                        </g>
                                        <g transform=" translate(250, 250) scale(5, 5) translate(0, 0)">
                                          <g>
                                            <path
                                              stroke="#af772a"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                              fill="none"
                                              stroke-width="2"
                                              stroke-opacity="1"
                                              d=" M52.29 37.65 C51.05,36.41 49.16,36.39 48.37,37.19 C48.37,37.19 39.92,45.78 39.92,45.78 C39.79,45.91 39.62,45.97 39.45,45.97 C39.28,45.97 39.12,45.91 38.99,45.78 C38.73,45.52 38.73,45.09 38.99,44.83 C38.99,44.83 50.61,33.03 50.61,33.03 C51.92,31.72 51.38,29.58 50.31,28.51 C48.86,27.06 46.83,27.48 46.18,28.14 C46.18,28.14 34.51,40 34.51,40 C34.39,40.12 34.23,40.18 34.08,40.18 C33.92,40.18 33.76,40.12 33.65,40 C33.41,39.75 33.41,39.36 33.65,39.12 C33.65,39.12 46.61,25.94 46.61,25.94 C47.24,25.31 47.81,23.31 46.07,21.72 C44.59,20.36 42.75,21.26 42.26,21.65 C41.45,22.29 28.72,35.41 28.72,35.41 C28.61,35.53 28.45,35.59 28.29,35.59 C28.14,35.59 27.98,35.53 27.86,35.41 C27.62,35.17 27.62,34.78 27.86,34.54 C27.86,34.54 39.03,23.19 39.03,23.19 C39.29,22.89 39.46,22.52 39.55,22.12 C39.88,20.6 38.81,19.18 37.34,18.68 C35.93,18.2 34.53,18.64 33.43,19.76 C33.43,19.76 22.8,30.55 22.8,30.55 C22.8,30.55 20.1,33.28 20.1,33.28 C18.74,34.68 17.63,35.61 16.25,36.55 C16.25,36.55 16.23,36.56 16.23,36.56 C15.65,36.95 14.87,36.65 14.7,35.97 C14.7,35.97 13.53,31.26 13.53,31.26 C12.99,29.1 10.83,27.8 8.71,28.34 C6.58,28.89 5.29,31.08 5.83,33.24 C5.83,33.24 9.95,49.78 9.95,49.78 C10.09,50.32 10.18,50.86 10.27,51.39 C10.8,54.36 12.19,57.21 14.45,59.5 C20.35,65.5 29.93,65.5 35.84,59.5 C35.84,59.5 41.27,53.98 41.27,53.98 C41.41,53.87 41.55,53.76 41.68,53.62 C41.68,53.62 51.88,43.26 51.88,43.26 C53.51,41.61 54.38,39.74 52.29,37.65z "
                                              transform=" translate(-31.994999999999997, -32.001999999999995)"
                                            ></path>
                                            <path
                                              fill="#fdd856"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M52.29 37.65 C51.05,36.41 49.16,36.39 48.37,37.19 C48.37,37.19 39.92,45.78 39.92,45.78 C39.79,45.91 39.62,45.97 39.45,45.97 C39.28,45.97 39.12,45.91 38.99,45.78 C38.73,45.52 38.73,45.09 38.99,44.83 C38.99,44.83 50.61,33.03 50.61,33.03 C51.92,31.72 51.38,29.58 50.31,28.51 C48.86,27.06 46.83,27.48 46.18,28.14 C46.18,28.14 34.51,40 34.51,40 C34.39,40.12 34.23,40.18 34.08,40.18 C33.92,40.18 33.76,40.12 33.65,40 C33.41,39.75 33.41,39.36 33.65,39.12 C33.65,39.12 46.61,25.94 46.61,25.94 C47.24,25.31 47.81,23.31 46.07,21.72 C44.59,20.36 42.75,21.26 42.26,21.65 C41.45,22.29 28.72,35.41 28.72,35.41 C28.61,35.53 28.45,35.59 28.29,35.59 C28.14,35.59 27.98,35.53 27.86,35.41 C27.62,35.17 27.62,34.78 27.86,34.54 C27.86,34.54 39.03,23.19 39.03,23.19 C39.29,22.89 39.46,22.52 39.55,22.12 C39.88,20.6 38.81,19.18 37.34,18.68 C35.93,18.2 34.53,18.64 33.43,19.76 C33.43,19.76 22.8,30.55 22.8,30.55 C22.8,30.55 20.1,33.28 20.1,33.28 C18.74,34.68 17.63,35.61 16.25,36.55 C16.25,36.55 16.23,36.56 16.23,36.56 C15.65,36.95 14.87,36.65 14.7,35.97 C14.7,35.97 13.53,31.26 13.53,31.26 C12.99,29.1 10.83,27.8 8.71,28.34 C6.58,28.89 5.29,31.08 5.83,33.24 C5.83,33.24 9.95,49.78 9.95,49.78 C10.09,50.32 10.18,50.86 10.27,51.39 C10.8,54.36 12.19,57.21 14.45,59.5 C20.35,65.5 29.93,65.5 35.84,59.5 C35.84,59.5 41.27,53.98 41.27,53.98 C41.41,53.87 41.55,53.76 41.68,53.62 C41.68,53.62 51.88,43.26 51.88,43.26 C53.51,41.61 54.38,39.74 52.29,37.65z "
                                              transform=" translate(-31.994999999999997, -32.001999999999995)"
                                            ></path>
                                            <path
                                              fill="#ffe38d"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M51.24 41.69 C51.44,41.9 51.78,41.88 51.93,41.63 C52.56,40.65 52.45,39.33 51.6,38.47 C50.75,37.61 49.45,37.49 48.48,38.13 C48.25,38.28 48.23,38.63 48.42,38.83 C48.42,38.83 51.24,41.69 51.24,41.69z "
                                              transform=" translate(-31.994999999999997, -32.001999999999995)"
                                            ></path>
                                            <path
                                              fill="#ffe38d"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M49.22 32.41 C49.42,32.61 49.76,32.59 49.91,32.35 C50.54,31.37 50.42,30.04 49.58,29.18 C48.73,28.32 47.43,28.21 46.46,28.84 C46.22,29 46.2,29.35 46.4,29.55 C46.4,29.55 49.22,32.41 49.22,32.41z "
                                              transform=" translate(-31.994999999999997, -32.001999999999995)"
                                            ></path>
                                            <path
                                              fill="#ffe38d"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M45.25 25.48 C45.44,25.66 45.76,25.64 45.9,25.42 C46.48,24.51 46.37,23.27 45.59,22.47 C44.8,21.67 43.58,21.57 42.68,22.15 C42.46,22.3 42.44,22.62 42.63,22.81 C42.63,22.81 45.25,25.48 45.25,25.48z "
                                              transform=" translate(-31.994999999999997, -32.001999999999995)"
                                            ></path>
                                            <path
                                              fill="#ffe38d"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M37.42 23.16 C37.6,23.36 37.93,23.34 38.07,23.11 C38.66,22.18 38.56,20.92 37.76,20.11 C36.95,19.29 35.72,19.19 34.8,19.79 C34.58,19.93 34.56,20.26 34.75,20.45 C34.75,20.45 37.42,23.16 37.42,23.16z "
                                              transform=" translate(-31.994999999999997, -32.001999999999995)"
                                            ></path>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.1510417;0.2708334;0.3420208;1"
                                              path="M0 0 C0,0 0,0 0,0 C-0.8900000000000001,-0.4399999999999995 -5.34,-2.66 -5.34,-2.66 C-5.34,-2.66 -0.8900000000000001,-0.4399999999999995 0,0 C0,0 0,0 0,0"
                                              keyPoints="0;0;0.5;1;1"
                                              keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="0"
                                              to="0"
                                              type="rotate"
                                              additive="sum"
                                              keyTimes="0;0.1510417;0.2708334;0.3420208;1"
                                              values="0;0;-5;0;0"
                                              keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                              calcMode="spline"
                                            ></animateTransform>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="1 1"
                                              to="1 1"
                                              type="scale"
                                              additive="sum"
                                              keyTimes="0;0.1510417;0.2708334;0.3420208;1"
                                              values="1 1;1 1;1.05 1.05;1 1;1 1"
                                              keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                              calcMode="spline"
                                            ></animateTransform>
                                          </g>
                                        </g>
                                      </g>
                                    </svg>
                                  </div>
                                  <p
                                    style={{
                                      margin: "0",
                                      fontSize: "0.75rem",
                                      color: "rgba(0,0,0,.54)",
                                      marginRight: "0.5rem",
                                      fontFamily:
                                        "Roboto,Helvetica,Arial,sans-serif",
                                      lineHeight: "1rem",
                                      letterSpacing: "0.03333em",
                                      fontWeight: "400",
                                      marginLeft: "-0.75rem",
                                    }}
                                  >
                                    {formatNumber(video.Reactions)}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Segunda linha: 4 vídeos */}
                        {videos.slice(2, 6).map((video) => (
                          <div
                            key={video.videoId}
                            style={{
                              flex: "0 0 calc(25.9% - 1rem)",
                              paddingTop: "0.5rem",
                            }} // 25% da largura - metade do gap
                          >
                            <div style={{ position: "relative" }}>
                              <img
                                src={getVideoThumbnail(movieId, video.videoId)}
                                alt={video.Title}
                                style={{
                                  width: "190px",
                                  height: "106.867px",
                                  borderRadius: "8px",
                                  objectFit: "cover",
                                  objectPosition: "15% 15%",
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 20, // afastamento do canto inferior
                                  left: 20, // afastamento do canto esquerdo
                                  display: "flex",
                                  alignItems: "center",
                                  // espaço entre o círculo e o texto
                                  cursor: "pointer",
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
                                    left: "-8px",
                                  }}
                                >
                                  {/* Círculo com borda branca */}
                                  <div
                                    style={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: "50%",
                                      border: "3px solid white", // borda branca
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      filter:
                                        "drop-shadow(0 0 4px rgba(0,0,0,0.7))",
                                      transition: "background-color 0.3s ease",
                                      position: "relative",
                                      top: "0px",
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      role="presentation"
                                      style={{
                                        transform: "rotate(-90deg)",
                                        color: "white",
                                      }}
                                    >
                                      <path
                                        fill="none"
                                        d="M0 0h24v24H0V0z"
                                      ></path>
                                      <path d="M8.71 11.71l2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71z" />
                                    </svg>
                                  </div>

                                  {/* Texto ao lado */}
                                  <span
                                    style={{
                                      color: "white",
                                      fontSize: "1rem",
                                      userSelect: "none",
                                      textShadow: "0 0 5px rgba(0,0,0,0.7)",
                                      position: "relative",
                                      left: "-4px",
                                      fontFamily:
                                        "Roboto,Helvetica,Arial,sans-serif",
                                    }}
                                  >
                                    {video.Type}
                                  </span>
                                  <span
                                    style={{
                                      color: "white",
                                      position: "relative",
                                      left: "-7px",
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {video.Duration}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p
                              style={{
                                padding: ".50rem .25rem .25rem",
                                fontSize: "1rem",
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                                fontWeight: "400",
                                lineHeight: "1.5rem",
                                letterSpacing: "0.03125em",
                                display: "block",
                                cursor: "pointer",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxHeight: "48px",
                                maxWidth: "190px",
                                margin: "0",
                              }}
                            >
                              {video.Title}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                marginLeft: "-0.25rem",
                                alignItems: "center",
                              }}
                            >
                              {video.Likes > 0 && (
                                <>
                                  <div
                                    style={{
                                      width: "24px",
                                      height: "16px",
                                      display: "flex",
                                      alignContent: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="1rem"
                                      height="1rem"
                                      style={{ color: "rgb(0,0,0,.54)" }}
                                      class="ipc-icon ipc-icon--thumb-up ipc-reaction-summary__likes-icon"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      role="presentation"
                                    >
                                      <path d="M13.12 2.06c.58-.59 1.52-.59 2.11-.01.36.36.51.87.41 1.37L14.69 8h5.65c2.15 0 3.6 2.2 2.76 4.18l-3.26 7.61C19.52 20.52 18.8 21 18 21H9c-1.1 0-2-.9-2-2V9.01c0-.53.21-1.04.58-1.41l5.54-5.54zM9.293 8.707A1 1 0 0 0 9 9.414V18a1 1 0 0 0 1 1h7.332a1 1 0 0 0 .924-.617c1.663-4.014 2.527-6.142 2.594-6.383.07-.253.12-.587.15-1v-.002A1 1 0 0 0 20 10h-8l1.34-5.34-4.047 4.047zM3 21c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2s-2 .9-2 2v8c0 1.1.9 2 2 2z"></path>
                                    </svg>
                                  </div>
                                  <p
                                    style={{
                                      margin: "0",
                                      fontSize: "0.75rem",
                                      color: "rgba(0,0,0,.54)",
                                      marginRight: "0.5rem",
                                      fontFamily:
                                        "Roboto,Helvetica,Arial,sans-serif",
                                      lineHeight: "1rem",
                                      letterSpacing: "0.03333em",
                                      fontWeight: "400",
                                    }}
                                  >
                                    {formatNumber(video.Likes)}
                                  </p>
                                </>
                              )}
                              {video.Reactions > 0 && (
                                <>
                                  <div
                                    style={{
                                      opacity: "0.7",
                                      height: "19px",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      xmlns:xlink="http://www.w3.org/1999/xlink"
                                      role="presentation"
                                      preserveAspectRatio="xMidYMid meet"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 500 500"
                                      class="ipc-reaction ipc-reaction--heart ipc-reaction--inline ipc-reaction-summary__reaction"
                                      fill="currentColor"
                                    >
                                      <g>
                                        <g opacity="0">
                                          <g transform=" translate(130, 250) scale(0.16, 0.16) ">
                                            <g transform=" translate(0, 6.312) scale(1, 1.1) translate(-250, -255.738)">
                                              <path
                                                fill="#ee3e81"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,349.69 247.14,372.56 C248.01,373.16 249,372.87 250,372.86 C251,372.87 252,373.16 252.86,372.56 C286.03,349.69 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                              >
                                                <animate
                                                  repeatCount="1"
                                                  dur="2.002002s"
                                                  begin="indefinite"
                                                  fill="remove"
                                                  attributeName="d"
                                                  attributeType="XML"
                                                  from="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,349.69 247.14,372.56 C248.01,373.16 249,372.87 250,372.86 C251,372.87 252,373.16 252.86,372.56 C286.03,349.69 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                  to="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                  keyTimes="0;0.0416667;1"
                                                  values="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,349.69 247.14,372.56 C248.01,373.16 249,372.87 250,372.86 C251,372.87 252,373.16 252.86,372.56 C286.03,349.69 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                  keySplines="0.167 0.167 0.833 0.833;0 0 0 0"
                                                  calcMode="spline"
                                                ></animate>
                                              </path>
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="opacity"
                                                from="1"
                                                to="0"
                                                keyTimes="0;0.2083334;0.6041667;1"
                                                values="1;1;0;0"
                                                keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </g>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.0416667;0.6041667;1"
                                              path="M0 0 C0,0 0,0 0,0 C0,0 -58,40 -70,-164 C-70,-164 -70,-164 -70,-164"
                                              keyPoints="0;0;1;1"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="0.16 0.16"
                                              to="0.16 0.16"
                                              type="scale"
                                              additive="sum"
                                              keyTimes="0;1"
                                              values="1 1;1 1"
                                              keySplines="0 0 1 1"
                                              calcMode="spline"
                                            ></animateTransform>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="0"
                                            keyTimes="0;0.1875;0.1875021;0.875;0.875;1"
                                            values="0;0;1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g opacity="0">
                                          <g transform=" translate(130, 250) scale(0.16, 0.16) ">
                                            <g transform=" translate(102.692, -80.302) scale(1, 1.1) translate(-352.692, -176.998)">
                                              <path
                                                fill="#f8bbad"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M348.84 166.12 C366.26,174.01 369.73,188 371.64,201.64 C372.13,205.08 375.77,206.98 378.45,206.53 C381.58,206 382.52,203.95 382.62,197.95 C382.87,181.95 370.32,157.23 351.07,153.75 C347.65,153.13 344.39,155.4 343.77,158.82 C343.39,160.91 343.29,163.61 348.84,166.12z "
                                              ></path>
                                              <path
                                                fill="#f8bbad"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M332.5 157.18 C334.74,154.96 334.76,151.34 332.54,149.1 C330.32,146.86 326.7,146.84 324.46,149.06 C322.22,151.28 322.2,154.89 324.42,157.13 C326.64,159.38 330.25,159.39 332.5,157.18z "
                                              ></path>
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="opacity"
                                                from="1"
                                                to="0"
                                                keyTimes="0;0.2083334;0.6041667;1"
                                                values="1;1;0;0"
                                                keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </g>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.0416667;0.6041667;1"
                                              path="M0 0 C0,0 0,0 0,0 C0,0 -58,40 -70,-164 C-70,-164 -70,-164 -70,-164"
                                              keyPoints="0;0;1;1"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="0.16 0.16"
                                              to="0.16 0.16"
                                              type="scale"
                                              additive="sum"
                                              keyTimes="0;1"
                                              values="1 1;1 1"
                                              keySplines="0 0 1 1"
                                              calcMode="spline"
                                            ></animateTransform>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="0"
                                            keyTimes="0;0.1875;0.1875021;0.875;0.875;1"
                                            values="0;0;1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g opacity="0">
                                          <g transform=" translate(130, 250) scale(0.16, 0.16) ">
                                            <g transform=" translate(-37.868, 6.312) scale(1, 1.1) translate(-212.132, -255.738)">
                                              <path
                                                fill="#b23f64"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,374.67 250.46,374.67 C250.46,374.67 251.25,374.13 252.65,373.17 C230.15,355.29 151.58,321.6 125.02,263.95z "
                                              >
                                                <animate
                                                  repeatCount="1"
                                                  dur="2.002002s"
                                                  begin="indefinite"
                                                  fill="remove"
                                                  attributeName="d"
                                                  attributeType="XML"
                                                  from="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,374.67 250.46,374.67 C250.46,374.67 251.25,374.13 252.65,373.17 C230.15,355.29 151.58,321.6 125.02,263.95z "
                                                  to="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z "
                                                  keyTimes="0;0.0416667;1"
                                                  values="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,374.67 250.46,374.67 C250.46,374.67 251.25,374.13 252.65,373.17 C230.15,355.29 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z "
                                                  keySplines="0.167 0.167 0.833 0.833;0 0 0 0"
                                                  calcMode="spline"
                                                ></animate>
                                              </path>
                                              <path
                                                fill="#b23f64"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M333.93 124.88 C296.58,121.15 257.89,141.21 246.59,155.72 C246.59,155.72 251.52,161.62 251.52,161.62 C253.64,164.15 257.59,163.99 259.45,161.26 C267.52,149.35 291.39,126.04 333.93,124.88z "
                                              ></path>
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="opacity"
                                                from="1"
                                                to="0"
                                                keyTimes="0;0.2083334;0.6041667;1"
                                                values="1;1;0;0"
                                                keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </g>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.0416667;0.6041667;1"
                                              path="M0 0 C0,0 0,0 0,0 C0,0 -58,40 -70,-164 C-70,-164 -70,-164 -70,-164"
                                              keyPoints="0;0;1;1"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="0.16 0.16"
                                              to="0.16 0.16"
                                              type="scale"
                                              additive="sum"
                                              keyTimes="0;1"
                                              values="1 1;1 1"
                                              keySplines="0 0 1 1"
                                              calcMode="spline"
                                            ></animateTransform>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="0"
                                            keyTimes="0;0.1875;0.1875021;0.875;0.875;1"
                                            values="0;0;1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g opacity="0">
                                          <g transform=" translate(130, 250) scale(0.16, 0.16) ">
                                            <g transform=" translate(0, 6.312) scale(1, 1.1) translate(-250, -255.738)">
                                              <path
                                                fill="#ee3e81"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                              >
                                                <animate
                                                  repeatCount="1"
                                                  dur="2.002002s"
                                                  begin="indefinite"
                                                  fill="remove"
                                                  attributeName="d"
                                                  attributeType="XML"
                                                  from="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                  to="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                  keyTimes="0;0.0416667;0.1041667;1"
                                                  values="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,349.69 247.14,372.56 C248.01,373.16 249,372.87 250,372.86 C251,372.87 252,373.16 252.86,372.56 C286.03,349.69 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                  keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                                  calcMode="spline"
                                                ></animate>
                                              </path>
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="opacity"
                                                from="1"
                                                to="0"
                                                keyTimes="0;0.2708334;0.6666667;1"
                                                values="1;1;0;0"
                                                keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </g>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.1041667;0.6666667;1"
                                              path="M0 0 C0,0 0,0 0,0 C0,0 -90,108 -102,-96 C-102,-96 -102,-96 -102,-96"
                                              keyPoints="0;0;1;1"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="0.16 0.16"
                                              to="0.16 0.16"
                                              type="scale"
                                              additive="sum"
                                              keyTimes="0;1"
                                              values="1 1;1 1"
                                              keySplines="0 0 1 1"
                                              calcMode="spline"
                                            ></animateTransform>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="0"
                                            keyTimes="0;0.25;0.2500021;0.9375;0.9375;1"
                                            values="0;0;1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g opacity="0">
                                          <g transform=" translate(130, 250) scale(0.16, 0.16) ">
                                            <g transform=" translate(102.692, -80.302) scale(1, 1.1) translate(-352.692, -176.998)">
                                              <path
                                                fill="#f8bbad"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M348.84 166.12 C366.26,174.01 369.73,188 371.64,201.64 C372.13,205.08 375.77,206.98 378.45,206.53 C381.58,206 382.52,203.95 382.62,197.95 C382.87,181.95 370.32,157.23 351.07,153.75 C347.65,153.13 344.39,155.4 343.77,158.82 C343.39,160.91 343.29,163.61 348.84,166.12z "
                                              ></path>
                                              <path
                                                fill="#f8bbad"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M332.5 157.18 C334.74,154.96 334.76,151.34 332.54,149.1 C330.32,146.86 326.7,146.84 324.46,149.06 C322.22,151.28 322.2,154.89 324.42,157.13 C326.64,159.38 330.25,159.39 332.5,157.18z "
                                              ></path>
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="opacity"
                                                from="1"
                                                to="0"
                                                keyTimes="0;0.2708334;0.6666667;1"
                                                values="1;1;0;0"
                                                keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </g>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.1041667;0.6666667;1"
                                              path="M0 0 C0,0 0,0 0,0 C0,0 -90,108 -102,-96 C-102,-96 -102,-96 -102,-96"
                                              keyPoints="0;0;1;1"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="0.16 0.16"
                                              to="0.16 0.16"
                                              type="scale"
                                              additive="sum"
                                              keyTimes="0;1"
                                              values="1 1;1 1"
                                              keySplines="0 0 1 1"
                                              calcMode="spline"
                                            ></animateTransform>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="0"
                                            keyTimes="0;0.25;0.2500021;0.9375;0.9375;1"
                                            values="0;0;1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g opacity="0">
                                          <g transform=" translate(130, 250) scale(0.16, 0.16) ">
                                            <g transform=" translate(-37.868, 6.312) scale(1, 1.1) translate(-212.132, -255.738)">
                                              <path
                                                fill="#b23f64"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z "
                                              >
                                                <animate
                                                  repeatCount="1"
                                                  dur="2.002002s"
                                                  begin="indefinite"
                                                  fill="remove"
                                                  attributeName="d"
                                                  attributeType="XML"
                                                  from="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z "
                                                  to="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z "
                                                  keyTimes="0;0.0416667;0.1041667;1"
                                                  values="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,374.67 250.46,374.67 C250.46,374.67 251.25,374.13 252.65,373.17 C230.15,355.29 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.83,118.12 130.12,119.67 102.55,165.63 C75.04,212.49 98.91,257.85 125.92,288.64 C150.76,316.97 250.46,389.67 250.46,389.67 C250.46,389.67 251.25,389.12 252.65,388.17 C230.15,370.29 151.58,321.6 125.02,263.95z "
                                                  keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                                  calcMode="spline"
                                                ></animate>
                                              </path>
                                              <path
                                                fill="#b23f64"
                                                fill-opacity="1"
                                                fill-rule="nonzero"
                                                d=" M333.93 124.88 C296.58,121.15 257.89,141.21 246.59,155.72 C246.59,155.72 251.52,161.62 251.52,161.62 C253.64,164.15 257.59,163.99 259.45,161.26 C267.52,149.35 291.39,126.04 333.93,124.88z "
                                              ></path>
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="opacity"
                                                from="1"
                                                to="0"
                                                keyTimes="0;0.2708334;0.6666667;1"
                                                values="1;1;0;0"
                                                keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </g>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.1041667;0.6666667;1"
                                              path="M0 0 C0,0 0,0 0,0 C0,0 -90,108 -102,-96 C-102,-96 -102,-96 -102,-96"
                                              keyPoints="0;0;1;1"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="0.16 0.16"
                                              to="0.16 0.16"
                                              type="scale"
                                              additive="sum"
                                              keyTimes="0;1"
                                              values="1 1;1 1"
                                              keySplines="0 0 1 1"
                                              calcMode="spline"
                                            ></animateTransform>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="0"
                                            keyTimes="0;0.25;0.2500021;0.9375;0.9375;1"
                                            values="0;0;1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g transform=" translate(250, 250) scale(1.1, 1.1) ">
                                          <g transform=" translate(0, 5.738) translate(-250, -255.738)">
                                            <path
                                              fill="#ee3e81"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                            >
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="d"
                                                attributeType="XML"
                                                from="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                to="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                keyTimes="0;0.0625;0.1041667;0.1666667;1"
                                                values="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,349.69 247.14,372.56 C248.01,373.16 249,372.87 250,372.86 C251,372.87 252,373.16 252.86,372.56 C286.03,349.69 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </path>
                                            <path
                                              stroke="#b23f64"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                              fill="none"
                                              stroke-width="6"
                                              stroke-opacity="1"
                                              d=" M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                            >
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="d"
                                                attributeType="XML"
                                                from="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                to="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                keyTimes="0;0.0625;0.1041667;0.1666667;1"
                                                values="M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,349.69 247.14,372.56 C248.01,373.16 249,372.87 250,372.86 C251,372.87 252,373.16 252.86,372.56 C286.03,349.69 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z ;M370.51 137.24 C327.87,108.27 272.89,136 253.47,155.4 C252.5,156.37 251.25,156.85 250,156.91 C248.75,156.85 247.5,156.37 246.53,155.4 C227.11,136 172.13,108.27 129.49,137.24 C68.5,181.26 86.72,250.91 130.06,292.7 C155.76,319.25 213.97,363.03 247.14,385.9 C248.01,386.5 249,386.78 250,386.77 C251,386.78 252,386.5 252.86,385.9 C286.03,363.03 344.24,319.25 369.95,292.7 C413.28,250.91 431.5,181.26 370.51,137.24z "
                                                keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </path>
                                          </g>
                                          <animateMotion
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            keyTimes="0;0.1041667;0.1666667;0.2291667;0.2916667;0.3958334;0.5416667;0.7291667;1"
                                            path="M0 0 C0,16.670000000000016 0,83.32999999999998 0,100 C0,100 0,100 0,100 C0,83.32999999999998 0,20 0,0 C0,-20 0,-20.330000000000013 0,-20 C0,-19.669999999999987 0,0.3300000000000125 0,2 C0,3.6699999999999875 0,-9.669999999999987 0,-10 C0,-10.330000000000013 0,-1.6699999999999875 0,0 C0,0 0,0 0,0"
                                            keyPoints="0;0.38;0.38;0.76;0.83;0.92;0.96;1;1"
                                            keySplines="0.333 0 0.667 1;0.333 0.333 0.667 0.667;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                            calcMode="spline"
                                          ></animateMotion>
                                          <animateTransform
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="transform"
                                            from="1.1 1.1"
                                            to="1.1 1.1"
                                            type="scale"
                                            additive="sum"
                                            keyTimes="0;0.1041667;0.1666667;0.2291667;0.2916667;0.3958334;0.5416667;0.7291667;1"
                                            values="1 1;0.7272727272727273 0.6818181818181818;0.7272727272727273 0.6818181818181818;0.9636363636363636 1;1.0272727272727273 1.0272727272727273;0.8909090909090909 0.8909090909090909;0.9909090909090909 0.9909090909090909;1 1;1 1"
                                            keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                            calcMode="spline"
                                          ></animateTransform>
                                        </g>
                                        <g transform=" translate(250, 250) scale(1.1, 1.1) ">
                                          <g transform=" translate(102.692, -73.002) translate(-352.692, -176.998)">
                                            <path
                                              fill="#f8bbad"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M348.84 166.12 C366.26,174.01 369.73,188 371.64,201.64 C372.13,205.08 375.77,206.98 378.45,206.53 C381.58,206 382.52,203.95 382.62,197.95 C382.87,181.95 370.32,157.23 351.07,153.75 C347.65,153.13 344.39,155.4 343.77,158.82 C343.39,160.91 343.29,163.61 348.84,166.12z "
                                            ></path>
                                            <path
                                              fill="#f8bbad"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M332.5 157.18 C334.74,154.96 334.76,151.34 332.54,149.1 C330.32,146.86 326.7,146.84 324.46,149.06 C322.22,151.28 322.2,154.89 324.42,157.13 C326.64,159.38 330.25,159.39 332.5,157.18z "
                                            ></path>
                                          </g>
                                          <animateMotion
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            keyTimes="0;0.1041667;0.1666667;0.2291667;0.2916667;0.3958334;0.5416667;0.7291667;1"
                                            path="M0 0 C0,16.670000000000016 0,83.32999999999998 0,100 C0,100 0,100 0,100 C0,83.32999999999998 0,20 0,0 C0,-20 0,-20.330000000000013 0,-20 C0,-19.669999999999987 0,0.3300000000000125 0,2 C0,3.6699999999999875 0,-9.669999999999987 0,-10 C0,-10.330000000000013 0,-1.6699999999999875 0,0 C0,0 0,0 0,0"
                                            keyPoints="0;0.38;0.38;0.76;0.83;0.92;0.96;1;1"
                                            keySplines="0.333 0 0.667 1;0.333 0.333 0.667 0.667;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                            calcMode="spline"
                                          ></animateMotion>
                                          <animateTransform
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="transform"
                                            from="1.1 1.1"
                                            to="1.1 1.1"
                                            type="scale"
                                            additive="sum"
                                            keyTimes="0;0.1041667;0.1666667;0.2291667;0.2916667;0.3958334;0.5416667;0.7291667;1"
                                            values="1 1;0.7272727272727273 0.6818181818181818;0.7272727272727273 0.6818181818181818;0.9636363636363636 1;1.0272727272727273 1.0272727272727273;0.8909090909090909 0.8909090909090909;0.9909090909090909 0.9909090909090909;1 1;1 1"
                                            keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                            calcMode="spline"
                                          ></animateTransform>
                                        </g>
                                        <g transform=" translate(250, 250) scale(1.1, 1.1) ">
                                          <g transform=" translate(-37.868, 5.738) translate(-212.132, -255.738)">
                                            <path
                                              fill="#b23f64"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C173.18,114.09 127.39,121.03 99.82,166.99 C72.31,213.85 99.37,261.03 126.37,291.83 C151.21,320.15 248.74,389.94 248.74,389.94 C248.74,389.94 250.05,387.79 251.44,386.83 C228.94,368.96 151.58,321.6 125.02,263.95z "
                                            >
                                              <animate
                                                repeatCount="1"
                                                dur="2.002002s"
                                                begin="indefinite"
                                                fill="remove"
                                                attributeName="d"
                                                attributeType="XML"
                                                from="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C173.18,114.09 127.39,121.03 99.82,166.99 C72.31,213.85 99.37,261.03 126.37,291.83 C151.21,320.15 248.74,389.94 248.74,389.94 C248.74,389.94 250.05,387.79 251.44,386.83 C228.94,368.96 151.58,321.6 125.02,263.95z "
                                                to="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.66,114.6 129.01,119.67 101.45,165.63 C73.93,212.49 98.91,260.06 125.92,290.86 C150.76,319.18 249,389.45 249,389.45 C249,389.45 250.05,387.79 251.44,386.83 C228.94,368.96 151.58,321.6 125.02,263.95z "
                                                keyTimes="0;0.0625;0.1041667;0.1666667;0.2916667;1"
                                                values="M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C173.18,114.09 127.39,121.03 99.82,166.99 C72.31,213.85 99.37,261.03 126.37,291.83 C151.21,320.15 248.74,389.94 248.74,389.94 C248.74,389.94 250.05,387.79 251.44,386.83 C228.94,368.96 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C176.57,115.1 128.46,118.81 100.9,164.77 C73.38,211.63 98.36,259.85 125.36,290.65 C150.21,318.98 250.1,388.12 250.1,388.12 C250.41,388.12 250.48,387.79 251.44,386.83 C228.94,368.96 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.94,114.33 127.93,119 100.36,164.96 C72.85,211.82 99.23,260.52 126.23,291.31 C151.07,319.64 250.46,374.67 250.46,374.67 C250.46,374.67 251.25,374.13 252.65,373.17 C230.15,355.29 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C178.75,115.33 128.24,118.67 100.68,164.63 C73.16,211.49 97.35,259.52 124.35,290.31 C149.2,318.64 250.1,388.12 250.1,388.12 C250.1,388.12 250.05,387.79 251.44,386.83 C228.94,368.96 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.66,114.6 129.01,119.67 101.45,165.63 C73.93,212.49 98.91,260.06 125.92,290.86 C150.76,319.18 249,389.45 249,389.45 C249,389.45 250.05,387.79 251.44,386.83 C228.94,368.96 151.58,321.6 125.02,263.95z ;M125.02 263.95 C107.93,226.84 107.35,183.65 144.91,150.73 C170.25,128.53 193.2,127.35 211.26,133.33 C175.66,114.6 129.01,119.67 101.45,165.63 C73.93,212.49 98.91,260.06 125.92,290.86 C150.76,319.18 249,389.45 249,389.45 C249,389.45 250.05,387.79 251.44,386.83 C228.94,368.96 151.58,321.6 125.02,263.95z "
                                                keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                                calcMode="spline"
                                              ></animate>
                                            </path>
                                            <path
                                              fill="#b23f64"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M333.93 124.88 C296.58,121.15 257.89,141.21 246.59,155.72 C246.59,155.72 251.52,161.62 251.52,161.62 C253.64,164.15 257.59,163.99 259.45,161.26 C267.52,149.35 291.39,126.04 333.93,124.88z "
                                            ></path>
                                          </g>
                                          <animateMotion
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            keyTimes="0;0.1041667;0.1666667;0.2291667;0.2916667;0.3958334;0.5416667;0.7291667;1"
                                            path="M0 0 C0,16.670000000000016 0,83.32999999999998 0,100 C0,100 0,100 0,100 C0,83.32999999999998 0,20 0,0 C0,-20 0,-20.330000000000013 0,-20 C0,-19.669999999999987 0,0.3300000000000125 0,2 C0,3.6699999999999875 0,-9.669999999999987 0,-10 C0,-10.330000000000013 0,-1.6699999999999875 0,0 C0,0 0,0 0,0"
                                            keyPoints="0;0.38;0.38;0.76;0.83;0.92;0.96;1;1"
                                            keySplines="0.333 0 0.667 1;0.333 0.333 0.667 0.667;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                            calcMode="spline"
                                          ></animateMotion>
                                          <animateTransform
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="transform"
                                            from="1.1 1.1"
                                            to="1.1 1.1"
                                            type="scale"
                                            additive="sum"
                                            keyTimes="0;0.1041667;0.1666667;0.2291667;0.2916667;0.3958334;0.5416667;0.7291667;1"
                                            values="1 1;0.7272727272727273 0.6818181818181818;0.7272727272727273 0.6818181818181818;0.9636363636363636 1;1.0272727272727273 1.0272727272727273;0.8909090909090909 0.8909090909090909;0.9909090909090909 0.9909090909090909;1 1;1 1"
                                            keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                            calcMode="spline"
                                          ></animateTransform>
                                        </g>
                                      </g>
                                    </svg>
                                    <svg
                                      style={{
                                        position: "relative",
                                        left: "-12px",
                                        opacity: "0.7",
                                      }}
                                      xmlns="http://www.w3.org/2000/svg"
                                      xmlns:xlink="http://www.w3.org/1999/xlink"
                                      role="presentation"
                                      preserveAspectRatio="xMidYMid meet"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 500 500"
                                      class="ipc-reaction ipc-reaction--clap ipc-reaction--inline ipc-reaction-summary__reaction ipc-reaction-summary__reaction-front"
                                      fill="currentColor"
                                    >
                                      <g>
                                        <g>
                                          <g>
                                            <path
                                              fill="#ee9dc4"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M234.12 170.88 C233.44,172.09 231.77,172.38 230.75,171.47 C230.75,171.47 184.59,130.07 184.59,130.07 C180.97,126.83 182.72,121.3 187.8,119.91 C187.8,119.91 199.75,116.65 199.75,116.65 C203.1,115.74 206.63,117.07 208.07,119.78 C208.07,119.78 234.15,168.97 234.15,168.97 C234.46,169.56 234.45,170.28 234.12,170.88z "
                                            ></path>
                                            <animate
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="opacity"
                                              from="1"
                                              to="0"
                                              keyTimes="0;0.0833333;0.3541667;1"
                                              values="1;1;0;0"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animate>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="1"
                                            to="0"
                                            keyTimes="0;0.3958333;0.3958334;1"
                                            values="1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g>
                                          <g>
                                            <path
                                              fill="#ee82ae"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M282.18 163.83 C282.76,164.8 284.13,165 284.94,164.23 C284.94,164.23 321.54,129.36 321.54,129.36 C324.4,126.63 322.85,122.17 318.67,121.16 C318.67,121.16 308.86,118.8 308.86,118.8 C306.11,118.14 303.26,119.31 302.15,121.56 C302.15,121.56 282.11,162.27 282.11,162.27 C281.87,162.77 281.89,163.35 282.18,163.83z "
                                            ></path>
                                            <animate
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="opacity"
                                              from="1"
                                              to="0"
                                              keyTimes="0;0.0833333;0.3541667;1"
                                              values="1;1;0;0"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animate>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="1"
                                            to="0"
                                            keyTimes="0;0.3958333;0.3958334;1"
                                            values="1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g>
                                          <g>
                                            <path
                                              fill="#5ba7db"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M251.84 168.62 C253.37,169.68 255.56,169.03 256.25,167.32 C256.25,167.32 287.35,89.94 287.35,89.94 C289.79,83.88 284.39,78.24 277.44,79.59 C277.44,79.59 261.08,82.76 261.08,82.76 C256.5,83.65 253.03,87.35 252.9,91.48 C252.9,91.48 250.67,166.33 250.67,166.33 C250.64,167.24 251.08,168.09 251.84,168.62z "
                                            ></path>
                                            <animate
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="opacity"
                                              from="1"
                                              to="0"
                                              keyTimes="0;0.0833333;0.3541667;1"
                                              values="1;1;0;0"
                                              keySplines="0.333 0 0.667 1;0.333 0 0.667 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animate>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="1"
                                            to="0"
                                            keyTimes="0;0.3958333;0.3958334;1"
                                            values="1;1;0;0"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g opacity="0">
                                          <g opacity="0">
                                            <path
                                              fill="#ee9dc4"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M234.12 170.88 C233.44,172.09 231.77,172.38 230.75,171.47 C230.75,171.47 184.59,130.07 184.59,130.07 C180.97,126.83 182.72,121.3 187.8,119.91 C187.8,119.91 199.75,116.65 199.75,116.65 C203.1,115.74 206.63,117.07 208.07,119.78 C208.07,119.78 234.15,168.97 234.15,168.97 C234.46,169.56 234.45,170.28 234.12,170.88z "
                                              transform=" translate(22, 40)"
                                            ></path>
                                            <animate
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="opacity"
                                              from="0"
                                              to="1"
                                              keyTimes="0;0.375;0.5625;0.9583333;1"
                                              values="0;0;1;1;1"
                                              keySplines="0.306 0 0.648 1;0.306 0 0.648 1;0.394 0 0.829 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animate>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.0416667;0.375;0.7083333;1"
                                              path="M0 0 C0,0 0,0 0,0 C-0.3299999999999841,0 1.670000000000016,6.670000000000016 -2,0 C-5.670000000000016,-6.670000000000016 -18.669999999999987,-33.329999999999984 -22,-40 C-22,-40 -22,-40 -22,-40"
                                              keyPoints="0;0;0.13;1;1"
                                              keySplines="0.167 0 0.833 1;0.167 0 0.833 1;0.167 0 0 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="1"
                                            keyTimes="0;0.375;0.3750021;1"
                                            values="0;0;1;1"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g opacity="0">
                                          <g opacity="0">
                                            <path
                                              fill="#ee82ae"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M282.18 163.83 C282.76,164.8 284.13,165 284.94,164.23 C284.94,164.23 321.54,129.36 321.54,129.36 C324.4,126.63 322.85,122.17 318.67,121.16 C318.67,121.16 308.86,118.8 308.86,118.8 C306.11,118.14 303.26,119.31 302.15,121.56 C302.15,121.56 282.11,162.27 282.11,162.27 C281.87,162.77 281.89,163.35 282.18,163.83z "
                                              transform=" translate(-18, 40)"
                                            ></path>
                                            <animate
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="opacity"
                                              from="0"
                                              to="1"
                                              keyTimes="0;0.375;0.5625;0.9583333;1"
                                              values="0;0;1;1;1"
                                              keySplines="0.306 0 0.648 1;0.306 0 0.648 1;0.394 0 0.829 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animate>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.0416667;0.375;0.7083333;1"
                                              path="M0 0 C0,0 0,0 0,0 C-0.3300000000000125,0 -5,6.670000000000016 -2,0 C1,-6.670000000000016 14.669999999999987,-33.329999999999984 18,-40 C18,-40 18,-40 18,-40"
                                              keyPoints="0;0;0.14;1;1"
                                              keySplines="0.167 0 0.833 1;0.167 0 0.833 1;0.167 0 0 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="1"
                                            keyTimes="0;0.375;0.3750021;1"
                                            values="0;0;1;1"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g opacity="0">
                                          <g opacity="0">
                                            <path
                                              fill="#5ba7db"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M251.84 168.62 C253.37,169.68 255.56,169.03 256.25,167.32 C256.25,167.32 287.35,89.94 287.35,89.94 C289.79,83.88 284.39,78.24 277.44,79.59 C277.44,79.59 261.08,82.76 261.08,82.76 C256.5,83.65 253.03,87.35 252.9,91.48 C252.9,91.48 250.67,166.33 250.67,166.33 C250.64,167.24 251.08,168.09 251.84,168.62z "
                                              transform=" translate(2, 40)"
                                            ></path>
                                            <animate
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="opacity"
                                              from="0"
                                              to="1"
                                              keyTimes="0;0.375;0.5625;0.9583333;1"
                                              values="0;0;1;1;1"
                                              keySplines="0.195 0 0.562 1;0.195 0 0.562 1;0.352 0 0.843 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animate>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.0416667;0.375;0.7083333;1"
                                              path="M0 0 C0,0 0,0 0,0 C-0.3300000000000125,0 -1.6699999999999875,6.670000000000016 -2,0 C-2.3300000000000125,-6.670000000000016 -2,-33.329999999999984 -2,-40 C-2,-40 -2,-40 -2,-40"
                                              keyPoints="0;0;0.14;1;1"
                                              keySplines="0.167 0 0.833 1;0.167 0 0.833 1;0.167 0 0 1;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                          </g>
                                          <animate
                                            repeatCount="1"
                                            dur="2.002002s"
                                            begin="indefinite"
                                            fill="remove"
                                            attributeName="opacity"
                                            from="0"
                                            to="1"
                                            keyTimes="0;0.375;0.3750021;1"
                                            values="0;0;1;1"
                                            keySplines="0 0 0 0;0 0 0 0;0 0 0 0"
                                            calcMode="spline"
                                          ></animate>
                                        </g>
                                        <g transform=" translate(250, 250) scale(5, 5) translate(0, 0)">
                                          <g>
                                            <path
                                              stroke="#af772a"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                              fill="none"
                                              stroke-width="2"
                                              stroke-opacity="1"
                                              d=" M58.11 33.75 C57.87,32.96 57.41,32.31 56.83,31.83 C56.15,31.27 55.21,31.15 54.4,31.5 C54.4,31.5 39.2,38.1 39.2,38.1 C39.04,38.17 38.88,38.17 38.73,38.11 C38.59,38.05 38.46,37.94 38.4,37.78 C38.26,37.46 38.41,37.1 38.72,36.96 C38.72,36.96 55.58,29.64 55.58,29.64 C56.4,29.28 56.97,28.5 57.03,27.6 C57.08,26.91 56.96,26.19 56.63,25.51 C56.41,25.07 56.13,24.7 55.79,24.38 C55.09,23.74 54.08,23.58 53.22,23.96 C52.45,24.3 51.53,24.71 51.49,24.72 C51.49,24.72 35.51,31.66 35.51,31.66 C35.35,31.73 35.19,31.73 35.04,31.67 C34.9,31.61 34.77,31.5 34.71,31.34 C34.57,31.02 34.72,30.66 35.03,30.52 C35.03,30.52 49.55,24.22 49.55,24.22 C50.75,23.7 51.34,22.28 50.83,21.06 C50.83,21.05 50.82,21.04 50.82,21.03 C49.96,18.98 47.62,18.03 45.61,18.91 C45.61,18.91 31.79,24.91 31.79,24.91 C31.79,24.91 28.28,26.42 28.28,26.42 C26.51,27.21 25.14,27.65 23.52,28 C23.52,28 23.49,28.01 23.49,28.01 C22.81,28.15 22.19,27.57 22.29,26.88 C22.29,26.88 22.92,22.07 22.92,22.07 C23.21,19.86 21.69,17.83 19.52,17.53 C17.35,17.24 15.35,18.78 15.06,20.99 C15.06,20.99 12.82,37.91 12.82,37.91 C12.75,38.45 12.64,38.99 12.53,39.52 C11.93,42.48 12.17,45.64 13.43,48.62 C16.71,56.43 25.6,60.05 33.28,56.71 C33.28,56.71 40.35,53.64 40.35,53.64 C40.52,53.59 40.69,53.54 40.86,53.47 C40.86,53.47 54.33,47.61 54.33,47.61 C56.35,46.74 57.28,44.37 56.42,42.32 C56.3,42.02 56.13,41.74 55.95,41.48 C55.29,40.6 54.11,40.3 53.1,40.74 C53.1,40.74 42.1,45.51 42.1,45.51 C41.93,45.59 41.75,45.58 41.6,45.52 C41.44,45.46 41.31,45.33 41.24,45.16 C41.1,44.83 41.25,44.43 41.58,44.29 C41.58,44.29 56.73,37.71 56.73,37.71 C57.29,37.47 57.75,37.02 57.98,36.45 C58.33,35.61 58.4,34.67 58.11,33.75z "
                                              transform=" translate(-31.995000000000005, -32.004)"
                                            ></path>
                                            <path
                                              fill="#f4b642"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M58.11 33.75 C57.87,32.96 57.41,32.31 56.83,31.83 C56.15,31.27 55.21,31.15 54.4,31.5 C54.4,31.5 39.2,38.1 39.2,38.1 C39.04,38.17 38.88,38.17 38.73,38.11 C38.59,38.05 38.46,37.94 38.4,37.78 C38.26,37.46 38.41,37.1 38.72,36.96 C38.72,36.96 55.58,29.64 55.58,29.64 C56.4,29.28 56.97,28.5 57.03,27.6 C57.08,26.91 56.96,26.19 56.63,25.51 C56.41,25.07 56.13,24.7 55.79,24.38 C55.09,23.74 54.08,23.58 53.22,23.96 C52.45,24.3 51.53,24.71 51.49,24.72 C51.49,24.72 35.51,31.66 35.51,31.66 C35.35,31.73 35.19,31.73 35.04,31.67 C34.9,31.61 34.77,31.5 34.71,31.34 C34.57,31.02 34.72,30.66 35.03,30.52 C35.03,30.52 49.55,24.22 49.55,24.22 C50.75,23.7 51.34,22.28 50.83,21.06 C50.83,21.05 50.82,21.04 50.82,21.03 C49.96,18.98 47.62,18.03 45.61,18.91 C45.61,18.91 31.79,24.91 31.79,24.91 C31.79,24.91 28.28,26.42 28.28,26.42 C26.51,27.21 25.14,27.65 23.52,28 C23.52,28 23.49,28.01 23.49,28.01 C22.81,28.15 22.19,27.57 22.29,26.88 C22.29,26.88 22.92,22.07 22.92,22.07 C23.21,19.86 21.69,17.83 19.52,17.53 C17.35,17.24 15.35,18.78 15.06,20.99 C15.06,20.99 12.82,37.91 12.82,37.91 C12.75,38.45 12.64,38.99 12.53,39.52 C11.93,42.48 12.17,45.64 13.43,48.62 C16.71,56.43 25.6,60.05 33.28,56.71 C33.28,56.71 40.35,53.64 40.35,53.64 C40.52,53.59 40.69,53.54 40.86,53.47 C40.86,53.47 54.33,47.61 54.33,47.61 C56.35,46.74 57.28,44.37 56.42,42.32 C56.3,42.02 56.13,41.74 55.95,41.48 C55.29,40.6 54.11,40.3 53.1,40.74 C53.1,40.74 42.1,45.51 42.1,45.51 C41.93,45.59 41.75,45.58 41.6,45.52 C41.44,45.46 41.31,45.33 41.24,45.16 C41.1,44.83 41.25,44.43 41.58,44.29 C41.58,44.29 56.73,37.71 56.73,37.71 C57.29,37.47 57.75,37.02 57.98,36.45 C58.33,35.61 58.4,34.67 58.11,33.75z "
                                              transform=" translate(-31.995000000000005, -32.004)"
                                            ></path>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.1510417;0.2708334;0.3420208;1"
                                              path="M0 0 C0,0 0,0 0,0 C0.8799999999999999,-0.4399999999999995 5.33,-2.6599999999999997 5.33,-2.6599999999999997 C5.33,-2.6599999999999997 0.8799999999999999,-0.4399999999999995 0,0 C0,0 0,0 0,0"
                                              keyPoints="0;0;0.5;1;1"
                                              keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="0"
                                              to="0"
                                              type="rotate"
                                              additive="sum"
                                              keyTimes="0;0.1510417;0.2708334;0.3420208;1"
                                              values="0;0;-10;0;0"
                                              keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                              calcMode="spline"
                                            ></animateTransform>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="1 1"
                                              to="1 1"
                                              type="scale"
                                              additive="sum"
                                              keyTimes="0;0.1510417;0.2708334;0.3420208;1"
                                              values="1 1;1 1;0.8 0.8;1 1;1 1"
                                              keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                              calcMode="spline"
                                            ></animateTransform>
                                          </g>
                                        </g>
                                        <g transform=" translate(250, 250) scale(5, 5) translate(0, 0)">
                                          <g>
                                            <path
                                              stroke="#af772a"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                              fill="none"
                                              stroke-width="2"
                                              stroke-opacity="1"
                                              d=" M52.29 37.65 C51.05,36.41 49.16,36.39 48.37,37.19 C48.37,37.19 39.92,45.78 39.92,45.78 C39.79,45.91 39.62,45.97 39.45,45.97 C39.28,45.97 39.12,45.91 38.99,45.78 C38.73,45.52 38.73,45.09 38.99,44.83 C38.99,44.83 50.61,33.03 50.61,33.03 C51.92,31.72 51.38,29.58 50.31,28.51 C48.86,27.06 46.83,27.48 46.18,28.14 C46.18,28.14 34.51,40 34.51,40 C34.39,40.12 34.23,40.18 34.08,40.18 C33.92,40.18 33.76,40.12 33.65,40 C33.41,39.75 33.41,39.36 33.65,39.12 C33.65,39.12 46.61,25.94 46.61,25.94 C47.24,25.31 47.81,23.31 46.07,21.72 C44.59,20.36 42.75,21.26 42.26,21.65 C41.45,22.29 28.72,35.41 28.72,35.41 C28.61,35.53 28.45,35.59 28.29,35.59 C28.14,35.59 27.98,35.53 27.86,35.41 C27.62,35.17 27.62,34.78 27.86,34.54 C27.86,34.54 39.03,23.19 39.03,23.19 C39.29,22.89 39.46,22.52 39.55,22.12 C39.88,20.6 38.81,19.18 37.34,18.68 C35.93,18.2 34.53,18.64 33.43,19.76 C33.43,19.76 22.8,30.55 22.8,30.55 C22.8,30.55 20.1,33.28 20.1,33.28 C18.74,34.68 17.63,35.61 16.25,36.55 C16.25,36.55 16.23,36.56 16.23,36.56 C15.65,36.95 14.87,36.65 14.7,35.97 C14.7,35.97 13.53,31.26 13.53,31.26 C12.99,29.1 10.83,27.8 8.71,28.34 C6.58,28.89 5.29,31.08 5.83,33.24 C5.83,33.24 9.95,49.78 9.95,49.78 C10.09,50.32 10.18,50.86 10.27,51.39 C10.8,54.36 12.19,57.21 14.45,59.5 C20.35,65.5 29.93,65.5 35.84,59.5 C35.84,59.5 41.27,53.98 41.27,53.98 C41.41,53.87 41.55,53.76 41.68,53.62 C41.68,53.62 51.88,43.26 51.88,43.26 C53.51,41.61 54.38,39.74 52.29,37.65z "
                                              transform=" translate(-31.994999999999997, -32.001999999999995)"
                                            ></path>
                                            <path
                                              fill="#fdd856"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M52.29 37.65 C51.05,36.41 49.16,36.39 48.37,37.19 C48.37,37.19 39.92,45.78 39.92,45.78 C39.79,45.91 39.62,45.97 39.45,45.97 C39.28,45.97 39.12,45.91 38.99,45.78 C38.73,45.52 38.73,45.09 38.99,44.83 C38.99,44.83 50.61,33.03 50.61,33.03 C51.92,31.72 51.38,29.58 50.31,28.51 C48.86,27.06 46.83,27.48 46.18,28.14 C46.18,28.14 34.51,40 34.51,40 C34.39,40.12 34.23,40.18 34.08,40.18 C33.92,40.18 33.76,40.12 33.65,40 C33.41,39.75 33.41,39.36 33.65,39.12 C33.65,39.12 46.61,25.94 46.61,25.94 C47.24,25.31 47.81,23.31 46.07,21.72 C44.59,20.36 42.75,21.26 42.26,21.65 C41.45,22.29 28.72,35.41 28.72,35.41 C28.61,35.53 28.45,35.59 28.29,35.59 C28.14,35.59 27.98,35.53 27.86,35.41 C27.62,35.17 27.62,34.78 27.86,34.54 C27.86,34.54 39.03,23.19 39.03,23.19 C39.29,22.89 39.46,22.52 39.55,22.12 C39.88,20.6 38.81,19.18 37.34,18.68 C35.93,18.2 34.53,18.64 33.43,19.76 C33.43,19.76 22.8,30.55 22.8,30.55 C22.8,30.55 20.1,33.28 20.1,33.28 C18.74,34.68 17.63,35.61 16.25,36.55 C16.25,36.55 16.23,36.56 16.23,36.56 C15.65,36.95 14.87,36.65 14.7,35.97 C14.7,35.97 13.53,31.26 13.53,31.26 C12.99,29.1 10.83,27.8 8.71,28.34 C6.58,28.89 5.29,31.08 5.83,33.24 C5.83,33.24 9.95,49.78 9.95,49.78 C10.09,50.32 10.18,50.86 10.27,51.39 C10.8,54.36 12.19,57.21 14.45,59.5 C20.35,65.5 29.93,65.5 35.84,59.5 C35.84,59.5 41.27,53.98 41.27,53.98 C41.41,53.87 41.55,53.76 41.68,53.62 C41.68,53.62 51.88,43.26 51.88,43.26 C53.51,41.61 54.38,39.74 52.29,37.65z "
                                              transform=" translate(-31.994999999999997, -32.001999999999995)"
                                            ></path>
                                            <path
                                              fill="#ffe38d"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M51.24 41.69 C51.44,41.9 51.78,41.88 51.93,41.63 C52.56,40.65 52.45,39.33 51.6,38.47 C50.75,37.61 49.45,37.49 48.48,38.13 C48.25,38.28 48.23,38.63 48.42,38.83 C48.42,38.83 51.24,41.69 51.24,41.69z "
                                              transform=" translate(-31.994999999999997, -32.001999999999995)"
                                            ></path>
                                            <path
                                              fill="#ffe38d"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M49.22 32.41 C49.42,32.61 49.76,32.59 49.91,32.35 C50.54,31.37 50.42,30.04 49.58,29.18 C48.73,28.32 47.43,28.21 46.46,28.84 C46.22,29 46.2,29.35 46.4,29.55 C46.4,29.55 49.22,32.41 49.22,32.41z "
                                              transform=" translate(-31.994999999999997, -32.001999999999995)"
                                            ></path>
                                            <path
                                              fill="#ffe38d"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M45.25 25.48 C45.44,25.66 45.76,25.64 45.9,25.42 C46.48,24.51 46.37,23.27 45.59,22.47 C44.8,21.67 43.58,21.57 42.68,22.15 C42.46,22.3 42.44,22.62 42.63,22.81 C42.63,22.81 45.25,25.48 45.25,25.48z "
                                              transform=" translate(-31.994999999999997, -32.001999999999995)"
                                            ></path>
                                            <path
                                              fill="#ffe38d"
                                              fill-opacity="1"
                                              fill-rule="nonzero"
                                              d=" M37.42 23.16 C37.6,23.36 37.93,23.34 38.07,23.11 C38.66,22.18 38.56,20.92 37.76,20.11 C36.95,19.29 35.72,19.19 34.8,19.79 C34.58,19.93 34.56,20.26 34.75,20.45 C34.75,20.45 37.42,23.16 37.42,23.16z "
                                              transform=" translate(-31.994999999999997, -32.001999999999995)"
                                            ></path>
                                            <animateMotion
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              keyTimes="0;0.1510417;0.2708334;0.3420208;1"
                                              path="M0 0 C0,0 0,0 0,0 C-0.8900000000000001,-0.4399999999999995 -5.34,-2.66 -5.34,-2.66 C-5.34,-2.66 -0.8900000000000001,-0.4399999999999995 0,0 C0,0 0,0 0,0"
                                              keyPoints="0;0;0.5;1;1"
                                              keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                              calcMode="spline"
                                            ></animateMotion>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="0"
                                              to="0"
                                              type="rotate"
                                              additive="sum"
                                              keyTimes="0;0.1510417;0.2708334;0.3420208;1"
                                              values="0;0;-5;0;0"
                                              keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                              calcMode="spline"
                                            ></animateTransform>
                                            <animateTransform
                                              repeatCount="1"
                                              dur="2.002002s"
                                              begin="indefinite"
                                              fill="remove"
                                              attributeName="transform"
                                              from="1 1"
                                              to="1 1"
                                              type="scale"
                                              additive="sum"
                                              keyTimes="0;0.1510417;0.2708334;0.3420208;1"
                                              values="1 1;1 1;1.05 1.05;1 1;1 1"
                                              keySplines="0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0.167 0.167 0.833 0.833;0 0 0 0"
                                              calcMode="spline"
                                            ></animateTransform>
                                          </g>
                                        </g>
                                      </g>
                                    </svg>
                                  </div>
                                  <p
                                    style={{
                                      margin: "0",
                                      fontSize: "0.75rem",
                                      color: "rgba(0,0,0,.54)",
                                      marginRight: "0.5rem",
                                      fontFamily:
                                        "Roboto,Helvetica,Arial,sans-serif",
                                      lineHeight: "1rem",
                                      letterSpacing: "0.03333em",
                                      fontWeight: "400",
                                      marginLeft: "-0.75rem",
                                    }}
                                  >
                                    {formatNumber(video.Reactions)}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/*Images*/}
                  {data.Photos2 > 0 &&
                    (() => {
                      const remainingCount = Math.max(data.Photos2 - 5, 0);
                      return (
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
                                    {data.Photos2}
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
                                      color: hovered
                                        ? "#F5C518"
                                        : "rgba(0,0,0)",
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
                                    fontFamily:
                                      "Roboto,Helvetica,Arial,sans-serif",
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

                            {/* GRID */}
                            <div>
                              {/* Linha 1 – 2 imagens grandes */}
                              <div
                                style={{
                                  display: "flex",
                                  flexFlow: "row",
                                  gap: "1rem",
                                  marginBottom: "1rem",
                                }}
                              >
                                {sortedImages.slice(0, Math.min(2, data.Photos2)).map((img, i) => (
                                  <img
                                    key={i}
                                    src={img.url}
                                    style={{
                                      width: "396px",
                                      height: "162.5px",
                                      borderRadius: "0.75rem",
                                      objectFit: "cover",
                                      objectPosition: "15% 15%",
                                      cursor: "pointer",
                                    }}
                                    onError={(e) =>
                                      (e.currentTarget.style.display = "none")
                                    }
                                  />
                                ))}
                              </div>

                              {/* Linha 2 – 2 médias + 1 pequena */}
                              {sortedImages.length > 2 && (
                              <div
                                style={{
                                  display: "flex",
                                  flexFlow: "row",
                                  gap: "1rem",
                                  marginBottom: "1rem",
                                }}
                              >
                                {sortedImages.slice(2, Math.min(5, data.Photos2)).map((img, i) => {
                                  const isLast = i === 2 && remainingCount > 0;
                                  return (
                                    <div
                                      key={i}
                                      style={{
                                        position: "relative",
                                        width: i < 2 ? "338.333px" : "100px",
                                        height: "149.817px",
                                        borderRadius: "0.75rem",
                                        overflow: "hidden",
                                      }}
                                    >
                                      <img
                                        src={img.url}
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                          objectPosition: "15% 15%",
                                          cursor: "pointer",
                                        }}
                                        onError={(e) =>
                                          (e.currentTarget.style.display =
                                            "none")
                                        }
                                      />

                                      {/* Overlay */}
                                      {isLast && (
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
                                          + {formatVotes(remainingCount)}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              )}
                            </div>
                          </div>
                        </section>
                      );
                    })()}

                  {/*Images*/}
                  {data.Photos2 < 1 && (
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
                              Add photo
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {data.Cast > 0 && (<>
                  {/*Stars*/}
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
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
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
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                                fontWeight: "400",
                                alignSelf: "center",
                                letterSpacing: "0.01786em",
                                lineHeight: "unset",
                                marginRight: "2px",
                              }}
                            >
                              {data.Cast > 99 ? "99+" : data.Cast}
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
                            padding: "0 8px 0 8px",
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
                      <CastList cast={cast} />
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
                          {getPluralLabel(data.Creators, "Creator", "Creators")}
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
                          {renderListWithDotSeparator2(data.Creators)}
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
                  </>)}

                  {/*User Reviews*/}
                  {data.UserReviews > 0 && (
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
                                {formatNumberNoRound(data.UserReviews)}
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
                                {data.Rating}
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
                              {formatToK(data.Votes)}
                            </span>
                          </div>
                          <div>
                            {ratingsBreakdown && (
                              <RatingsBarChart ratings={ratingsBreakdown} />
                            )}
                          </div>
                        </div>
                        {data.Runtime > 30 && (
                          <div>
                            <h3
                              style={{
                                margin: "0 0 16px 0",
                                fontSize: "1.5rem",
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                                letterSpacing: "normal",
                                lineHeight: "1.2em",
                                fontWeight: "600",
                              }}
                            >
                              Summary
                            </h3>
                          </div>
                        )}

                        <div>
                          {data.Runtime > 30 && (
                            <div>
                              <div
                                style={{
                                  fontFamily:
                                    "Roboto,Helvetica,Arial,sans-serif",
                                  fontSize: "1rem",
                                  lineHeight: "1.5rem",
                                  letterSpacing: "0.03125em",
                                  width: "808px",
                                }}
                              >
                                {data.Summary}
                              </div>
                              <div
                                style={{
                                  marginTop: "0.75rem",
                                  marginBottom: "16px",
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily:
                                      "Roboto,Helvetica,Arial,sans-serif",
                                    fontSize: "0.875rem",
                                    fontWeight: "400",
                                    lineHeight: "1.25rem",
                                    letterSpacing: "0.01786em",
                                    color: "rgb(0,0,0,0.54)",
                                  }}
                                >
                                  AI-generated from the text of user reviews
                                </span>
                              </div>
                            </div>
                          )}
                          {data.Runtime > 90 && (
                            <div
                              style={{
                                marginBottom: "16px",
                                width: "808px",
                              }}
                            >
                              <ThemesChips
                                positive={data.PositiveTheme}
                                neutral={data.NeutralTheme}
                                negative={data.NegativeTheme}
                              />
                            </div>
                          )}
                          {data.UserReviews > 2 && (
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

                  {/*Related More Like This */}
                  <section>
                    <img src={MoreLikeThis} alt="" />
                  </section>

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
                            padding: "0 8px 0 8px",
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
                      <div
                        style={{
                          maxWidth: "808px",
                        }}
                      >
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
                          Taglines
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
                          {data.Tagline}
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
                <section
                  style={{
                    paddingBottom: "24px",
                    marginBottom: "8px",
                  }}
                >
                  <img src={DidYouKnow} alt="" />
                </section>

                {/*Top Picks*/}
                <section>
                  <img src={TopPicks} alt="" />
                </section>

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
                          padding: "0 8px 0 8px",
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
                    {data.AlsoKnownAs == "N/A" ? null : (
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
                    )}
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
                          padding: "0 8px 0 8px",
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
                    {data.EpDuration == "m" ? null : (
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
                          {data.EpDuration}
                        </span>
                        {data.epDuration2 >= 60 && (
                          <span
                            style={{
                              marginLeft: "0.5rem",
                              color: "rgb(0,0,0,.54)",
                              fontWeight: "400",
                              letterSpacing: "0.03125em",
                              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                              fontSize: "1rem",
                              lineHeight: "1.5rem",
                            }}
                          >
                            ({data.EpDuration2})
                          </span>
                        )}
                      </div>
                    )}
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

                {/*Related news*/}
                <section>
                  <img src={RelatedNews} alt="" />
                </section>

                {/*Contribute to this page*/}
                <section>
                  <img src={ContributeToThisPage} alt="" />
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

export default SeriesPage;
