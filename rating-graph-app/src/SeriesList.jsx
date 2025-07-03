import { Link } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import Navbar from "./imgs/imdb/imdb_navbar.png";
import { createGlobalStyle } from "styled-components";
import {
  showCoverSrc,
  imgTrailerSrc,
  MainTitle,
  EpisodeTitle,
} from "./ShowImageSrc";
import { movieMap } from "./data/MovieMap";
import ListBiggerText from "./imgs/imdb/listpage/listbiggertext.png";
import ListChart from "./imgs/imdb/listpage/listchart.png";
import ListFilter from "./imgs/imdb/listpage/listfilter.png";
import ListLayout from "./imgs/imdb/listpage/listlayout.png";
import ListPercentage from "./imgs/imdb/listpage/listpercentage.png";
import ListSmallText from "./imgs/imdb/listpage/listsmalltext.png";

import InforButton from "./imgs/imdb/listpage/infobutton.png";
import MarkAsWatched from "./imgs/imdb/listpage/markaswatched.png";
import RateEp from "./imgs/imdb/rateep.png";

import SideContent from "./imgs/imdb/listpage/sidecontent.png";

import Footer1 from "./imgs/imdb/footer1.png";
import Footer2 from "./imgs/imdb/footer2.png";

const movies = [
  {
    id: "toe",
    title: "The Outside Explorers",
  },
  {
    id: "spacemetro",
    title: "Space Metro",
  },
];

function MovieList() {
  const [data, setData] = useState([]);
  const [sortKey, setSortKey] = useState("Votes");
  const [sortOrder, setSortOrder] = useState("desc"); // ou "desc"
  const [hoveredId, setHoveredId] = React.useState(null);

  useEffect(() => {
    // URLs dos CSVs que quer carregar (exemplo pegando o primeiro CSV de cada)
    const urls = [movieMap["toe"][0], movieMap["spacemetro"][0]];

    Promise.all(
      urls.map((url) =>
        fetch(url)
          .then((res) => res.text())
          .then(
            (csv) =>
              new Promise((resolve) =>
                Papa.parse(csv, {
                  header: true,
                  complete: (results) => resolve(results.data),
                  error: (err) => {
                    console.error("Erro ao carregar CSV", err);
                    resolve([]); // evita quebrar a Promise.all
                  },
                })
              )
          )
      )
    ).then((resultsArrays) => {
      // resultsArrays é um array com os dados de cada CSV
      // Junta tudo em um array só
      const allData = [].concat(...resultsArrays);
      setData(allData);
    });
  }, []);

  const GlobalStyle = createGlobalStyle`
  #root {
    padding: 0 !important;
    font-family: Roboto,Helvetica,Arial,sans-serif;
    background-color: black;
  }
`;

  const sortedData = [...data].sort((a, b) => {
    const valueA = a[sortKey];
    const valueB = b[sortKey];

    // Comparação numérica
    const isNumeric = !isNaN(valueA) && !isNaN(valueB);
    if (isNumeric) {
      return sortOrder === "asc"
        ? Number(valueA) - Number(valueB)
        : Number(valueB) - Number(valueA);
    }

    // Comparação textual
    return sortOrder === "asc"
      ? String(valueA).localeCompare(String(valueB))
      : String(valueB).localeCompare(String(valueA));
  });

  const ArrowUpIcon = () => (
    <svg
      width="24"
      height="24"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ color: "#0e63be" }}
    >
      <path d="M12 22a.968.968 0 01-.713-.288A.967.967 0 0111 21V5.825L7.1 9.7a.977.977 0 01-.688.288A.93.93 0 015.7 9.7a.948.948 0 01-.275-.7c0-.283.092-.517.275-.7l5.6-5.6c.1-.1.208-.17.325-.212.117-.042.242-.063.375-.063s.258.02.375.063a.877.877 0 01.325.212l5.6 5.6a.933.933 0 01.275.688c0 .275-.092.512-.275.712-.2.2-.438.3-.713.3a.973.973 0 01-.712-.3L13 5.825V21c0 .283-.096.52-.287.712A.968.968 0 0112 22z" />
    </svg>
  );

  const ArrowDownIcon = () => (
    <svg
      width="24"
      height="24"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ color: "#0e63be", transform: "rotate(180deg)" }}
    >
      <path d="M12 22a.968.968 0 01-.713-.288A.967.967 0 0111 21V5.825L7.1 9.7a.977.977 0 01-.688.288A.93.93 0 015.7 9.7a.948.948 0 01-.275-.7c0-.283.092-.517.275-.7l5.6-5.6c.1-.1.208-.17.325-.212.117-.042.242-.063.375-.063s.258.02.375.063a.877.877 0 01.325.212l5.6 5.6a.933.933 0 01.275.688c0 .275-.092.512-.275.712-.2.2-.438.3-.713.3a.973.973 0 01-.712-.3L13 5.825V21c0 .283-.096.52-.287.712A.968.968 0 0112 22z" />
    </svg>
  );

