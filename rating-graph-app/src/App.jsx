import React, { useEffect, useState, useRef } from "react";
import RatingChart from "./RatingChart";
import VotingChart from "./VoteChart";
import Chart from "./VotesOvertime";
import EpisodesTable from "./EpisodesTable";
import "../src/App.css";
import Navbar from "./imgs/navbar.png";
import UpInfo from "./imgs/up_info.png";
import TV from "./imgs/tv_ratinggraph.png";
import ShowImage from "./imgs/covers/toe_cover.png";
import Description from "./imgs/description.png";
import Directors from "./imgs/directors.png";
import Writers from "./imgs/writers.png";
import SearchArticle from "./imgs/searcharticle.png";
import SearchTrailer from "./imgs/searchtrailer.png";
import SearchGoogle from "./imgs/searchgoogle.png";
import MainNote from "./imgs/mainnote.png";

import EpRating from "./imgs/ep_rating.png";
import NoteRating from "./imgs/note_rating.png";
import EpVotes from "./imgs/ep_votes.png";
import EpHistory from "./imgs/ep_history.png";
import RelatedTVShows from "./imgs/relatedtvshows.png";
import TVShows from "./imgs/tvshows.png";
import SwitchMobile from "./imgs/switchmobile.png";
import Footer from "./imgs/footer.png";

//btns
import autoscale from "./imgs/btns/autoscale.png";
import scalefrom0 from "./imgs/btns/scalefrom0.png";
import scalefrom0to10 from "./imgs/btns/scalefrom0to10.png";
import toggleseasons from "./imgs/btns/toggleseasons.png";

import "@fortawesome/fontawesome-free/css/all.min.css";
import Papa from "papaparse";

