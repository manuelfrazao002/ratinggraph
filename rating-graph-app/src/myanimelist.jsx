import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { animeMap } from "../src/data/MovieMap";
import Papa from "papaparse";
import {
  getShowCoverSrc,
  getDefaultCover,
  getOptimizedImage,
} from "../src/ShowImageSrc";

import Top from "../public/imgs/mal/top_mal.png";
import Navbar_mal from "../public/imgs/mal/navbar_mal.png";
import btn_add from "../public/imgs/mal/btn_add.png";
import News1 from "../public/imgs/mal/news1.png";
import News2 from "../public/imgs/mal/news2.png";
import News3 from "../public/imgs/mal/news3.png";
import News4 from "../public/imgs/mal/news4.png";
import Footer1 from "../public/imgs/mal/footer1_mal.png";
import Footer2 from "../public/imgs/mal/footer2_mal.png";
import "./mal.css";

const AnimeItem = ({ anime, index }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (anime.showId) {
      const url = getOptimizedImage(getShowCoverSrc(anime.showId), 300);
      setImageUrl(url);
    } else {
      setImageUrl(getDefaultCover());
    }
  }, [anime.showId]);

  const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num)) return 'N/A';
    return Number(num).toLocaleString('en-US');
  };

  return (
    <div
      style={{
        display: "flex",
        height: "77px",
        marginBottom: "4px",
        paddingBottom: "4px",
        borderBottom: "#e5e5e5 1px solid",
        height:"72px"
      }}
    >
      <div className="anime-cover" style={{ width: "54px", height: "72px" }}>
        <img
          src={imageUrl || getDefaultCover()}
          alt={anime.TitleJapanese || anime.TitleEnglish || "Unknown title"}
          onError={(e) => {
            e.target.src = getDefaultCover();
            setImageError(true);
          }}
          style={{ width: "52px", height: "72px" }}
        />
      </div>

      <div
        style={{
          fontSize: "11px",
          fontFamily: "Verdana, Arial",
          paddingTop: 1,
          paddingLeft: 8,
          display: "table-cell",
          height: "68px",
        }}
      >
        
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontWeight: 700,
            color: "#1C439B",
            paddingTop: 1,
            marginBottom: -1,
          }}
        ><Link 
            to={`/anime/${anime.showId}`}
            style={{
                            fontWeight: 700,
            color: "#1C439B",
            }}
          >
            {anime.TitleJapanese || anime.TitleEnglish || "Untitled"}
          </Link>
          {anime.showId && (
            <img src={btn_add} alt="" style={{ marginLeft: "8px" }} />
          )}
        </div>

        <div
          style={{
            display: "grid",
            paddingTop: 8,
            lineHeight: "1.4em",
            fontSize: "10px",
            color: "#8B8B8B",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {anime.Type != "Unknown" && (
              <span style={{ color: "#1c439b" }}>{anime.Type}</span>
            )}
            {anime.Type === "Unknown" && (
              <span>{anime.Type}</span>
            )}
            {anime.Type != "Manga" && anime.Episodes != "Unknown" && (
            <p style={{ margin: 0, textAlign: "end", marginLeft:"4px"}}>
              ({anime.Episodes} eps)
            </p>
            )}
            {anime.Type === "Manga" && anime.Volumes != "Unknown" && (
            <p style={{ margin: 0, textAlign: "end", marginLeft:"4px"}}>
              ({anime.Volumes} vols)
            </p>
            )}
          </div>
          {anime.Score && <span>Scored {anime.Score}</span>}
          {anime.Members && <span>{anime.Members} members</span>}
        </div>
      </div>
    </div>
  );
};

async function fetchAnimeData(csvUrl) {
  try {
    const response = await fetch(csvUrl[0]);
    if (!response.ok) throw new Error("Network response was not ok");

    const csvText = await response.text();
    
    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          resolve(results.data.filter(item => item && Object.keys(item).length > 0));
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          resolve([]);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching CSV data:", error);
    return [];
  }
}