function formatVotes(votes) {
  if (!votes) return "N/A";

  const num = Number(votes.toString().replace(/[, ]+/g, ""));

  if (isNaN(num)) return "N/A";

  if (num < 1000) {
    return num.toString();
  } else if (num < 10_000) {
    const k = (num / 1000).toFixed(1);
    return k.endsWith('.0') ? `${parseInt(k)}K` : `${k}K`;
  } else if (num < 1_000_000) {
    return `${Math.round(num / 1000)}K`;
  } else {
    const m = (num / 1_000_000).toFixed(1);
    return m.endsWith('.0') ? `${parseInt(m)}M` : `${m}M`;
  }
}

const measureTextWidth = (text, fontSize = "15px", fontFamily = "Roboto, Helvetica, Arial, sans-serif") => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = `${fontSize} ${fontFamily}`;
    return context.measureText(text).width;
  };

  const selectRef = useRef(null);
  const [selectWidth, setSelectWidth] = useState("auto");

  useEffect(() => {
    if (selectRef.current) {
      const selectedOption = selectRef.current.options[selectRef.current.selectedIndex];
      const textWidth = measureTextWidth(selectedOption.text);
      setSelectWidth(`${textWidth + 40}px`);
    }
  }, [sortKey]);

  const shouldShowRating = (rating, votes) => {
  const ratingNum = Number(rating);
  const votesNum = Number(votes.toString().replace(/[,]+/g, ""));
  return !isNaN(ratingNum) && !isNaN(votesNum) && ratingNum > 0 && votesNum > 0;
};

  return (
    <div style={{ padding: 0, margin: 0 }}>
      <GlobalStyle />
      <div>
        <img src={Navbar} alt="" />
      </div>
      <div
        style={{
          backgroundColor: "white",
          width: "1232px",
          margin: "0 auto",
          padding: "24px 24px 0 24px",
          position: "relative",
          top: "-7px",
        }}
      >
        <section style={{ paddingTop: 24 }}>
          <img src={ListChart} alt="" />
          <div style={{ position: "relative", top: -6 }}>
            <div
              style={{
                display: "flex",
                maxHeight: "36.8px",
                alignItems: "center",
              }}
            >
              <hgroup style={{ color: "#212121", display: "flex" }}>
                <div
                  style={{
                    width: "4px",
                    backgroundColor: "#f5c518",
                    marginRight: "8px",
                    borderRadius: "20px",
                    height: "36.8px",
                    alignItems: "center",
                    alignSelf: "center",
                  }}
                />
                <h1 style={{ fontSize: "36.4px", fontWeight: "lighter" }}>
                  Most popular TV shows
                </h1>
              </hgroup>
            </div>
            </div>
        </section>
        <main style={{ display: "flex" }}>
          <div>
            <div style={{ position:"relative", top:"-6px" }}>
              <img src={ListSmallText} alt="" style={{height:"32px"}}/>
            </div>          
            <section>
              <div>
                <div>
                  <img src={ListPercentage} alt="" style={{ marginTop: 12 }} />
                </div>
                <div
                  style={{
                    width: "808px",
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "1px",
                    alignItems: "center",
                  }}
                >
                  <p style={{ color: "black" }}>{movies.length} Titles</p>
                  <img src={ListLayout} alt="" style={{ height: "48px" }} />
                </div>
                <div style={{ margin: "4px 4px 0px 0px", width: "808px" }}>
                  <img src={ListFilter} alt="" />
                </div>
              </div>
            </section>
            <div
              style={{
                width: "808px",
                display: "flex",
                justifyContent: "end",
                marginTop: "14px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <label
                    htmlFor="sort"
                    style={{ color: "black", float: "right" }}
                  >
                    Sort by
                  </label>
                  <select
      id="sort"
      ref={selectRef}
      value={sortKey}
      onChange={(e) => {
        setSortKey(e.target.value);
        const selectedOption = e.target.options[e.target.selectedIndex];
        const textWidth = measureTextWidth(selectedOption.text);
        setSelectWidth(`${textWidth}px`);
      }}
      style={{
        backgroundColor: "transparent",
        border: "none",
        color: "#0e63be",
        textAlign: "right",
        fontSize: "15px",
        height: "30px",
        letterSpacing: "0.5px",
        width: selectWidth,
        display: "inline-block",
      }}
    >
                    <option value="Popularity">Ranking</option>
                    <option value="Rating">IMDB rating</option>
                    <option value="BeginingYear">Release date</option>
                    <option value="Votes">Number of ratings</option>
                    <option value="Title">Alphabetical</option>
                    <option value="Rating">Rating</option>
                    <option value="Popularity">Popularity</option>
                    <option value="EpDuration">Runtime</option>
                  </select>

                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {sortOrder === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  </button>
                </div>
              </div>
            </div>

            <section
              style={{
                border: "1px solid #E0E0E0",
                width: "808px",
                borderRadius: "5px",
              }}
            >
              <div style={{ padding: "12px" }}>
                {sortedData.map((movie, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "2px 0 2px 0",
                      borderBottom:
                        index === sortedData.length - 1
                          ? "none"
                          : "1px solid #E0E0E0",
                      justifyContent: "space-between",
                    }}
                  >
                    <li
                      style={{
                        padding: "4px 0 4px 0",
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      <div style={{ verticalAlign: "center" }}>
                        <img
                          src={showCoverSrc[movie.movieId]} // movieId vem do CSV? Use esta chave para pegar a imagem
                          alt={movie.Title}
                          style={{
                            width: "72px",
                            height: "106.55px",
                            objectFit: "cover",
                            borderRadius: "12px",
                          }}
                        />
                      </div>
                      <div>
                        <div>
                          <p
                            style={{
                              color: "black",
                              margin: 0,
                              fontSize: "14px",
                              height: "16px",
                              marginTop: "8px",
                            }}
                          >
                            {movie.Popularity}{" "}
                            {/* Aqui o ícone + movie.PopUp entre parênteses */}
                            {movie.PopStatus === "up" && (
                              <>
                                (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="22"
                                  height="22"
                                  className="ipc-icon ipc-icon--arrow-drop-up ipc-icon--inline sc-ee671986-0 cgemQz base up arrow"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  role="presentation"
                                  style={{
                                    verticalAlign: "middle",
                                    color: "#008a00",
                                    margin: "0 -4.48px 0 -4.48px",
                                  }}
                                >
                                  <path fill="none" d="M0 0h24v24H0V0z"></path>
                                  <path d="M8.71 12.29L11.3 9.7a.996.996 0 0 1 1.41 0l2.59 2.59c.63.63.18 1.71-.71 1.71H9.41c-.89 0-1.33-1.08-.7-1.71z"></path>
                                </svg>
                                {movie.PopUp})
                              </>
                            )}
                            {movie.PopStatus === "down" && (
                              <>
                                (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="22"
                                  height="22"
                                  className="ipc-icon ipc-icon--arrow-drop-down ipc-icon--inline sc-ee671986-0 cgemQz base down arrow"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  role="presentation"
                                  style={{
                                    verticalAlign: "middle",
                                    color: "#bd2404",
                                    margin: "0 -4.48px 0 -4.48px",
                                  }}
                                >
                                  <path fill="none" d="M0 0h24v24H0V0z"></path>
                                  <path d="M8.71 11.71l2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71z"></path>
                                </svg>
                                {movie.PopUp})
                              </>
                            )}
                            {movie.PopStatus === "stay" && (
                              <>
                                (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  className="ipc-icon ipc-icon--dash ipc-icon--inline sc-ee671986-0 cgemQz base flat arrow"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  role="presentation"
                                  style={{
                                    verticalAlign: "middle",
                                    color: "#757575",
                                  }}
                                >
                                  <path d="M21 14.5a.5.5 0 0 1-.5.5h-17a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5h17a.5.5 0 0 1 .5.5v3z"></path>
                                </svg>
                                )
                              </>
                            )}
                          </p>
                        </div>

                        <Link key={movie.movieId} to={`/imdb/${movie.movieId}`}>
                          <h2
                            onMouseEnter={() => setHoveredId(movie.movieId)}
                            onMouseLeave={() => setHoveredId(null)}
                            style={{
                              color:
                                hoveredId === movie.movieId ? "#666" : "black",
                              fontWeight: "bold",
                              fontSize: "16px",
                              letterSpacing: 0.2,
                              margin: "8px 0 0 0",
                              height: "fit-content",
                              transition: "color 0.1s ease", // suaviza a troca de cor
                              cursor: "pointer", // indica que é clicável
                            }}
                          >
                            {movie.Title}
                          </h2>
                        </Link>

                        <div
                          style={{
                            color: "#757575",
                            fontSize: "14px",
                            display: "flex",
                            height: "16px",
                            marginTop: "8px",
                            alignItems: "center",
                          }}
                        >
                          <p style={{ margin: "0 0.75rem 0 0" }}>
                            {movie.BeginingYear}—{movie.EndingYear}
                          </p>
                          <p style={{ margin: "0 0.75rem 0 0" }}>
                            {movie.Episodes} eps
                          </p>
                          <p style={{ margin: "0 0.75rem 0 0" }}>TV-MA</p>
                          <p style={{ margin: "0 0.75rem 0 0" }}>
                            {movie.Type}
                          </p>
                        </div>
{shouldShowRating(movie.Rating, movie.Votes) ? (
                        <div style={{ display: "flex", alignItems: "center", height: "36px" }}>
  
    <div style={{ width: "fit-content", display: "flex", alignItems: "center", height: "36px" }}>
      <svg width="14px" height="11.2px" xmlns="http://www.w3.org/2000/svg" className="ipc-icon ipc-icon--star-inline" viewBox="0 0 24 24" fill="currentColor" role="presentation" style={{ color: "#f5c518", marginRight: "2px", verticalAlign: "middle" }}>
        <path d="M12 20.1l5.82 3.682c1.066.675 2.37-.322 2.09-1.584l-1.543-6.926 5.146-4.667c.94-.85.435-2.465-.799-2.567l-6.773-.602L13.29.89a1.38 1.38 0 0 0-2.581 0l-2.656 5.53-6.774.602c-1.234.102-1.739 1.718-.799 2.566l5.147 4.666-1.542 6.926c-.28 1.262.023 2.262 1.09 1.585L12 20.099z"></path>
      </svg>
      <div style={{ color: "#757575", display: "flex", fontSize: "14px" }}>
        <p style={{ margin: "0 4px 0 0" }}>{movie.Rating}</p>
        <p style={{ margin: "0 10px 0 0" }}>({formatVotes(movie.Votes) || "N/A"})</p>
        <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "0 12px 0 12px",
                                  margin: 0,
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14px"
                                  height="11.2px"
                                  class="ipc-icon ipc-icon--star-border-inline"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  role="presentation"
                                  style={{
                                    color: "#0e63be",
                                    margin: "0 2px 0 0",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  <path d="M22.724 8.217l-6.786-.587-2.65-6.22c-.477-1.133-2.103-1.133-2.58 0l-2.65 6.234-6.772.573c-1.234.098-1.739 1.636-.8 2.446l5.146 4.446-1.542 6.598c-.28 1.202 1.023 2.153 2.09 1.51l5.818-3.495 5.819 3.509c1.065.643 2.37-.308 2.089-1.51l-1.542-6.612 5.145-4.446c.94-.81.45-2.348-.785-2.446zm-10.726 8.89l-5.272 3.174 1.402-5.983-4.655-4.026 6.141-.531 2.384-5.634 2.398 5.648 6.14.531-4.654 4.026 1.402 5.983-5.286-3.187z"></path>
                                </svg>
                                <p
                                  style={{
                                    color: "#0e63be",
                                    fontSize: "14px",
                                    margin: 0,
                                  }}
                                >
                                  Rate
                                </p>
                              </div>
      </div>
    </div>

  <img src={MarkAsWatched} alt="" />
</div>
  ) : null}
                      </div>
                    </li>
                    <div>
                      <img src={InforButton} alt="" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div>
            <section style={{position:"relative",top:"23px", left:"-21px"}}>
              <img src={SideContent} alt="" />
            </section>
          </div>
          
        </main>

        <p
          style={{
            color: "black",
            width: "808px",
            fontSize: "14px",
            paddingBottom: "24px",
          }}
        >
          Our Most Popular charts use data from the search behavior of IMDb's
          more than 250 million monthly unique visitors to rank the hottest,
          most buzzed about movies and TV shows.
        </p>
      </div>
      <div style={{ backgroundColor: "black" }}>
        <img src={Footer1} alt="" style={{ position: "relative" }} />
        <img src={Footer2} alt="" />
      </div>
    </div>
  );
}

export default MovieList;
