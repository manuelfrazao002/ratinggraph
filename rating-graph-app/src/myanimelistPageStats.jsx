import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import Papa from "papaparse";
import { animeMap } from "../src/data/MovieMap";
import {
  getShowCoverSrc,
  getDefaultCover,
  getTrailerSrc,
  getCharacterSrc,
  getVoiceActorSrc,
  getStaffSrc,
} from "../src/ShowImageSrc";
import "./mal.css";

import Top from "../public/imgs/mal/top_mal.png";
import Navbar_mal from "../public/imgs/mal/navbar_mal.png";
import Footer1 from "../public/imgs/mal/footer1_mal.png";
import Footer2 from "../public/imgs/mal/footer2_mal.png";
import NotifyStart from "../public/imgs/mal/notifystart.png";
import RecentlyUpdatedBy from "../public/imgs/mal/recentlyupdatedby.png";
import RecentlyUpdatedByAnime from "../public/imgs/mal/recentlyupdatedby_anime.png";

function MyAnimeList({ match }) {
  const { id } = useParams();
  const [animeData, setAnimeData] = useState(null);
  const [coverImage, setCoverImage] = useState(getDefaultCover());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailerImage, setTrailerSrc] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const baseColor = "#1c439b"; // cor do texto original
  const hoverStyle = {
    backgroundColor: isHovered ? baseColor : "#fff",
    color: isHovered ? "#fff" : baseColor,
    fontFamily: "Avenir, lucida grande, tahoma, verdana, arial, sans-serif",
    fontSize: "12px",
    fontWeight: "400",
    padding: "2px 4px",
    textDecoration: "none",
    height: "14px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  };

  // Load anime data from CSV
  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        setLoading(true);

        // Extrai o ID base (remove o _s2, _s3 etc)
        const baseId = id.replace(/_\w+$/, "");
        const csvUrl = animeMap[baseId]?.[0];

        if (!csvUrl) {
          throw new Error("Base anime data not found");
        }

        const response = await fetch(csvUrl);
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            // Encontra o anime com showId correspondente
            const anime = results.data.find((item) => item.showId === id);

            if (anime) {
              setAnimeData(anime);
              const coverSrc = getShowCoverSrc(id);
              const trailerSrc = getTrailerSrc(id);
              setCoverImage(coverSrc);
              setTrailerSrc(trailerSrc);
            } else {
              throw new Error(`Anime with id ${id} not found in CSV`);
            }
            setLoading(false);
          },
          error: (error) => {
            setError("Error parsing CSV data");
            setLoading(false);
          },
        });
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAnimeData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
        {error}
      </div>
    );
  }

  if (!animeData) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        No data available for this anime
      </div>
    );
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "?";
    return dateString;
  };

  const isManga = animeData.Type2 === "Manga";
  const isAnime = animeData.Type2 === "Anime";

  return (
    <div className="my-anime-list">
      <div
        style={{
          maxWidth: "1060px",
          margin: "0 auto",
          fontFamily: "Verdana, Arial",
        }}
      >
        <header>
          <div>
            <Link to={`/myanimelist/list`}>
              <img
                src={Top}
                alt="My Anime List"
                style={{ marginBottom: "-6px" }}
              />
            </Link>
            <img
              src={Navbar_mal}
              alt="Navbar"
              style={{ marginBottom: "-4px", zIndex: 1, position: "relative" }}
            />
          </div>
        </header>

        <main
          style={{
            backgroundColor: "#fff",
            minHeight: "555px",
            paddingBottom: "30px",
            position: "relative",
          }}
        >
          <div
            style={{
              backgroundColor: "#e1e7f5",
              borderBottomColor: "#1c439b",
              borderRightColor: "#e5e5e5",
              borderLeftColor: "#e5e5e5",
              borderStyle: "solid",
              borderTopColor: "#e5e5e5",
              borderWidth: "1px",
              color: "#000",
              fontFamily: "Verdana, Arial",
              fontWeight: "700",
              margin: "0",
              padding: "5px 9px",
              textAlign: "left",
            }}
          >
            {animeData.TitleJapanese != animeData.TitleEnglish && (
              <div
                style={{
                  display: "table-cell",
                  width: "855px",
                }}
              >
                <h1
                  style={{
                    fontSize: "16px",
                    margin: "0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {animeData.TitleJapanese || animeData.Title}
                </h1>
                <h2
                  style={{
                    fontSize: "14px",
                    margin: "0",
                    height: "17px",
                    display: "flex",
                    alignItems: "center",
                    color: "gray",
                  }}
                >
                  {animeData.TitleEnglish || animeData.Title}
                </h2>
              </div>
            )}
            {animeData.TitleJapanese === animeData.TitleEnglish && (
              <div
                style={{
                  display: "table-cell",
                  width: "855px",
                }}
              >
                <h1
                  style={{
                    fontSize: "16px",
                    margin: "0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {animeData.TitleEnglish}
                </h1>
              </div>
            )}
          </div>

          <div
            className="content"
            style={{
              backgroundColor: "#fff",
              borderColor: "#e5e5e5",
              borderStyle: "solid",
              borderWidth: "0 1px 1px",
              padding: "5px 10px 10px",
              position: "relative",
            }}
          >
            <table border={0} cellPadding={0} cellSpacing={0} width={"100%"}>
              <tbody>
                <tr>
                  <td
                    style={{
                      borderWidth: "0 1px 0 0",
                      borderColor: "#e5e5e5",
                      borderStyle: "solid",
                      padding: "3px",
                      width: "225px",
                      verticalAlign: "top",
                    }}
                  >
                    <div
                      style={{
                        width: "225px",
                        lineHeight: "1.5em",
                      }}
                    >
                      <div>
                        <img
                          src={coverImage}
                          alt={animeData.Title}
                          width={225}
                          height={350}
                        />
                      </div>
                      {animeData.BeginningDate === "?" && (
                        <img
                          src={NotifyStart}
                          alt=""
                          style={{ marginTop: "4px" }}
                        />
                      )}
                      {isAnime && (
                        <div style={{ paddingTop: "8px" }}>
                          <div
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              borderColor: "#92b0f1",
                              borderStyle: "solid",
                              borderWidth: "0 0 1px",
                              color: "#1c439b",
                              cursor: "pointer",
                              display: "block",
                              textDecoration: "none",
                              fontSize: "11px",
                              height: "16.5px",
                              padding: "2px 3px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                position: "relative",
                                top: "1px",
                              }}
                            >
                              Add to My List
                            </span>
                          </div>
                          <div
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              borderColor: "#92b0f1",
                              borderStyle: "solid",
                              borderWidth: "0 0 1px",
                              color: "#1c439b",
                              cursor: "pointer",
                              display: "block",
                              textDecoration: "none",
                              fontSize: "11px",
                              height: "16.5px",
                              padding: "3px 3px",
                              display: "flex",
                              alignItems: "center",
                              position: "relative",
                              top: "-1px",
                            }}
                          >
                            <span
                              style={{
                                position: "relative",
                                top: "1px",
                              }}
                            >
                              Add to Favorites
                            </span>
                          </div>
                        </div>
                      )}
                      {isManga && (
                        <div style={{ paddingTop: "4px" }}>
                          <div
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              borderColor: "#92b0f1",
                              borderStyle: "solid",
                              borderWidth: "0 0 1px",
                              color: "#1c439b",
                              cursor: "pointer",
                              display: "block",
                              textDecoration: "none",
                              fontSize: "11px",
                              height: "16.5px",
                              padding: "2px 3px",
                              paddingBottom: "3px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                position: "relative",
                                top: "1px",
                              }}
                            >
                              Add to My List
                            </span>
                          </div>
                          <div
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              borderColor: "#92b0f1",
                              borderStyle: "solid",
                              borderWidth: "0 0 1px",
                              color: "#1c439b",
                              cursor: "pointer",
                              display: "block",
                              textDecoration: "none",
                              fontSize: "11px",
                              height: "16.5px",
                              padding: "3px 3px",
                              paddingTop: "2px",
                              display: "flex",
                              alignItems: "center",
                              position: "relative",
                              top: "-1px",
                            }}
                          >
                            <span
                              style={{
                                position: "relative",
                                top: "1px",
                              }}
                            >
                              Add to Favorites
                            </span>
                          </div>
                        </div>
                      )}
                      {isAnime && (
                        <div
                          class="js-sns-icon-container icon-block mt8"
                          style={{
                            marginTop: "17px",
                            marginBottom: "20px",
                          }}
                        >
                          <a
                            data-ga-network="facebook"
                            data-ga-screen="Share Button Location: common"
                            class="js-share-button-popup js-share-button-tracking sprite-icon-social icon-social icon-facebook"
                            target="_blank"
                            style={{
                              backgroundColor: "#fff",
                              border: "#bebebe 1px solid",
                              color: "#5d5d5d",
                              borderRadius: "3px",
                              fontSize: "18px",
                              height: "28px",
                              marginRight: "6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "48px",
                              height: "28px",
                              display: "inline-block",
                              lineHeight: "1.5em",
                            }}
                          >
                            <div
                              class="ga-click"
                              data-ga-click-type="share-facebook"
                              data-ga-click-param=""
                            >
                              <i
                                title="Facebook"
                                class="fa-brands fa-facebook-f"
                                data-ga-click-type="share-facebook"
                                data-ga-click-param=""
                              ></i>
                            </div>
                          </a>
                          <a
                            data-ga-network="twitter"
                            data-ga-screen="Share Button Location: common"
                            class="js-share-button-popup js-share-button-tracking sprite-icon-social icon-social icon-twitter"
                            target="_blank"
                            style={{
                              backgroundColor: "#fff",
                              border: "#bebebe 1px solid",
                              color: "#5d5d5d",
                              borderRadius: "3px",
                              fontSize: "18px",
                              height: "28px",
                              marginRight: "6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "48px",
                              height: "28px",
                              display: "inline-block",
                              lineHeight: "1.5em",
                            }}
                          >
                            <div
                              class="ga-click"
                              data-ga-click-type="share-twitter"
                              data-ga-click-param=""
                            >
                              <i
                                title="Twitter"
                                class="fa-brands fa-twitter"
                                data-ga-click-type="share-twitter"
                                data-ga-click-param=""
                              ></i>
                            </div>
                          </a>
                          <a
                            data-ga-network="reddit"
                            data-ga-screen="Share Button Location: common"
                            class="js-share-button-popup js-share-button-tracking sprite-icon-social icon-social icon-reddit"
                            target="_blank"
                            style={{
                              backgroundColor: "#fff",
                              border: "#bebebe 1px solid",
                              color: "#5d5d5d",
                              borderRadius: "3px",
                              fontSize: "18px",
                              height: "28px",
                              marginRight: "6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "48px",
                              height: "28px",
                              display: "inline-block",
                              lineHeight: "1.5em",
                            }}
                          >
                            <div
                              class="ga-click"
                              data-ga-click-type="share-reddit"
                              data-ga-click-param=""
                            >
                              <i
                                title="Reddit"
                                class="fa-brands fa-reddit-alien"
                                data-ga-click-type="share-reddit"
                                data-ga-click-param=""
                              ></i>
                            </div>
                          </a>
                          <a
                            data-ga-network="tumblr"
                            data-ga-screen="Share Button Location: common"
                            class="js-share-button-popup js-share-button-tracking sprite-icon-social icon-social icon-tumblr"
                            target="_blank"
                            style={{
                              backgroundColor: "#fff",
                              border: "#bebebe 1px solid",
                              color: "#5d5d5d",
                              borderRadius: "3px",
                              fontSize: "18px",
                              height: "28px",
                              marginRight: "6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "48px",
                              height: "28px",
                              display: "inline-block",
                              lineHeight: "1.5em",
                            }}
                          >
                            <div
                              class="ga-click"
                              data-ga-click-type="share-tumblr"
                              data-ga-click-param=""
                            >
                              <i
                                title="Tumblr"
                                class="fa-brands fa-tumblr"
                                data-ga-click-type="share-tumblr"
                                data-ga-click-param=""
                              ></i>
                            </div>
                          </a>
                        </div>
                      )}
                      {isManga && (
                        <div
                          class="js-sns-icon-container icon-block mt8"
                          style={{
                            marginTop: "9px",
                            marginBottom: "20px",
                          }}
                        >
                          <a
                            data-ga-network="facebook"
                            data-ga-screen="Share Button Location: common"
                            class="js-share-button-popup js-share-button-tracking sprite-icon-social icon-social icon-facebook"
                            target="_blank"
                            style={{
                              backgroundColor: "#fff",
                              border: "#bebebe 1px solid",
                              color: "#5d5d5d",
                              borderRadius: "3px",
                              fontSize: "18px",
                              height: "28px",
                              marginRight: "6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "48px",
                              height: "28px",
                              display: "inline-block",
                              lineHeight: "1.5em",
                            }}
                          >
                            <div
                              class="ga-click"
                              data-ga-click-type="share-facebook"
                              data-ga-click-param=""
                            >
                              <i
                                title="Facebook"
                                class="fa-brands fa-facebook-f"
                                data-ga-click-type="share-facebook"
                                data-ga-click-param=""
                              ></i>
                            </div>
                          </a>
                          <a
                            data-ga-network="twitter"
                            data-ga-screen="Share Button Location: common"
                            class="js-share-button-popup js-share-button-tracking sprite-icon-social icon-social icon-twitter"
                            target="_blank"
                            style={{
                              backgroundColor: "#fff",
                              border: "#bebebe 1px solid",
                              color: "#5d5d5d",
                              borderRadius: "3px",
                              fontSize: "18px",
                              height: "28px",
                              marginRight: "6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "48px",
                              height: "28px",
                              display: "inline-block",
                              lineHeight: "1.5em",
                            }}
                          >
                            <div
                              class="ga-click"
                              data-ga-click-type="share-twitter"
                              data-ga-click-param=""
                            >
                              <i
                                title="Twitter"
                                class="fa-brands fa-twitter"
                                data-ga-click-type="share-twitter"
                                data-ga-click-param=""
                              ></i>
                            </div>
                          </a>
                          <a
                            data-ga-network="reddit"
                            data-ga-screen="Share Button Location: common"
                            class="js-share-button-popup js-share-button-tracking sprite-icon-social icon-social icon-reddit"
                            target="_blank"
                            style={{
                              backgroundColor: "#fff",
                              border: "#bebebe 1px solid",
                              color: "#5d5d5d",
                              borderRadius: "3px",
                              fontSize: "18px",
                              height: "28px",
                              marginRight: "6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "48px",
                              height: "28px",
                              display: "inline-block",
                              lineHeight: "1.5em",
                            }}
                          >
                            <div
                              class="ga-click"
                              data-ga-click-type="share-reddit"
                              data-ga-click-param=""
                            >
                              <i
                                title="Reddit"
                                class="fa-brands fa-reddit-alien"
                                data-ga-click-type="share-reddit"
                                data-ga-click-param=""
                              ></i>
                            </div>
                          </a>
                          <a
                            data-ga-network="tumblr"
                            data-ga-screen="Share Button Location: common"
                            class="js-share-button-popup js-share-button-tracking sprite-icon-social icon-social icon-tumblr"
                            target="_blank"
                            style={{
                              backgroundColor: "#fff",
                              border: "#bebebe 1px solid",
                              color: "#5d5d5d",
                              borderRadius: "3px",
                              fontSize: "18px",
                              height: "28px",
                              marginRight: "6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "48px",
                              height: "28px",
                              display: "inline-block",
                              lineHeight: "1.5em",
                            }}
                          >
                            <div
                              class="ga-click"
                              data-ga-click-type="share-tumblr"
                              data-ga-click-param=""
                            >
                              <i
                                title="Tumblr"
                                class="fa-brands fa-tumblr"
                                data-ga-click-type="share-tumblr"
                                data-ga-click-param=""
                              ></i>
                            </div>
                          </a>
                        </div>
                      )}

                      <h2
                        style={{
                          borderColor: "#bebebe",
                          borderStyle: "solid",
                          borderWidth: "0 0 1px",
                          color: "#000",
                          fontSize: "12px",
                          fontWeight: "700",
                          margin: "4px 0 5px",
                          padding: "3px 0",
                          height: "16.5px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Alternative Titles
                      </h2>
                      {animeData.Synonyms != "-" && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                            position: "relative",
                            top: "1px",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Synonyms:{" "}
                          </span>
                          {animeData.Synonyms || "N/A"}
                        </div>
                      )}

                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Japanese:{" "}
                        </span>
                        {animeData.TitleJapanese2 || "N/A"}
                      </div>
                      <br style={{ fontSize: "11px", lineHeight: "1.5em" }} />
                      <h2
                        style={{
                          borderColor: "#bebebe",
                          borderStyle: "solid",
                          borderWidth: "0 0 1px",
                          color: "#000",
                          fontSize: "12px",
                          fontWeight: "700",
                          margin: "4px 0 5px",
                          padding: "3px 0",
                          height: "16.5px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Information
                      </h2>
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Type:{" "}
                        </span>
                        <span
                          style={{
                            color:
                              animeData.Type != "Unknown" ? "#1c439b" : "#000",
                          }}
                        >
                          {animeData.Type || "N/A"}
                        </span>
                      </div>
                      {isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Episodes:{" "}
                          </span>
                          {animeData.Episodes || "N/A"}
                        </div>
                      )}
                      {isManga && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Volumes:{" "}
                          </span>
                          {animeData.Volumes || "N/A"}
                        </div>
                      )}
                      {isManga && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Chapters:{" "}
                          </span>
                          {animeData.Chapters || "N/A"}
                        </div>
                      )}
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Status:{" "}
                        </span>
                        {animeData.Status || "N/A"}
                      </div>
                      {isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Aired:{" "}
                          </span>
                          {animeData.BeginningDate != "?" && (
                            <>
                              {formatDate(animeData.BeginningDate)} to{" "}
                              {formatDate(animeData.EndingDate)}
                            </>
                          )}
                          {animeData.BeginningDate === "?" && (
                            <span>Not available</span>
                          )}
                        </div>
                      )}
                      {isManga && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Published:{" "}
                          </span>
                          {formatDate(animeData.BeginningDate)} to{" "}
                          {formatDate(animeData.EndingDate)}
                        </div>
                      )}
                      {animeData.Premiered != "Unknown" && isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Premiered:{" "}
                          </span>
                          <span style={{ color: "#1c439b" }}>
                            {animeData.Premiered || "N/A"}
                          </span>
                        </div>
                      )}
                      {animeData.Premiered != "Unknown" && isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Broadcast:{" "}
                          </span>
                          {animeData.Broadcast || "N/A"}
                        </div>
                      )}
                      {isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Producers:{" "}
                          </span>
                          <span style={{ color: "#1c439b" }}>
                            {animeData.Producers || "N/A"}
                          </span>
                        </div>
                      )}
                      {isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Licensors:{" "}
                          </span>
                          {animeData.BeginningDate != "?" && (
                            <span style={{ color: "#1c439b" }}>
                              {animeData.Licensors || "N/A"}
                            </span>
                          )}
                          {animeData.BeginningDate === "?" && (
                            <>
                              <span>
                                None found,{" "}
                                <span style={{ color: "#1c439b" }}>
                                  add some
                                </span>
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      {isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Studios:{" "}
                          </span>
                          <span style={{ color: "#1c439b" }}>
                            {animeData.Studios || "N/A"}
                          </span>
                        </div>
                      )}
                      {isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Source:{" "}
                          </span>
                          {animeData.Source != "Original" && (
                            <span style={{ color: "#1c439b" }}>
                              {animeData.Source || "N/A"}
                            </span>
                          )}
                          {animeData.Source === "Original" && (
                            <span>Original</span>
                          )}
                        </div>
                      )}
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Genres:{" "}
                        </span>
                        <span style={{ color: "#1c439b" }}>
                          {animeData.Genres || "N/A"}
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Themes:{" "}
                        </span>
                        <span style={{ color: "#1c439b" }}>
                          {animeData.Themes || "N/A"}
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Demographic:{" "}
                        </span>
                        <span style={{ color: "#1c439b" }}>
                          {animeData.Demographic || "N/A"}
                        </span>
                      </div>
                      {isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Duration:{" "}
                          </span>
                          {animeData.BeginningDate != "?" && (
                            <>{animeData.Duration || "N/A"}</>
                          )}
                          {animeData.BeginningDate === "?" && <>Unknown</>}
                        </div>
                      )}
                      {isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Rating:{" "}
                          </span>
                          {animeData.Rating || "N/A"}
                        </div>
                      )}
                      {isManga && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Serialization:{" "}
                          </span>
                          <span style={{ color: "#1c439b" }}>
                            {animeData.Studios || "N/A"}
                          </span>
                        </div>
                      )}
                      {isManga && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Authors:{" "}
                          </span>
                          <span style={{ color: "#1c439b" }}>
                            {animeData.Author || "N/A"}
                          </span>{" "}
                          (Story & Art)
                        </div>
                      )}
                      <br style={{ fontSize: "11px", lineHeight: "1.5em" }} />
                      <h2
                        style={{
                          borderColor: "#bebebe",
                          borderStyle: "solid",
                          borderWidth: "0 0 1px",
                          color: "#000",
                          fontSize: "12px",
                          fontWeight: "700",
                          margin: "4px 0 5px",
                          padding: "3px 0",
                          height: "16.5px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Statistics
                      </h2>
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Score:{" "}
                        </span>
                        {animeData.Score || "N/A"} (scored by{" "}
                        {animeData.UserVotes || "N/A"} users)
                      </div>
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Ranked:
                        </span>{" "}
                        {animeData.Ranked || "N/A"}
                      </div>
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Popularity:
                        </span>{" "}
                        {animeData.Popularity || "N/A"}
                      </div>
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Members:
                        </span>{" "}
                        {animeData.Members || "N/A"}
                      </div>
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Favorites:{" "}
                        </span>
                        {animeData.Favorites || "N/A"}
                      </div>
                      <br style={{ fontSize: "11px", lineHeight: "1.5em" }} />
                      {/* Other sections remain the same */}
                    </div>
                  </td>
                  <td
                    style={{
                      paddingLeft: "5px",
                      fontSize: "11px",
                      lineHeight: "1.5em",
                      maxWidth: "801px",
                      verticalAlign: "baseline",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          margin: "0 auto",
                        }}
                      >
                        {isManga && (
                          <div
                            className="horizontal-nav"
                            style={{
                              margin: "5px 0 10px 0",
                              borderColor: "#1c439b",
                              borderStyle: "solid",
                              borderWidth: "0 0 1px",
                              padding: "0 0 2px",
                              lineHeight: "1.5em",
                              height: "18px",
                            }}
                          >
                            <ul
                              style={{
                                marginRight: "0",
                                paddingRight: "0",
                                paddingLeft: "0",
                                marginTop: "0",
                                marginLeft: "0",
                                fontFamily: "arial,helvetica,sans-serif",
                                lineHeight: "1.5em",
                                listStyleType: "none",
                                display: "flex",
                                position: "relative",
                                top: "-1px",
                                alignItems: "center",
                                width: "639.217px",
                                justifyContent: "space-between",
                              }}
                            >
                              <Link to={`/manga/${animeData.showId}`}>
                                <li
                                  style={hoverStyle}
                                  onMouseEnter={() => setIsHovered(true)}
                                  onMouseLeave={() => setIsHovered(false)}
                                >
                                  Details
                                </li>
                              </Link>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Characters
                              </li>

                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#fff",
                                  backgroundColor: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Stats
                              </li>

                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Reviews
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Recommendations
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Interest Stacks
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                News
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Forum
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Clubs
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Pictures
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                More Info
                              </li>
                            </ul>
                          </div>
                        )}
                        {isAnime && (
                          <div
                            className="horizontal-nav"
                            style={{
                              margin: "5px 0 10px 0",
                              borderColor: "#1c439b",
                              borderStyle: "solid",
                              borderWidth: "0 0 1px",
                              padding: "0 0 2px",
                              lineHeight: "1.5em",
                              height: "18px",
                            }}
                          >
                            <ul
                              style={{
                                marginRight: "0",
                                paddingRight: "0",
                                paddingLeft: "0",
                                marginTop: "0",
                                marginLeft: "0",
                                fontFamily: "arial,helvetica,sans-serif",
                                lineHeight: "1.5em",
                                listStyleType: "none",
                                display: "flex",
                                position: "relative",
                                top: "-1px",
                                alignItems: "center",
                                width: "782.483px",
                                justifyContent: "space-between",
                              }}
                            >
                              <Link to={`/anime/${animeData.showId}`}>
                                <li
                                  style={hoverStyle}
                                  onMouseEnter={() => setIsHovered(true)}
                                  onMouseLeave={() => setIsHovered(false)}
                                >
                                  Details
                                </li>
                              </Link>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Characters & Staff
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Episodes
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Videos
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#fff",
                                  backgroundColor: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Stats
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Reviews
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Recommendations
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Interest Stacks
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                News
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Forum
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Clubs
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Pictures
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                More Info
                              </li>
                            </ul>
                          </div>
                        )}
                        <div
                          className="breadcrumb"
                          style={{
                            fontFamily:
                              "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                            fontSize: "12px",
                            margin: 0,
                            padding: 0,
                            paddingBottom: "2px",
                            lineHeight: "1.5em",
                            display: "flex",
                            alignContent: "center",
                          }}
                        >
                          <div>
                            <span
                              style={{
                                margin: 0,
                                padding: 0,
                                color: "#1c439b",
                              }}
                            >
                              Top
                            </span>
                          </div>
                          <span
                            style={{
                              width: "23.7px",
                              margin: "0",
                              padding: "0",
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            &#62;
                          </span>
                          <div
                            style={{
                              margin: 0,
                              padding: 0,
                              color: "#1c439b",
                            }}
                          >
                            <span>{animeData.Type2}</span>
                          </div>
                          <span
                            style={{
                              width: "23.7px",
                              margin: "0",
                              padding: "0",
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            &#62;
                          </span>
                          <div
                            style={{
                              margin: 0,
                              padding: 0,
                              color: "#1c439b",
                            }}
                          >
                            <span>
                              {animeData.TitleJapanese || animeData.Title}
                            </span>
                          </div>
                          <span
                            style={{
                              width: "23.7px",
                              margin: "0",
                              padding: "0",
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            &#62;
                          </span>
                          <div
                            style={{
                              margin: 0,
                              padding: 0,
                              color: "#1c439b",
                            }}
                          >
                            <span>Stats</span>
                          </div>
                        </div>
                        <div style={{ marginBottom: "4px" }} />
                        <h2
                          style={{
                            borderColor: "#bebebe",
                            borderStyle: "solid",
                            borderWidth: "0 0 1px",
                            color: "#000",
                            fontSize: "12px",
                            fontWeight: "700",
                            margin: "4px 0 5px",
                            padding: "3px 0",
                          }}
                        >
                          Summary Stats
                        </h2>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {isAnime && (
                            <div
                              style={{
                                padding: "3px 0",
                              }}
                            >
                              <span
                                style={{
                                  color: "#444",
                                  fontWeight: "700",
                                  fontSize: "11px",
                                  marginRight: "0.4px"
                                }}
                              >
                                Watching:{" "}
                              </span>
                              <span
                                style={{
                                  color: "#000",
                                  fontSize: "11px",
                                }}
                              >
                                {animeData.Watching}
                              </span>
                            </div>
                          )}
                          {isManga && (
                            <div
                              style={{
                                padding: "3px 0",
                              }}
                            >
                              <span
                                style={{
                                  color: "#444",
                                  fontWeight: "700",
                                  fontSize: "11px",
                                }}
                              >
                                Reading:{" "}
                              </span>
                              <span
                                style={{
                                  color: "#000",
                                  fontSize: "11px",
                                }}
                              >
                                {animeData.Watching}
                              </span>
                            </div>
                          )}
                          <div
                            style={{
                              padding: "3px 0",
                            }}
                          >
                            <span
                              style={{
                                color: "#444",
                                fontWeight: "700",
                                fontSize: "11px",
                                marginRight: "0.25px"
                              }}
                            >
                              Completed:{" "}
                            </span>
                            <span
                              style={{
                                color: "#000",
                                fontSize: "11px",
                              }}
                            >
                              {animeData.Completed}
                            </span>
                          </div>
                          <div
                            style={{
                              padding: "3px 0",
                            }}
                          >
                            <span
                              style={{
                                color: "#444",
                                fontWeight: "700",
                                fontSize: "11px",
                              }}
                            >
                              On-Hold:{" "}
                            </span>
                            <span
                              style={{
                                color: "#000",
                                fontSize: "11px",
                              }}
                            >
                              {animeData.Onhold}
                            </span>
                          </div>
                          <div
                            style={{
                              padding: "3px 0",
                            }}
                          >
                            <span
                              style={{
                                color: "#444",
                                fontWeight: "700",
                                fontSize: "11px",
                              }}
                            >
                              Dropped:{" "}
                            </span>
                            <span
                              style={{
                                color: "#000",
                                fontSize: "11px",
                              }}
                            >
                              {animeData.Dropped}
                            </span>
                          </div>
                          {isAnime && (
                            <div
                              style={{
                                padding: "3px 0",
                              }}
                            >
                              <span
                                style={{
                                  color: "#444",
                                  fontWeight: "700",
                                  fontSize: "11px",
                                }}
                              >
                                Plan to Watch:{" "}
                              </span>
                              <span
                                style={{
                                  color: "#000",
                                  fontSize: "11px",
                                }}
                              >
                                {animeData.Plantowatch}
                              </span>
                            </div>
                          )}
                          {isManga && (
                            <div
                              style={{
                                padding: "3px 0",
                              }}
                            >
                              <span
                                style={{
                                  color: "#444",
                                  fontWeight: "700",
                                  fontSize: "11px",
                                }}
                              >
                                Plan to Read:{" "}
                              </span>
                              <span
                                style={{
                                  color: "#000",
                                  fontSize: "11px",
                                }}
                              >
                                {animeData.Plantowatch}
                              </span>
                            </div>
                          )}
                          <div
                            style={{
                              padding: "3px 0",
                            }}
                          >
                            <span
                              style={{
                                color: "#444",
                                fontWeight: "700",
                                fontSize: "11px",
                              }}
                            >
                              Total:{" "}
                            </span>
                            <span
                              style={{
                                color: "#000",
                                fontSize: "11px",
                              }}
                            >
                              {animeData.Members}
                            </span>
                          </div>
                        </div>
                        <div style={{ marginBottom: "20px" }} />
                        <h2
                          style={{
                            borderColor: "#bebebe",
                            borderStyle: "solid",
                            borderWidth: "0 0 1px",
                            color: "#000",
                            fontSize: "12px",
                            fontWeight: "700",
                            margin: "4px 0 5px",
                            padding: "3px 0",
                          }}
                        >
                          Score Stats
                        </h2>
                        {animeData.UserVotes != "-" && (
                          <div
                            style={{ fontSize: "11px", marginBottom: "15px" }}
                          >
                            {(() => {
                              const scores = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

                              // Verificação segura dos valores
                              const votesData = scores.map((score) => {
                                const votesValue =
                                  animeData[`Score${score}Votes`];
                                // Conversão segura para número, tratando casos de undefined/null/string vazia
                                const votes =
                                  votesValue !== undefined &&
                                  votesValue !== null &&
                                  votesValue !== ""
                                    ? Number(votesValue)
                                    : 0;

                                return { score, votes };
                              });

                              const totalVotes = votesData.reduce(
                                (sum, item) => sum + item.votes,
                                0
                              );
                              const maxVotes = Math.max(
                                1,
                                ...votesData.map((item) => item.votes)
                              );

                              return votesData.map(({ score, votes }) => {
                                const percentage =
                                  totalVotes > 0
                                    ? ((votes / totalVotes) * 100).toFixed(1)
                                    : "0.0";
                                const relativeWidth = (votes / maxVotes) * 100;

                                return (
                                  <div
                                    key={score}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: "20px",
                                        textAlign: "left",
                                        color: "#000",
                                        fontSize: "11px",
                                      }}
                                    >
                                      {score}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          padding: "3px 0",
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: `${percentage}%`,
                                            height: "15px",
                                            backgroundColor: "#a6bbef",
                                            flexShrink: 0,
                                          }}
                                        />
                                        <div
                                          style={{
                                            paddingLeft: "5px",
                                            fontFamily: "Verdana, Arial",
                                          }}
                                        >
                                          <span style={{ color: "#000" }}>
                                            {percentage}%{" "}
                                            <small>({votes} votes)</small>
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        )}

                        <div style={{ marginBottom: "21px" }} />
                        <div
                          style={{
                            borderColor: "#bebebe",
                            borderStyle: "solid",
                            borderWidth: "0 0 1px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "4px 0 5px",
                            padding: "3px 0",
                            height: "16.5px",
                          }}
                        >
                          <h2
                            style={{
                              fontSize: "12px",
                              color: "#000",
                              fontWeight: "700",
                              margin: "0",
                            }}
                          >
                            Recently Updated By
                          </h2>
                          <span
                            style={{
                              fontWeight: "normal",
                              fontSize: "11px",
                              color: "#000",
                              height: "16.5px",
                              paddingRight: "0px",
                              fontFamily: "Verdana, Arial",
                            }}
                          >
                            All Members
                          </span>
                        </div>
                        {isManga && (
                        <img
                          src={RecentlyUpdatedBy}
                          alt=""
                          style={{
                            position: "relative",
                            left: "-4px",
                            top: "4px",
                            marginBottom: "30px",
                          }}
                        />
                        )}
                        {isAnime && (
                        <img
                          src={RecentlyUpdatedByAnime}
                          alt=""
                          style={{
                            position: "relative",
                            left: "0px",
                            top: "0px",
                            marginBottom: "23px",
                          }}
                        />
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <footer>
        <img
          src={Footer1}
          alt="Footer 1"
          className="footer-image"
          style={{ marginBottom: "-5px" }}
        />
        <img
          src={Footer2}
          alt="Footer 2"
          className="footer-image"
          style={{ marginBottom: "-6px" }}
        />
      </footer>
    </div>
  );
}

export default MyAnimeList;
