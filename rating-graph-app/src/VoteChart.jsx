import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import Papa from "papaparse";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
);

import { useParams } from 'react-router-dom';
import { movieMap } from "./data/MovieMap";
import { Link } from "react-router-dom";

const seasonColors = [
  "#0074D9",
  "#FF4136",
  "#2ECC40",
  "#FF851B",
  "#B10DC9",
  "#39CCCC",
  "#FFDC00",
  "#AAAAAA",
  "#F012BE",
  "#3D9970",
];

export default function VotesChart() {
  const { movieId } = useParams();
  const [labels, setLabels] = useState([]);
  const [titles, setTitles] = useState([]);
  const [seasonData, setSeasonData] = useState({});
  const [parsedData, setParsedData] = useState([]);

  useEffect(() => {
        if (!movieId || !movieMap[movieId]) {
              console.error("movieId inválido");
              return;
            }
        
            const urls = movieMap[movieId];
    fetch(urls[1])
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true });
        const filtered = parsed.data.filter(
          (row) =>
            row["Average Rating"] &&
            row["Season"] &&
            row["Episode"] &&
            row["Number"] &&
            row["Votes"]
        );

        const seasons = {};
        filtered.forEach((row) => {
          const season = row["Season"];
          const votes = parseInt(row["Votes"].replace(/,/g, ""), 10) || 0;
          if (!seasons[season]) seasons[season] = [];
          seasons[season].push({
            episodeNum: row["Number"],
            episodeLabel: row["Episode"],
            votes,
            title: row["TitleName"],
            year: row["Year"],
            trend: parseInt(row["Trend"].replace(/,/g, ""), 10) || 0,
            rating: parseFloat(row["Average Rating"]),
          });
        });

        const allLabels = [];
        const allTitles = [];
        const allParsed = [];

        Object.keys(seasons)
          .sort((a, b) => a - b)
          .forEach((season) => {
            seasons[season].sort((a, b) => {
              const numA = parseInt(a.episodeNum, 10);
              const numB = parseInt(b.episodeNum, 10);
              return numA - numB;
            });
            seasons[season].forEach((ep) => {
              allLabels.push(ep.episodeNum);
              allTitles.push(ep.title);
              allParsed.push(ep);
            });
          });

        setLabels(allLabels);
        setTitles(allTitles);
        setSeasonData(seasons);
        setParsedData(allParsed);
      });
  }, []);

  function linearRegression(data) {
    const filteredData = data
      .map((y, x) => (y !== null ? { x, y } : null))
      .filter(Boolean);

    const n = filteredData.length;
    if (n === 0) return null;

    const sumX = filteredData.reduce((sum, p) => sum + p.x, 0);
    const sumY = filteredData.reduce((sum, p) => sum + p.y, 0);
    const sumXY = filteredData.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = filteredData.reduce((sum, p) => sum + p.x * p.x, 0);

    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) return null;

    const a = (n * sumXY - sumX * sumY) / denominator;
    const b = (sumY - a * sumX) / n;

    return { a, b };
  }

  const pointStyles = [
    "rect", // Season 1
    "triangle", // Season 2
    "circle", // Season 3
    "rectRot", // Season 4
    "rect", // Season 5
  ];

  const datasets = Object.keys(seasonData)
    .sort((a, b) => a - b)
    .map((season, index) => {
      const eps = seasonData[season];
      const dataForSeason = labels.map((label) => {
        const ep = eps.find((e) => e.episodeNum === label);
        return ep ? ep.votes : null;
      });

      const validVotes = dataForSeason.filter((v) => v !== null);
      const average =
        validVotes.reduce((sum, v) => sum + v, 0) / validVotes.length;

      return {
        label: `Season ${season} (${average.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })})`,
        data: dataForSeason,
        borderColor: "transparent",
        backgroundColor: seasonColors[index % seasonColors.length],
        pointBackgroundColor: seasonColors[index % seasonColors.length],
        pointRadius: 5,
        borderWidth: 0,
        fill: false,
        showLine: false,
        tension: 0,
        pointStyle: pointStyles[index % pointStyles.length],
      };
    });

  const trendLineDatasets = Object.keys(seasonData)
    .sort((a, b) => a - b)
    .map((season, index) => {
      const eps = seasonData[season];
      const dataForSeason = labels.map((label) => {
        const ep = eps.find((e) => e.episodeNum === label);
        return ep ? ep.votes : null;
      });

      const lr = linearRegression(dataForSeason);
      if (!lr) return null;

      const trendData = labels.map((label, i) => {
        const ep = eps.find((e) => e.episodeNum === label);
        return ep ? lr.a * i + lr.b : null;
      });

      return {
        label: `Trend Season ${season}`,
        data: trendData,
        borderColor: seasonColors[index % seasonColors.length],
        pointRadius: 0,
        borderWidth: 2,
        fill: false,
        tension: 0,
      };
    })
    .filter(Boolean);

  const allVotes = labels.map((label) => {
    const ep = parsedData.find((e) => e.episodeNum === label);
    return ep ? ep.votes : null;
  });

  const lrGlobal = linearRegression(allVotes);

  const globalTrendData = lrGlobal
    ? labels.map((_, i) => lrGlobal.a * i + lrGlobal.b)
    : [];

  const globalTrendDataset = lrGlobal
    ? {
        label: "Seasons Trendline",
        data: globalTrendData,
        borderColor: "#FF0000",
        borderWidth: 2,
        borderDash: [10, 5],
        pointRadius: 0,
        fill: false,
        tension: 0,
      }
    : null;

  const combinedDatasets = [
    ...datasets,
    ...trendLineDatasets,
    ...(globalTrendDataset ? [globalTrendDataset] : []),
  ];

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#333333",
          font: {
            weight: "bold", // negrito
            size: 13, // tamanho da fonte (opcional)
          },
          usePointStyle: true,
          boxWidth: 16, // largura do ícone
          boxHeight: 8,
          filter: (legendItem, chartData) => {
            const dataset = chartData.datasets[legendItem.datasetIndex];
            return (
              dataset.showLine === false ||
              dataset.label === "Seasons Trendline"
            );
          },
        },
      },
      tooltip: {
        enabled: false, // desativa o tooltip padrão
        external: function (context) {
          let tooltipEl = document.getElementById("chartjs-tooltip");

          if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            tooltipEl.id = "chartjs-tooltip";
            tooltipEl.style.position = "absolute";
            tooltipEl.style.background = "white";
            tooltipEl.style.padding = "6px 10px";
            tooltipEl.style.borderRadius = "4px";
            tooltipEl.style.pointerEvents = "none";
            tooltipEl.style.transition = "all 0.5s ease";
            tooltipEl.style.fontSize = "13px";
            tooltipEl.style.maxWidth = "220px";
            tooltipEl.style.lineHeight = "1.4";
            tooltipEl.style.zIndex = "1000";
            document.body.appendChild(tooltipEl);
          }

          const tooltipModel = context.tooltip;
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
          }

          const position = context.chart.canvas.getBoundingClientRect();
          tooltipEl.style.opacity = 1;
          tooltipEl.style.left =
            position.left + window.pageXOffset + tooltipModel.caretX + "px";
          tooltipEl.style.top =
            position.top + window.pageYOffset + tooltipModel.caretY + "px";

          if (tooltipModel.dataPoints) {
            const dataPoint = tooltipModel.dataPoints[0];
            const index = dataPoint.dataIndex;
            const datasetIndex = dataPoint.datasetIndex;
            const dataset = context.chart.data.datasets[datasetIndex];
            const borderColor = dataset.backgroundColor || "#FFE8A0";
            const ep = parsedData[index];

            tooltipEl.style.border = `2px solid ${borderColor}`;

            tooltipEl.innerHTML = `
        <div style="color:#333;">
          <span style="font-weight:bold;">${
            ep?.episodeLabel || labels[index]
          }</span> (${ep?.year || "Unknown"})
        </div>
        <br/>
        <div style="color:#333; margin-top:4px;">
          <div>${ep?.title || "Unknown"}</div>
          <br/>
          <div><span>Trend:</span> <span style="font-weight:bold;">${ep?.trend.toLocaleString()}</span></div>
          <div><span>Total votes:</span> <span style="font-weight:bold;">${ep?.votes.toLocaleString()}</span></div>
          <div><span>Average Rating:</span> <span style="font-weight:bold;">${ep?.rating.toFixed(
            1
          )}</span></div>
        </div>
      `;
          }
          requestAnimationFrame(() => {
            const tooltipWidth = tooltipEl.offsetWidth;
            const tooltipHeight = tooltipEl.offsetHeight;

            tooltipEl.style.left =
              position.left +
              window.pageXOffset +
              tooltipModel.caretX -
              tooltipWidth / 2 +
              "px";

            tooltipEl.style.top =
              position.top +
              window.pageYOffset +
              tooltipModel.caretY -
              tooltipHeight -
              10 +
              "px"; // 10px acima do ponto
            tooltipEl.style.opacity = 1;
          });
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Votes",
          color: "#555",
          font: {
            size: 12,
          },
          padding: { bottom: 5 },
        },
        ticks: {
          color: "#555",
          font: {
            size: 11,
          },
          callback: function (value) {
            if (value >= 1000) {
              return value / 1000 + "k";
            }
            return value;
          },
        },
        grid: {
          color: "#eee",
        },
        border: {
          display: false,
        },
      },
      x: {
        max: 47,
        type: "linear",
        title: {
          display: true,
          text: "Episodes",
          color: "#555",
          font: {
            size: 12,
          },
          padding: { top: 5 },
        },
        grid: {
          display: true, // Habilita as linhas de grade
          drawOnChartArea: false, // Não desenha as linhas de grade na área do gráfico
          drawTicks: true, // Desenha os ticks
          tickLength: 6, // Comprimento dos ticks
          color: "#CCD6EB", // Cor dos ticks
          lineWidth: 1, // Largura das linhas dos ticks
        },
        ticks: {
          min: 5,
          stepSize: 5,
          callback: function (value) {
            if (value === 0) return ""; // esconde o 0
            return value % 5 === 0 ? value : "";
          },
          padding: 5,
          color: "#555",
          font: { size: 11 },
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
    },
  };

  return (
    <div
      style={{
        width: "1090px",
        height: "541px",
        margin: "auto",
        backgroundColor: "#fff",
      }}
    >
      <Line data={{ labels, datasets: combinedDatasets }} options={options} />
    </div>
  );
}
