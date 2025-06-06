import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";

const SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJw0CO3rwdc7Zuc_x-Gn2mx_SU15aSJDVKqij3HPAdeSJKyOys69vM8nOYOY19rJy_pV_V_S6uFWc1/pub?gid=190829179&single=true&output=csv";

function EpisodesTable() {
  const [episodes, setEpisodes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const tbodyRef = useRef(null);

  useEffect(() => {
    fetch(SHEETS_CSV_URL)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const filtered = results.data.filter(
              (ep) =>
                ep.Votes && !isNaN(Number(ep.Votes.replace(/[^0-9]/g, "")))
            );
            setEpisodes(filtered);
          },
          error: (err) => {
            console.error("Error parsing CSV:", err);
          },
        });
      });
  }, []);

  const totalPages = Math.ceil(episodes.length / itemsPerPage);
  const paginatedEpisodes = episodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const visibleRows = paginatedEpisodes.slice(0, itemsPerPage);

  useEffect(() => {
    if (tbodyRef.current) {
      tbodyRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const columnStyles = [
    { textAlign: "center" }, // Trend
    { textAlign: "center" }, // Season
    { textAlign: "center" }, // Episode
    { textAlign: "center" }, // Title
    { textAlign: "center" }, // Year
    { textAlign: "center" }, // Total Votes
    { textAlign: "center" }, // Average Rating
  ];

  const columns = [
    "Trend",
    "Season",
    "Episode",
    "Title",
    "Year",
    "Total Votes",
    "Average Rating",
  ];
  const columnWidths = [
    "80px",
    "80px",
    "80px",
    "400px",
    "80px",
    "160px",
    "130px",
  ];

  return (
    <div style={{ overflowX: "auto", position: "relative"}}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "Arial, sans-serif",
          fontSize: 14,
          tableLayout: "fixed", // Garante alinhamento entre colunas
        }}
      >
        <thead>
          <tr>
            {columns.map((header, idx) => (
              <th
                key={header}
                style={{
                  width: columnWidths[idx],
                  backgroundColor: "#FFE8A0",
                  color: "#804000",
                  padding: "4.5px",
                  fontWeight: "bold",
                  borderBottom: "1px solid #D5B273",
                  textAlign: columnStyles[idx].textAlign,
                  whiteSpace: columnStyles[idx].whiteSpace || "normal",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody
          ref={tbodyRef}
          style={{
            display: "block",
            maxHeight: "401px",
            minHeight: "401px",
            overflowY: "auto",
            width: "1110px",
            color: "black",
            whiteSpace: "nowrap",
            borderBottom: "1px solid #d5b273",
          }}
        >
          {visibleRows.map((ep, idx) => (
            <tr
              key={idx}
              style={{
                display: "table",
                tableLayout: "fixed",
                borderBottom: "1px solid #d5b273",

              }}
            >
              <td
                style={{
                  width: columnWidths[0],
                  padding: "2.6px 8px",
                  textAlign: "center",
                  
                }}
              >
                {ep.Trend}
              </td>
              <td
                style={{
                  width: columnWidths[1],
                  padding: "2.6px 8px",
                  textAlign: "center",
                  backgroundColor: "rgba(255,192,0,0.1)",
                }}
              >
                {ep.Season}
              </td>
              <td
                style={{
                  width: columnWidths[2],
                  padding: "2.6px 8px",
                  textAlign: "center",
                  backgroundColor: "rgba(255,192,0,0.1)",
                }}
              >
                {ep["Episode2"] ? Number(ep["Episode2"]).toFixed(0) : ""}
              </td>
              <td
                style={{
                  width: columnWidths[3],
                  padding: "2.6px 8px",
                  textAlign: "left",
                }}
              >
                {ep.TitleName}
              </td>
              <td
                style={{
                  width: columnWidths[4],
                  padding: "2.6px 8px",
                  textAlign: "center",
                }}
              >
                {ep.Year}
              </td>
              <td
                style={{
                  width: columnWidths[5],
                  padding: "2.6px 8px",
                  textAlign: "center",
                }}
              >
                {ep.Votes
                  ? Number(ep.Votes.replace(/[^0-9]/g, "")).toLocaleString()
                  : ""}
              </td>
              <td
                style={{
                  width: columnWidths[6],
                  padding: "2.6px 8px",
                  textAlign: "center",
                }}
              >
                {ep["Average Rating"]
                  ? Number(ep["Average Rating"]).toFixed(1)
                  : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginação e controles */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            style={{
              backgroundColor: currentPage === 1 ? "#ddd" : "#FFE8A0",
              color: currentPage === 1 ? "#888" : "#804000",
              border: "none",
              borderRadius: "0px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              height: 33,
              width: "102.5px",
              fontSize: 14,
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
              paddingBottom: 0,
              position: "relative",
              top: "-5px",
            }}
          >
            <i
              className="fas fa-chevron-left"
              style={{ padding: "8px 12px" }}
            ></i>{" "}
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            style={{
              backgroundColor: currentPage === totalPages ? "#ddd" : "#FFE8A0",
              color: currentPage === totalPages ? "#888" : "#804000",
              border: "none",
              borderRadius: "0px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              height: 33,
              width: "76.8px",
              fontSize: 14,
              paddingTop: 0,
              paddingBottom: 0,
              position: "relative",
              top: "-5px",
            }}
          >
            Next{" "}
            <i
              className="fas fa-chevron-right"
              style={{ padding: "8px 12px" }}
            ></i>
          </button>
        </div>

        <p style={{ fontSize: 14, color: "black", margin: 3 }}>
          {(currentPage - 1) * itemsPerPage + 1}–
          {Math.min(currentPage * itemsPerPage, episodes.length)} /{" "}
          {episodes.length}
        </p>

        <div style={{ marginBottom: 19, marginTop: 5, position: "relative", top:"-1px"}}>
          <label
            htmlFor="rowsPerPage"
            style={{ marginRight: 4, color: "black", fontSize: "14px"}}
          >
            Show
          </label>
          <select
            id="rowsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            style={{
              padding: "3px 4px",
              borderRadius: "0px",
              color: "#804000",
              backgroundColor: "#FFE8A0",
              border: "none",
              fontSize: "14px",
            }}
          >
            {[10, 25, 50, 100, 250].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <span style={{ marginLeft: 4, color: "black", fontSize: "14px" }}>
            entries
          </span>
        </div>
      </div>
    </div>
  );
}

export default EpisodesTable;
