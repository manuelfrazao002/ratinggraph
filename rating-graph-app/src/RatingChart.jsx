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
  Filler,
);

import { useParams } from "react-router-dom";
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

export default function RatingChart() {
  const { movieId } = useParams();
  const [labels, setLabels] = useState([]);
  const [titles, setTitles] = useState([]);
  const [seasonData, setSeasonData] = useState({});
  const [parsedData, setParsedData] = useState([]); // novo estado

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
            row["Number"],
        );

        const seasons = {};
        filtered.forEach((row) => {
          const season = row["Season"];
          if (!seasons[season]) seasons[season] = [];
          seasons[season].push({
            episodeNum: row["Number"],
            episodeLabel: row["Episode"],
            rating: parseFloat(row["Average Rating"]),
            title: row["TitleName"],
            votes: parseInt(row["Votes"].replace(/,/g, "")) || 0,
            year: row["Year"],
            trend:
              row["Trend"] === "-" ||
              row["Trend"] === "" ||
              row["Trend"] == null
                ? "-"
                : parseInt(row["Trend"].replace(/,/g, ""), 10),
          });
        });

        const allLabels = [];
        const allTitles = [];
        const allParsed = [];

        Object.keys(seasons)
          .sort((a, b) => a - b)
          .forEach((season) => {
            seasons[season].sort((a, b) => {
              const numA = parseInt(a.episodeLabel.split("E")[1]);
              const numB = parseInt(b.episodeLabel.split("E")[1]);
              return numA - numB;
            });
            seasons[season].forEach((ep) => {
              allLabels.push(ep.episodeNum);
              allTitles.push(ep.title);
              allParsed.push(ep); // adiciona episódio completo
            });
          });

        setLabels(allLabels);
        setTitles(allTitles);
        setSeasonData(seasons);
        setParsedData(allParsed);
      });
  }, [movieId]);

  const ratingValues = parsedData
    .map((e) => e.rating)
    .filter((r) => typeof r === "number" && !isNaN(r));

  const minValue = Math.min(...ratingValues);
  const maxValue = Math.max(...ratingValues);

  let dynamicMin = Math.floor(minValue);
  let dynamicMax = Math.ceil(maxValue);

  // Only pad if the value is exactly on an integer
  if (minValue === dynamicMin) dynamicMin -= 1;
  if (maxValue === dynamicMax) dynamicMax += 1;

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
        return ep ? ep.rating : null;
      });

      const validRatings = dataForSeason.filter((r) => r !== null);
      const average =
        validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length;
        const roundedAverage = Math.round(average * 10) / 10;

      return {
        label: `Season ${season} (${roundedAverage.toFixed(1)})`,
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
        return ep ? ep.rating : null;
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

  const allRatings = labels.map((label) => {
    const ep = parsedData.find((e) => e.episodeNum === label);
    return ep ? ep.rating : null;
  });

  const lrGlobal = linearRegression(allRatings);

  const globalTrendData =
    lrGlobal && Object.keys(seasonData).length >= 2
      ? labels.map((_, i) => lrGlobal.a * i + lrGlobal.b)
      : [];

  const globalTrendDataset =
    Object.keys(seasonData).length >= 2 && globalTrendData.length > 0
      ? {
          label: "Seasons Trendline", // Label personalizada
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

  let episodeCount = labels.length;
  let minVal, maxVal;

  if (episodeCount === 1) {
    minVal = 0.5;
    maxVal = 1.5; // give breathing room for single point
  } else {
    minVal = 1;
    maxVal = episodeCount >= 10 ? episodeCount : episodeCount;
  }

  // Determine step size based on episode count
  let stepSize;
  if (episodeCount >= 90) {
    stepSize = 10;
  } else if (episodeCount >= 40) {
    stepSize = 5;
  } else if (episodeCount >= 18) {
    stepSize = 2;
  } else {
    stepSize = 1;
  }

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
          clip: false,
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
        enabled: false, // desliga o tooltip padrão
        external: function (context) {
          let tooltipEl = document.getElementById("chartjs-tooltip");

          if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            tooltipEl.id = "chartjs-tooltip";
            tooltipEl.style.position = "absolute";
            tooltipEl.style.background = "white";
            tooltipEl.style.padding = "6px 10px";
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

          if (tooltipModel.dataPoints) {
            const dataPoint = tooltipModel.dataPoints[0];
            const index = dataPoint.dataIndex;
            const datasetIndex = dataPoint.datasetIndex;
            const dataset = context.chart.data.datasets[datasetIndex];
            const borderColor = dataset.backgroundColor || "#FFE8A0";

            // Aplica a cor da temporada à borda
            tooltipEl.style.border = `2px solid ${borderColor}`;

            const ep = parsedData[index];

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
        <div><span>Trend:</span> <span style="font-weight:bold;">${ep?.trend.toLocaleString() ?? "-"}</span></div>
        <div><span>Total votes:</span> <span style="font-weight:bold;">${ep?.votes.toLocaleString()}</span></div>
        <div><span>Average Rating:</span> <span style="font-weight:bold;">${ep?.rating.toFixed(1)}</span></div>
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
        min: dynamicMin,
        max: dynamicMax,
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
          stepSize: 1,
          precision: 0,
          color: "#555",
          font: {
            size: 11,
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
        min: minVal,
        max: maxVal,
        type: "linear",
        offset: true, // offsets tick labels and data slightly
        title: {
          display: true,
          text: "Episodes",
          color: "#555",
          font: { size: 12 },
          padding: { top: 5 },
        },
        grid: {
          display: true,
          drawOnChartArea: false,
          drawTicks: true,
          tickLength: 6,
          color: "#CCD6EB",
          lineWidth: 1,
        },
        ticks: {
          stepSize: stepSize,
          autoSkip: false,
          callback: function (value) {
            return value % stepSize === 0 ? value : "";
          },
          font: { size: 11 },
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
