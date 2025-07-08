import React, { useEffect, useState, useRef } from "react";

import "../src/App.css";
import Navbar from "./imgs/navbar.png";
import { createGlobalStyle } from "styled-components";

import SwitchMobile from "./imgs/switchmobile.png";
import Footer from "./imgs/footer.png";

import "@fortawesome/fontawesome-free/css/all.min.css";
import Papa from "papaparse";

import { useParams } from "react-router-dom";
import { movieMap } from "./data/MovieMap";
import { Link } from "react-router-dom";

import { showCoverSrc, imgTrailerSrc } from "./ShowImageSrc";

const movies = [
  {
    id: "toe",
    title: "The Outside Explorers",
  },
  {
    id: "spacemetro",
    title: "Space Metro",
  },
  {
    id: "goodfriends",
    title: "Good Friends",
  },
    {
    id: "different",
    title: "Different",
  },
      {
    id: "darkcases",
    title: "Dark Cases",
  },
];

function RatingList() {
  const [seriesData, setSeriesData] = useState([]);
  const [sortKey, setSortKey] = useState("Title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [data, setData] = useState([]);

useEffect(() => {
    // URLs dos CSVs que quer carregar (exemplo pegando o primeiro CSV de cada)
    const urls = [
      movieMap["toe"][0],
      movieMap["spacemetro"][0],
      movieMap["goodfriends"][0],
      movieMap["different"][0],
      movieMap["darkcases"][0],
    ];

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
      background-color: #FFD040;
      width: 100%;
    }
  `;

    const sortedData = [...data].sort((a, b) => {
  let valueA = a[sortKey];
  let valueB = b[sortKey];

  // Special handling for formatted "Votes"
  if (sortKey === "Votes") {
    valueA = parseVoteCount(valueA);
    valueB = parseVoteCount(valueB);
  }

  const isNumeric = !isNaN(valueA) && !isNaN(valueB);

  if (isNumeric) {
    return sortOrder === "asc"
      ? Number(valueA) - Number(valueB)
      : Number(valueB) - Number(valueA);
  }

  return sortOrder === "asc"
    ? String(valueA).localeCompare(String(valueB))
    : String(valueB).localeCompare(String(valueA));
});

  return (
    <div style={{ backgroundColor: "#FFD040" }}>
      <GlobalStyle />
      <div
        style={{
          backgroundColor: "#FFC000",
          color: "#eee",
          fontFamily: "Arial, sans-serif",
          display: "flex",
          justifyContent: "center", // centro horizontal
          width: "1134px",
          margin: "0 auto",
        }}
      >
        <main
          style={{
            width: "1110px",
          }}
        >
          <Link to={`/`}>
            <img
              src={Navbar}
              alt=""
              style={{
                cursor: "pointer",
                paddingTop: "12px",
                paddingBottom: "9.8px",
              }}
            />
          </Link>
          <section style={{ backgroundColor: "white" }}>
            <div
              style={{ display: "flex", alignItems: "center", paddingTop: 8 }}
            >
              <i
                style={{
                  marginLeft: "7px",
                  position: "relative",
                  color: "#E04E4E",
                  width: "22px",
                  lineHeight: "18px",
                  textShadow: "1px 1px 0px rgba(0,0,0,.1)",
                }}
                class="fas fa-search"
              ></i>
              <h1
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "black",
                  margin: 0,
                }}
              >
                Search results
              </h1>
            </div>

            <div
              style={{
                margin: "0 8px 12px",
                borderBottom: "1px dashed #ccc",
                color: "#606060",
                fontSize: 12,
                lineHeight: "17px",
                fontFamily: "Arial,'Helvetica Neue',Helvetica,sans-serif",
                padding: "4px 0 8px",
              }}
            >
              Browse the most relevant search results for TV shows, Movies,
              Movie franchises, Directors and Writers.
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "0",
                padding: "0px 8px",
              }}
            >

            {sortedData.map((movie, index) => {
                              return (
                                <div
                                  
                                >
                                  <div
                                    key={index}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <li
                                      style={{
                                        padding: "4px 0 4px 0",
                                        display: "flex",
                                        gap: "8px",
                                        alignItems: "center",
                                        margin: "0 4px 8px",
                                      }}
                                    >
                                        <Link key={movie.movieId}
                                          to={`/ratinggraph/${movie.movieId}`}>
                                      <div style={{ verticalAlign: "center" }}>
                                        <img
                                          src={showCoverSrc[movie.movieId]}
                                          alt={movie.Title}
                                          style={{
                                            width: "132px",
                                            height: "194px",
                                            objectFit: "cover",
                                          }}
                                        />
                                      </div>
                                      </Link>
                                      
                                    </li>
                                  </div>
                                </div>
                              );
                            })}

            </div>
          </section>

          <footer style={{ marginBottom: "6px" }}>
            <img
              src={SwitchMobile}
              alt=""
              style={{ marginTop: "8px", marginBottom: "5px" }}
            />
            <img src={Footer} alt="" />
          </footer>
        </main>
      </div>
    </div>
  );
}

export default RatingList;
