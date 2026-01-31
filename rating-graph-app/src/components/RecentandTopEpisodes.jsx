import React, { useEffect, useState, useRef } from "react";
import AddBtn from "../imgs/imdb/addbtn.png";
import TopRated from "../imgs/imdb/toprated.png";
import MostRecent from "../imgs/imdb/mostrecent.png";
import RateEp from "../imgs/imdb/rateep.png";
import { useParams, Link } from "react-router-dom";

export default function RecentAndTopEpisodes({ episodes }) {
  const { movieId, episodeId } = useParams();
  if (!Array.isArray(episodes) || episodes.length === 0) return null;

  const episodesByYear = episodes.reduce((acc, ep) => {
    const year = ep.Date
      ? new Date(ep.Date).getFullYear().toString()
      : "Desconhecido";
    if (!acc[year]) acc[year] = [];
    acc[year].push(ep);
    return acc;
  }, {});

  console.log("EPISODE OBJ:", episodes);
  console.log("episodeId usado no link:", episodes.episodeId);

  return (
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
                const hasSynopsis = ep.Synopsis && ep.Synopsis.trim() !== "";
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
                // Existe episódio recente (<= 30 dias)
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
                // NÃO existe episódio recente → mostrar 2 top-rated
                episodesToShow = topRatedEpisodes.slice(0, 2).map((ep) => ({
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
                          alt={episode.isTopRated ? "Top Rated" : "Most Recent"}
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
                            : parseFloat(episode["Average Rating 2"]).toFixed(
                                1,
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
  );
}