function App() {
  const [seriesData, setSeriesData] = useState([]);

  useEffect(() => {
    fetch(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJw0CO3rwdc7Zuc_x-Gn2mx_SU15aSJDVKqij3HPAdeSJKyOys69vM8nOYOY19rJy_pV_V_S6uFWc1/pub?gid=1942396010&single=true&output=csv"
    )
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            setSeriesData(results.data);
          },
          error: (err) => {
            console.error("Erro ao carregar o CSV:", err);
          },
        });
      });
  }, []);

  const labelStyle = {
    marginBottom: "3px",
  };

  return (
< div>
    <div
      style={{
        backgroundColor: "#FFC000",
        color: "#eee",
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center", // centro horizontal
        alignItems: "center", // centro vertical
        width: "1134px",
      }}
    >
      <main
        style={{
          width: "1110px",
        }}
      >
        <img
          src={Navbar}
          alt=""
          style={{ paddingTop: "12px", paddingBottom: "9.8px" }}
        />

        <section style={{ backgroundColor: "white" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={TV}
              alt=""
              style={{
                height: "19px",
                marginLeft: "7px",
                position: "relative",
                top: "-4px",
              }}
            />
            <h1
              style={{
                fontSize: "18px",
                marginLeft: "3px",
                marginTop: "9px",
                fontWeight: "bold",
                color: "black",
              }}
            >
              The Outside Explorers ratings (TV show, 2015-2025)
            </h1>
          </div>
          <img
            src={UpInfo}
            alt=""
            style={{ position: "relative", top: "-12px" }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "-16px",
            }}
          >
            <img
              src={ShowImage}
              alt="Imagem da Série"
              style={{
                width: "132px",
                height: "194px",
                marginRight: "20px",
                marginLeft: "8px",
                marginBottom: "10px",
                border: "1px solid black",
                position: "relative",
                top: -1,
              }}
            />
            <div
              style={{ marginLeft: "-8px", position: "relative", top: "-6px" }}
            >
              {seriesData.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    height: "194px",
                    alignItems: "center",
                  }}
                >
                  {/* Coluna de títulos */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      fontWeight: 700,
                      color: "#804000",
                      fontSize: 14,
                    }}
                  >
                    <div style={labelStyle}>Rank</div>
                    <div style={labelStyle}>Trend</div>
                    <div style={labelStyle}>Genres</div>
                    <div style={labelStyle}>Seasons</div>
                    <div style={labelStyle}>Episodes</div>
                    <div style={labelStyle}>Total votes</div>
                    <div style={labelStyle}>Average votes</div>
                    <div style={labelStyle}>Average rating</div>
                  </div>

                  {/* Coluna de valores */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      color: "#000",
                      fontSize: 14,
                    }}
                  >
                    <div style={labelStyle}>
                      {seriesData[0]?.Rank}{" "}
                      <span style={{color: "#804000"}}>/ {seriesData[0]?.TotalTVShows}</span>
                    </div>
                    <div style={labelStyle}>{seriesData[0]?.Trend}</div>
                    <div style={labelStyle}>{seriesData[0]?.Genres}</div>
                    <div style={labelStyle}>{seriesData[0]?.Seasons}</div>
                    <div style={labelStyle}>{seriesData[0]?.Episodes}</div>
                    <div style={labelStyle}>{seriesData[0]?.TotalVotes}</div>
                    <div style={labelStyle}>{seriesData[0]?.AverageVotes}</div>
                    <div style={labelStyle}>{seriesData[0]?.AverageRating} <span style={{color: "#804000"}}>/ 10</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <img
            src={Description}
            alt=""
            style={{ marginLeft: 8, position: "relative", top: 1 }}
          />
          <img
            src={Directors}
            alt=""
            style={{ position: "relative", top: -5 }}
          />
          <img
            src={Writers}
            alt=""
            style={{ position: "relative", top: -12 }}
          />
        </section>

        <section style={{ backgroundColor: "white" }}>
          <div
            style={{
              gap: "12px",
              display: "flex",
              marginLeft: "8px",
              marginBottom: "14px",
              position: "relative",
              top: -14,
            }}
          >
            <img src={SearchArticle} alt="" />
            <img src={SearchTrailer} alt="" />
            <img src={SearchGoogle} alt="" />
          </div>
          <img
            src={MainNote}
            alt=""
            style={{ position: "relative", top: -16 }}
          />
          <div style={{ position: "relative", top: -23 }}>
            <section>
              <img src={EpRating} alt="" />
              <div
                style={{
                  gap: "8px",
                  display: "flex",
                  marginLeft: "8px",
                  marginTop: "7px",
                  marginBottom: "14px",
                }}
              >
                <img src={autoscale} alt="" />
                <img src={scalefrom0} alt="" />
                <img src={scalefrom0to10} alt="" />
                <img src={toggleseasons} alt="" />
              </div>
              <RatingChart />
            </section>

            <img
              src={NoteRating}
              alt=""
              style={{ position: "relative", top: "6px" }}
            />

            <section>
              <img src={EpVotes} alt="" />
              <div
                style={{
                  gap: "8px",
                  display: "flex",
                  marginLeft: "8px",
                  marginTop: "7px",
                  marginBottom: "14px",
                }}
              >
                <img src={autoscale} alt="" />
                <img src={scalefrom0} alt="" />
                <img src={toggleseasons} alt="" />
              </div>
              <VotingChart />
            </section>

            <img
              src={NoteRating}
              alt=""
              style={{ position: "relative", top: "7px" }}
            />

            <section>
              <img src={EpHistory} alt="" />
              <div
                style={{
                  gap: "8px",
                  display: "flex",
                  marginLeft: "8px",
                  marginTop: "7px",
                  marginBottom: "18px",
                }}
              >
                <img src={autoscale} alt="" />
                <img src={scalefrom0} alt="" />
              </div>
              <Chart />
              <img
                src={NoteRating}
                alt=""
                style={{ position: "relative", top: "7px" }}
              />
            </section>

            <section>
              <EpisodesTable />
            </section>
          
            <img src={RelatedTVShows} alt="" style={{ position: "relative", top: "-8px" }}/>
            <img
              src={TVShows}
              alt=""
              style={{ marginTop: "0px", marginBottom: "-20px", position: "relative", top: "-3px"}}
            />
          </div>
        </section>
        <footer style={{marginBottom: "6px"}}>
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

export default App;
