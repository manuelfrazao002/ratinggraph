import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import { createGlobalStyle } from "styled-components";
import { ChevronRight, ChevronDown, MilkIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { getShowCoverSrc, getTrailerSrc } from "./ShowImageSrc";

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

import Video1 from "./imgs/imdb/video1.png";
import Video2 from "./imgs/imdb/video2.png";

//Images for section Images
import Img1 from "./imgs/imdb/imgs/img1.jpg";
import Img2 from "./imgs/imdb/imgs/img2.jpg";
import Img3 from "./imgs/imdb/imgs/img3.jpg";
import Img4 from "./imgs/imdb/imgs/img4.jpg";
import Img5 from "./imgs/imdb/imgs/img5.jpg";

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
  const { movieId } = useParams();
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
                      Creators
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
                        Writers
                      </p>
                      <p                       style={{
                        fontWeight: "400",
                        letterSpacing: "0.03125em",
                        wordBreak: "break-word",
                        fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                        fontSize: "1rem",
                        lineHeight: "1.5rem",
                      }}>
                        {renderListWithDotSeparator(data.Writers)}
                      </p>
                    </div>
                  )}
                  <div
                    style={{
                      borderBottom: "1px solid #4B4B4B",                      
                      
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems:"center",
                        height: "49.283px",
                      }}
                    >
                      <div style={{
                        display:"flex",
                        alignItems:"center",
                      }}>
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
                              User reviews
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
                              Critic reviews
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
                  {(data.AwardsWon > 0 ||
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
                        {data.TopRatedPos > 0 && (
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

                        {data.TopRatedPos < 1 && (
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
                      <div
                        style={{
                          position: "relative",
                          left: "-24px",
                        }}
                      >
                        <img src={Video1} alt="" />
                        <img src={Video2} alt="" />
                      </div>
                    </div>
                  </section>

                  {/*Images*/}
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
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
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
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
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
                                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                                lineHeight: "1.25rem",
                                letterSpacing: "normal",
                              }}
                            >
                              + {formatVotes(data.Photos2 - 4)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

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
                              {data.Cast}
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
                          Creators
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
                          {data.Runtime > 30 && (
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
                          borderBottomWidth:"1px",
                          borderTopStyle: "solid",
                          borderBottomStyle:"solid",
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
                  <section style={{
                    paddingBottom:"24px",
                    marginBottom:"8px",
                  }}>
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
                            color:"rgb(14,99,190)",
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
                            color:"rgb(14,99,190)",
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
                            color:"rgb(14,99,190)",
                          }}
                        >
                          Official Facebook
                          <svg style={{marginLeft:"0.4em"}} width="10" height="10" xmlns="http://www.w3.org/2000/svg" class="ipc-icon ipc-icon--launch-inline ipc-icon--inline ipc-link__launch-icon" viewBox="0 0 24 24" fill="currentColor" role="presentation"><path d="M21.6 21.6H2.4V2.4h7.2V0H0v24h24v-9.6h-2.4v7.2zM14.4 0v2.4h4.8L7.195 14.49l2.4 2.4L21.6 4.8v4.8H24V0h-9.6z"></path></svg>
                          <span style={{ color: "black", margin: "0 6px" }}>·</span>
                          Official Instagram
                          <svg style={{marginLeft:"0.4em"}} width="10" height="10" xmlns="http://www.w3.org/2000/svg" class="ipc-icon ipc-icon--launch-inline ipc-icon--inline ipc-link__launch-icon" viewBox="0 0 24 24" fill="currentColor" role="presentation"><path d="M21.6 21.6H2.4V2.4h7.2V0H0v24h24v-9.6h-2.4v7.2zM14.4 0v2.4h4.8L7.195 14.49l2.4 2.4L21.6 4.8v4.8H24V0h-9.6z"></path></svg>
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
                            color:"rgb(14,99,190)",
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
                            color:"rgb(14,99,190)",
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
                            color:"rgb(14,99,190)",
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
                            >
                              
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
                          {data.EpDuration}
                        </span>
                        {data.epDuration2 > 60 && (
                        <span style={{
                          marginLeft:"0.5rem",
                          color:"rgb(0,0,0,.54)",
                          fontWeight:"400",
                          letterSpacing:"0.03125",
                          fontFamily:"Roboto,Helvetica,Arial,sans-serif",
                          fontSize:"1rem",
                          lineHeight:"1.5rem",
                        }}>
                          ({data.EpDuration2})
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
                            color:"rgb(14,99,190)",
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
                            color:"rgb(14,99,190)",
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
                  position:"relative",
                }}
              >
                <img
                  src={MoreToExplore}
                  alt=""
                  style={{
                    width: "364px",
                    height: "max-content",
                    margin:"0 24px 0 24px"
                  }}
                />
                <img src={MoreToExploreSticky} alt="" style={{
                  width: "412px",
                  position:"sticky",
                  top: "0px",
                  marginBottom:"23rem",
                }} />        
              </div>              
            </div>
          </div>
        </main>
        <div style={{ backgroundColor: "black",}}>
          <img src={Footer1} alt="" style={{ position: "relative" }} />
          <img src={Footer2} alt="" />
        </div>
      </div>
    </>
  );
}

export default SeriesPage;
