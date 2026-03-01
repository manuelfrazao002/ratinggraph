import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { useParams, Link } from "react-router-dom";
import AddBtn from "../imgs/imdb/addbtn.png";
import AddPlot2 from "../imgs/imdb/addplot2.png";
//Data
import { movieMap } from "../data/MovieMap";

export default function NextEpisode({ nextEpisode, coverSrc }) {
  const { movieId, episodeId } = useParams();
  const [data, setData] = useState(null);
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

  if (!nextEpisode) return null;

const isSeriesPremiere =
  Number(data?.NextEpisodeSeason) === 1 &&
  Number(data?.NextEpisodeNumber) === 1;

const isSeasonPremiere =
  Number(data?.NextEpisodeNumber) === 1 && !isSeriesPremiere;

  return (
    <section style={{ margin: "0 auto", width: "856px" }}>
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
          <h2
            style={{
              fontSize: "0.73rem",
              marginBottom: 0,
              color: "#000",
              letterSpacing: "2.2px",
              marginTop:"0px"
            }}
          >
            {isSeriesPremiere
              ? "SERIES PREMIERE"
              : isSeasonPremiere
              ? `SEASON ${Number(data?.NextEpisodeSeason)} PREMIERE`
              : "NEXT EPISODE"}
          </h2>

          <div style={{ display: "flex", marginTop: 10 }}>
            <img src={AddBtn} alt="" />
            <div style={{ marginLeft: 12 }}>
                      <Link
                        key={nextEpisode.episodeId}
                        to={`/episodepage/${movieId}/${nextEpisode.episodeId}`}
                      >
              <h3
                style={{
                  color: "#212121",
                  fontWeight: "bold",
                  margin: 0,
                  fontSize: "1rem",
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
    </section>
  );
}