function cleanAnimeData(animeList) {
  return animeList.map((anime) => {
    const cleanAnime = {};
    
    // Ensure required fields
    cleanAnime.showId = anime.showId || anime.id || '';
    cleanAnime.TitleJapanese = anime.TitleJapanese || anime.Title || '';
    cleanAnime.TitleEnglish = anime.TitleEnglish || anime.Title || '';
    cleanAnime.Type = anime.Type || 'TV';
    cleanAnime.Episodes = anime.Episodes || anime['Number of Episodes'] || '?';
    cleanAnime.Score = anime.Score || anime.Rating || 'N/A';
    cleanAnime.Members = anime.Members || anime['User Votes'] || '0';
    cleanAnime.Volumes = anime.Volumes;
    
    return cleanAnime;
  });
}

function MyAnimeList() {
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "TitleEnglish",
    direction: "ascending",
  });

  useEffect(() => {
    const loadAllAnime = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const allData = await Promise.all(
          Object.values(animeMap).map((url) => fetchAnimeData(url))
        );

        const combinedData = allData.flat();
        const cleanedData = cleanAnimeData(combinedData);

        setAnimeList(cleanedData);

        if (cleanedData.length === 0) {
          setError("No valid anime data found.");
        }
      } catch (err) {
        console.error("Failed to load anime:", err);
        setError("Failed to load anime data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAllAnime();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      console.log("Loaded anime data:", animeList);
    }
  }, [isLoading]);

  const sortedAnime = React.useMemo(() => {
    const sortableItems = [...animeList];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [animeList, sortConfig]);

  const filteredAnime = sortedAnime.filter((anime) => {
    if (!anime) return false;
    const searchText = searchTerm.toLowerCase();
    return (
      (anime.TitleEnglish &&
        anime.TitleEnglish.toLowerCase().includes(searchText)) ||
      (anime.TitleJapenese &&
        anime.TitleJapenese.toLowerCase().includes(searchText)) ||
      (anime.Genres && anime.Genres.toLowerCase().includes(searchText))
    );
  });

  return (
    <div className="my-anime-list">
      <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
        <header>
          <div>
            <Link to={`/`}>
            <img
              src={Top}
              alt="My Anime List"
              style={{ marginBottom: "-6px" }}
            />
            </Link>
            <img
              src={Navbar_mal}
              alt="Navbar"
              style={{ marginBottom: "-4px" }}
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
          <div>
            <h1
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
                fontSize: "16px",
                fontWeight: "700",
                margin: "0",
                padding: "5px 9px",
                textAlign: "left",
              }}
            >
              Search All
            </h1>
          </div>
          <div
            id="content"
            style={{
              backgroundColor: "#fff",
              borderColor: "#e5e5e5",
              borderStyle: "solid",
              borderWidth: "0 1px 1px",
              padding: "5px 10px 10px",
              position: "relative",
            }}
          >
            <div
              style={{ display: "block", margin: "30px auto", width: "768px" }}
            >
              <input
                type="text"
                placeholder="Search Anime..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "#c3c3c3 1px solid",
                  borderRadius: "8px 0 0 8px",
                  borderRight: "#c3c3c3 0 solid",
                  color: "#323232",
                  display: "block",
                  float: "left",
                  fontSize: "14px",
                  height: "48px",
                  margin: "0",
                  padding: "0",
                  textIndent: "10px",
                  width: "715px",
                }}
              />
              <button
                style={{
                  color: "#c3c3c3",
                  backgroundColor: "#f8f8f8",
                  border: "#c3c3c3 1px solid",
                  borderRadius: "0 8px 8px 0",
                  cursor: "pointer",
                  display: "block",
                  fontFamily:
                    "'Font Awesome 6 Pro',Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                  fontSize: "16px",
                  fontWeight: "900",
                  height: "50px",
                  width: "50px",
                  alignContent: "center",
                  padding: "4px 8px",
                }}
              >
                <i class="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
            {error && (
              <div className="error-message">
                {error}
                <button onClick={() => window.location.reload()}>Retry</button>
              </div>
            )}
            <div
              className="anime-results"
              style={{
                display: "table",
                tableLayout: "auto",
                width: "100%",
              }}
            >
              {isLoading ? (
                <div className="loading-spinner">Loading anime data...</div>
              ) : (
                <div
                  id="content-left"
                  style={{
                    borderRight: "#e5e5e5 1px solid",
                    display: "table-cell",
                    paddingRight: "8px",
                    verticalAlign: "top",
                  }}
                >
                  <div
                    className="content-reel"
                    style={{
                      textAlign: "left",
                      fontFamily: "Verdana, Arial",
                    }}
                  >
                    <div
                      className="results-header"
                      style={{
                        backgroundColor: "#4f74c8",
                        color: "#fff",
                        fontWeight: "700",
                        padding: "4px 0",
                        textAlign: "center",
                        marginBottom: "12px",
                        fontSize: "11px",
                        height: "13px",
                      }}
                    >
                      Search Results
                    </div>
                    <div
                      class="link-content-jump ml12 mb24"
                      style={{
                        fontFamily:
                          "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                        marginBottom: "24px",
                        marginLeft: "12px",
                        fontSize: "11px",
                        height: "17px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        class="di-ib mr8"
                        style={{
                          marginRight: "8px",
                          display: "inline-block",
                          lineHeight: "1.5em",
                        }}
                      >
                        Jump to:
                      </span>
                      &nbsp;
                      <a
                        class="link js-link-scroll on"
                        href="#anime"
                        style={{
                          backgroundColor: "#4f74c8",
                          color: "#fff",
                          cursor: "pointer",
                          display: "inline-block",
                          margin: "0 2px",
                          padding: "2px 4px",
                          textDecoration: "none",
                          height: "13px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Anime
                      </a>
                      <a
                        class="link js-link-scroll"
                        href="#manga"
                        style={{
                          color: "#1c439b",
                          display: "inline-block",
                          margin: "0 2px",
                          padding: "2px 4px",
                          textDecoration: "none",
                          height: "13px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Manga
                      </a>
                      <a
                        class="link js-link-scroll"
                        href="#company"
                        style={{
                          color: "#1c439b",
                          display: "inline-block",
                          margin: "0 2px",
                          padding: "2px 4px",
                          textDecoration: "none",
                          height: "13px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Company
                      </a>
                      <a
                        class="link js-link-scroll"
                        href="#people"
                        style={{
                          color: "#1c439b",
                          display: "inline-block",
                          margin: "0 2px",
                          padding: "2px 4px",
                          textDecoration: "none",
                          height: "13px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        People
                      </a>
                      <a
                        class="link js-link-scroll"
                        href="#characters"
                        style={{
                          color: "#1c439b",
                          display: "inline-block",
                          margin: "0 2px",
                          padding: "2px 4px",
                          textDecoration: "none",
                          height: "13px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Characters
                      </a>{" "}
                    </div>
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
                        height: "15px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      Anime
                    </h2>
                    {filteredAnime.length > 0 ? (
                      filteredAnime.map((anime, index) => (
                        <AnimeItem
                          key={anime.showId}
                          anime={anime}
                          index={index}
                        />
                      ))
                    ) : (
                      <div className="no-results">
                        {animeList.length === 0 ? (
                          <p>No anime data available.</p>
                        ) : (
                          <p>No anime found matching "{searchTerm}"</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div
                className="content-right"
                style={{
                  display: "table-cell",
                  paddingLeft: "8px",
                  verticalAlign: "top",
                  width: "300px",
                }}
              >
                <div
                  className="scrollfix"
                  style={{
                    width: "300px",
                    position: "static",
                  }}
                >
                  <div
                    class="result-header mb12 mt16"
                    style={{
                      backgroundColor: "#4f74c8",
                      color: "#fff",
                      fontWeight: "700",
                      padding: "4px 0",
                      textAlign: "center",
                      marginTop: "16px",
                      marginBottom: "12px",
                      height: "13px",
                      fontSize: "11px",
                      fontFamily: "Verdana, Arial",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Related Information
                  </div>
                  <h2
                    id="anime"
                    style={{
                      borderColor: "#bebebe",
                      borderStyle: "solid",
                      borderWidth: "0 0 1px",
                      color: "#000",
                      fontSize: "12px",
                      fontWeight: 700,
                      margin: "4px 0 5px",
                      padding: "3px 0",
                      fontFamily: "Verdana, Arial",
                      height: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    News
                    <a
                      class="floatRightHeader"
                      href="https://myanimelist.net/news/search?q=Attack+On+Titan&amp;cat=news"
                      style={{
                        paddingBottom: "1px",
                        fontSize: "11px",
                        fontWeight: "400",
                        paddingRight: "2px",
                        color: "#1c439b",
                      }}
                    >
                      <i class="fa-solid fa-magnifying-glass"></i> Search
                    </a>
                  </h2>
                  <img src={News1} alt="" style={{marginBottom:"15px"}}/>
                  <h2
                    id="anime"
                    style={{
                      borderColor: "#bebebe",
                      borderStyle: "solid",
                      borderWidth: "0 0 1px",
                      color: "#000",
                      fontSize: "12px",
                      fontWeight: 700,
                      margin: "4px 0 5px",
                      padding: "3px 0",
                      fontFamily: "Verdana, Arial",
                      height: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    Featured Articles
                    <a
                      class="floatRightHeader"
                      href="https://myanimelist.net/news/search?q=Attack+On+Titan&amp;cat=news"
                      style={{
                        paddingBottom: "1px",
                        fontSize: "11px",
                        fontWeight: "400",
                        paddingRight: "2px",
                        color: "#1c439b",
                      }}
                    >
                      <i class="fa-solid fa-magnifying-glass"></i> Search
                    </a>
                  </h2>
                  <img src={News2} alt="" style={{marginBottom:"15px"}}/>
                  <h2
                    id="anime"
                    style={{
                      borderColor: "#bebebe",
                      borderStyle: "solid",
                      borderWidth: "0 0 1px",
                      color: "#000",
                      fontSize: "12px",
                      fontWeight: 700,
                      margin: "4px 0 5px",
                      padding: "3px 0",
                      fontFamily: "Verdana, Arial",
                      height: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    Forum Topics
                    <a
                      class="floatRightHeader"
                      href="https://myanimelist.net/news/search?q=Attack+On+Titan&amp;cat=news"
                      style={{
                        paddingBottom: "1px",
                        fontSize: "11px",
                        fontWeight: "400",
                        paddingRight: "2px",
                        color: "#1c439b",
                      }}
                    >
                      <i class="fa-solid fa-magnifying-glass"></i> Search
                    </a>
                  </h2>
                  <img src={News3} alt="" style={{marginBottom:"15px"}}/>
                  <h2
                    id="anime"
                    style={{
                      borderColor: "#bebebe",
                      borderStyle: "solid",
                      borderWidth: "0 0 1px",
                      color: "#000",
                      fontSize: "12px",
                      fontWeight: 700,
                      margin: "4px 0 5px",
                      padding: "3px 0",
                      fontFamily: "Verdana, Arial",
                      height: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    Clubs
                    <a
                      class="floatRightHeader"
                      href="https://myanimelist.net/news/search?q=Attack+On+Titan&amp;cat=news"
                      style={{
                        paddingBottom: "1px",
                        fontSize: "11px",
                        fontWeight: "400",
                        paddingRight: "2px",
                        color: "#1c439b",
                      }}
                    >
                      <i class="fa-solid fa-magnifying-glass"></i> Search
                    </a>
                  </h2>
                  <img src={News4} alt="" style={{marginBottom:"18px"}}/>
                </div>
              </div>
            </div>
          </div>
        </main>
        <div class="mauto clearfix pt24" style={{
            width:"760px",
            paddingTop:"24px"
            }}>
    <div class="fl-l">
      </div>
      <div class="fl-r">
      </div>
    </div>
      </div>

      <footer>
        <img src={Footer1} alt="Footer 1" className="footer-image" style={{marginBottom:"-5px"}}/>
        <img src={Footer2} alt="Footer 2" className="footer-image" style={{marginBottom:"-6px"}}/>
      </footer>
    </div>
  );
}

export default MyAnimeList;
