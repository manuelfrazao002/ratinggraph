import React from "react";
import AddBtn from "../imgs/imdb/addbtn.png";
import TopRated from "../imgs/imdb/toprated.png";
import MostRecent from "../imgs/imdb/mostrecent.png";
import RateEp from "../imgs/imdb/rateep.png";

export default function RecentAndTopEpisodes({ episodes }) {
  if (!Array.isArray(episodes) || episodes.length === 0) return null;

  return (
    <section style={{ margin: "0 auto", width: "856px" }}>
      <div
        style={{
          width: "808px",
          marginLeft: 8,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {episodes.map((episode, index) => (
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
                      : parseFloat(episode["Average Rating 2"]).toFixed(1)}
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
        ))}
      </div>
    </section>
  );
}
