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
  const [sortKey, setSortKey] = useState("Trend");
  const [sortOrder, setSortOrder] = useState("desc");
  const [data, setData] = useState([]);

  useEffect(() => {
  // Obter todas as chaves (IDs dos filmes) do movieMap
  const movieIds = Object.keys(movieMap);
  
  // Criar array de URLs alternando entre índice 0 e 2 para cada filme
  const urls = movieIds.flatMap(movieId => {
    // Verificar se existem os CSVs necessários (índices 0 e 2)
    if (movieMap[movieId][0] && movieMap[movieId][2]) {
      return [movieMap[movieId][0], movieMap[movieId][2]];
    }
    // Se algum CSV estiver faltando, retornar apenas os disponíveis
    return movieMap[movieId].filter(url => url);
  });

  Promise.all(
    urls.map((url) =>
      url ? // Só processar URLs válidas
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
                    resolve([]);
                  },
                })
              )
          ) : Promise.resolve([]) // Para URLs vazias, retornar array vazio
    )
  ).then((resultsArrays) => {
    // Agora precisamos combinar os dados correspondentes (0 e 2)
    const combinedData = [];
    let movieIndex = 0;
    
    for (let i = 0; i < resultsArrays.length; i += 2) {
      const movieId = movieIds[movieIndex];
      const data0 = resultsArrays[i] || []; // CSV 0
      const data2 = i+1 < resultsArrays.length ? resultsArrays[i+1] || [] : []; // CSV 2
      
      // Combinar os dados - assumindo que cada CSV tem apenas uma linha relevante
      const combined = {
        ...(data0[0] || {}), // pega o primeiro item do CSV 0
        ...(data2[0] || {}), // combina com o primeiro item do CSV 2
        movieId: movieId
      };
      
      combinedData.push(combined);
      movieIndex++;
    }
    
    setData(combinedData);
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
    let valueA = a["Trend"]; // Alterado para sempre ordenar por Trend
    let valueB = b["Trend"]; // Alterado para sempre ordenar por Trend

      valueA = Number(String(valueA).replace(/,/g, ""));
  valueB = Number(String(valueB).replace(/,/g, ""));

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
                className="fas fa-search"
              ></i>
              <h1
                style={{
                  fontSize: "18px",
                  color: "black",
                  margin: 0,
                  fontWeight: 700,
                  textShadow: "1px 1px 0px rgba(0,0,0,.1)",
                  lineHeight: "22px",
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
                padding: "0 4px 4px",
                flexWrap: "wrap",
              }}
            >
              {sortedData.map((movie, index) => {
                  console.log(`Filme: ${movie.Title}`, {
    Trend: movie.Trend,
    AverageRating: movie.AverageRating,
    TodosOsDados: movie // Mostra todos os dados do filme
  });
                return (
                  <div
                  key={movie.movieId}
                    style={{
                      position: "relative",
                      margin: "0 4px 8px",
                    }}
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
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                          margin: 0,
                          padding: 0,
                          listStyle: "none",
                          
                        }}
                      >
                        <Link
                          key={movie.movieId}
                          to={`/ratinggraph/${movie.movieId}`}
                        >
                          <div
                            style={{
                              position: "relative",
                              height: "196px",
                            }}
                          >
                            <img
                              src={showCoverSrc[movie.movieId]}
                              alt={movie.Title}
                              style={{
                                width: "134px",
                                height: "196px",
                                objectFit: "cover",
                                backgroundColor: "#000",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: "rgba(0,0,0,.5)",
                                color: "#fff",
                                padding: "6px",
                                fontSize: "12px",
                                textAlign: "center",
                                lineHeight: "17px",
                                textShadow: "1px 1px 0px rgba(0,0,0,.1)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  height: "auto",
                              }}
                            >
                                <b style={{lineHeight: "22px"}}>{movie.Title}</b>
                              <div>Trend: {movie.Trend}</div>
                              <div>Average Rating: {movie.AverageRating}</div>
                            </div>
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
