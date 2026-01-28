import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Papa from "papaparse";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { movieMap } from "./data/MovieMap";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
);

/* -----------------------------
   Helpers para eixos “nice”
----------------------------- */

function getRatingStep(range) {
  if (range <= 1.5) return 0.5;
  if (range <= 3) return 1;
  return 2;
}

function buildNiceAxis(minValue, maxValue, tickCount = 8) {
  const range = maxValue - minValue;
  const step = getRatingStep(range);

  const center = (minValue + maxValue) / 2;
  const alignedCenter = Math.round(center / step) * step;

  const halfRange = (tickCount / 2) * step;

  const niceMin = Number((alignedCenter - halfRange + step).toFixed(2));
  const niceMax = Number((alignedCenter + halfRange).toFixed(2));

  return { min: niceMin, max: niceMax, step };
}

function buildNiceVotesAxis(minVotes, maxVotes, tickCount = 8) {
  const range = maxVotes - minVotes;
  const roughStep = range / (tickCount - 1);

  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;

  let niceResidual;
  if (residual <= 1) niceResidual = 1;
  else if (residual <= 2) niceResidual = 2;
  else if (residual <= 2.5) niceResidual = 2.5;
  else if (residual <= 5) niceResidual = 5;
  else niceResidual = 10;

  const step = niceResidual * magnitude;
  const axisRange = step * (tickCount - 1);

  // 🔑 ancora no mínimo real (não no centro)
  let min = Math.floor(minVotes / step) * step;
  let max = min + axisRange;

  // 🔒 garante que o topo contenha os dados
  if (max < maxVotes) {
    const shift = Math.ceil((maxVotes - max) / step);
    min += shift * step;
    max += shift * step;
  }

  // evita negativos
  if (min < 0) {
    min = 0;
    max = axisRange;
  }

  // 🔑 NOVO: nunca cortar dados reais
if (min > minVotes) {
  min = Math.floor(minVotes / step) * step;
  max = min + step * (tickCount - 1);
}

  return { min, max, step };
}

/* ----------------------------- */

const VotesOverTime = () => {
  const { movieId } = useParams();
  const [chartData, setChartData] = useState(null);

  const [y1Min, setY1Min] = useState(null);
  const [y1Max, setY1Max] = useState(null);
  const [y1Step, setY1Step] = useState(null);

  const [y2Min, setY2Min] = useState(null);
  const [y2Max, setY2Max] = useState(null);
  const [y2Step, setY2Step] = useState(null);

  useEffect(() => {
    if (!movieId || !movieMap[movieId]) return;

    const urls = movieMap[movieId];

    const fetchCSV = async () => {
      const infoCsv = await (await fetch(urls[2])).text();
      const infoParsed = Papa.parse(infoCsv, { header: true });
      const isMovie = infoParsed.data[0]?.Type === "Movie";

      const rawCsv = await (await fetch(urls[3])).text();
      const parsed = Papa.parse(rawCsv.split("\n").slice(1).join("\n"), {
        header: true,
        skipEmptyLines: true,
      });

      const data = parsed.data
        .filter((row) =>
          isMovie
            ? row["Date2"] && row["Total Votes"] && row["Average Rating"]
            : row["Date2"] &&
              row["Seasons"] &&
              row["Episodes"] &&
              row["Total Votes"] &&
              row["Average Votes"] &&
              row["Average Rating"],
        )
        .map((row) => ({
          dateISO: new Date(row["Date2"]).toISOString().split("T")[0],
          totalVotes: parseInt(row["Total Votes"].replace(/,/g, ""), 10),
          averageRating: parseFloat(row["Average Rating"]),
          seasons: row["Seasons"],
          episodes: row["Episodes"],
          averageVotes: row["Average Votes"]
            ? parseInt(row["Average Votes"].replace(/,/g, ""), 10)
            : null,
        }));

      /* -------- y2 (Rating) -------- */

      const ratings = data.map((d) => d.averageRating);
      const {
        min: rMin,
        max: rMax,
        step: rStep,
      } = buildNiceAxis(Math.min(...ratings), Math.max(...ratings));

      setY2Min(rMin);
      setY2Max(rMax);
      setY2Step(rStep);

      /* -------- y1 (Votes) -------- */

      const votes = data.map((d) => d.totalVotes);
      const {
        min: vMin,
        max: vMax,
        step: vStep,
      } = buildNiceVotesAxis(Math.min(...votes), Math.max(...votes));

      setY1Min(vMin);
      setY1Max(vMax);
      setY1Step(vStep);

      const radius = Math.max(0, 4 - data.length / 50);
      const borderWidth = Math.max(2, 3 - data.length / 50);

      // Maintain original dataset configuration
      setChartData({
        labels: data.map((d) => d.dateISO),
        datasets: [
          {
            label: "Total Votes",
            data: data.map((d) => ({ x: d.dateISO, y: d.totalVotes })),
            yAxisID: "y1",
            borderColor: "#F7A35C",
            pointBackgroundColor: "#F7A35C",
            pointBorderColor: "#F7A35C",
            fill: false,
            pointRadius: radius,
            pointHoverRadius: radius,
            borderWidth,
            cubicInterpolationMode: "monotone",
            tension: 1,
            spanGaps: true,
          },
          {
            label: "Average Rating",
            data: data.map((d) => ({ x: d.dateISO, y: d.averageRating })),
            yAxisID: "y2",
            borderColor: "#F15C80",
            pointBackgroundColor: "#F15C80",
            pointBorderColor: "#F15C80",
            fill: false,
            pointRadius: radius,
            pointHoverRadius: radius,
            borderWidth,
            cubicInterpolationMode: "monotone",
            tension: 1,
            spanGaps: true,
            pointStyle: "rectRot",
          },
        ],
        tooltipsMap: data,
        isMovie,
      });
    };

    fetchCSV();
  }, [movieId]);

  if (!chartData) return null;

  // Keep original options configuration
  const options = {
    elements: {},
    scales: {
      x: {
        type: "time",
        time: {
          tooltipFormat: "MM/dd/yyyy",
        },
        ticks: {
          maxRotation: 180,
          maxTicksLimit: 11,
          autoSkip: true,
          callback: function (value, index, ticks) {
            const dataLength = this.chart.data.labels.length; // or this.chart.data.datasets[0].data.length
            const labelDate = this.getLabelForValue(value);
            const date = new Date(labelDate);
            if (isNaN(date)) return labelDate;

            if (dataLength < 180) {
              // Format: 05 Jan
              return date.toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
              });
            } else {
              // Format: Jan '24
              const month = date.toLocaleString("en-US", { month: "short" });
              const year = date.getFullYear().toString().slice(-2);
              return `${month} '${year}`;
            }
          },
        },
        grid: {
          color: "#E6E6E6",
          drawOnChartArea: false,
        },
      },
      y1: {
        position: "left",
        min: y1Min,
        max: y1Max,
        ticks: {
          stepSize: y1Step,
          callback: (v) => (v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`),
        },
        grid: {
          drawOnChartArea: true,
        },
        border: {
          display: false,
        },
        title: {
          display: true,
          text: "Votes",
          color: "#666666",
          font: {
            size: 12,
          },
          padding: {
            top: 10,
            bottom: 10,
          },
        },
      },
      y2: {
        position: "right",
        min: y2Min,
        max: y2Max,
        ticks: {
          stepSize: y2Step,
          callback: (v) => {
            const n = Number(v);
            return Number.isInteger(n) ? n.toString() : n.toFixed(1);
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        border: {
          display: false,
        },
        title: {
          display: true,
          text: "Rating",
          color: "#666666",
          font: {
            size: 12,
          },
          padding: {
            top: 10,
            bottom: 10,
          },
        },
      },
    },
    plugins: {
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          title: (context) => {
            if (context.length > 0) {
              const date = new Date(context[0].parsed.x);
              return date.toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
              });
            }
            return "";
          },
          afterTitle: (context) => {
            const index = context[0].dataIndex;
            const d = chartData.tooltipsMap[index];
            const tooltipLines = [
              "",
              `Total Votes: ${d.totalVotes.toLocaleString()}`,
              `Average Rating: ${d.averageRating.toFixed(1)}`,
            ];

            if (chartData.isMovie) {
              tooltipLines.splice(1, 0);
            } else {
              tooltipLines.splice(
                1,
                0,
                `Seasons: ${d.seasons}`,
                `Episodes: ${d.episodes}`,
                `Average Votes: ${d.averageVotes.toLocaleString()}`,
              );
            }

            return tooltipLines;
          },
          label: () => null,
        },
      },
      legend: {
        display: true,
        position: "bottom",
        align: "center",
        labels: {
          usePointStyle: false, // 🔑 DESLIGA símbolos
          color: "#444",
          font: {
            size: 12,
            weight: "500",
          },

          generateLabels(chart) {
            return chart.data.datasets.map((ds, i) => ({
              text: ds.label,

              fillStyle: ds.borderColor, // cor do retângulo
              strokeStyle: ds.borderColor,
              lineWidth: 0,

              hidden: !chart.isDatasetVisible(i),
              datasetIndex: i,
            }));
          },
        },
      },
    },
  };

  return (
    <div style={{ width: 1100, height: 560, backgroundColor: "white" }}>
      <Line key={movieId} data={chartData} options={options} />
    </div>
  );
};

export default VotesOverTime;
