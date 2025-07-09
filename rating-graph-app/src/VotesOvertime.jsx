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
  TimeScale
);

const VotesOverTime = () => {
  const { movieId } = useParams();
  const [chartData, setChartData] = useState(null);
  const [y2Min, setY2Min] = useState(null);
  const [y2Max, setY2Max] = useState(null);

  useEffect(() => {
    if (!movieId || !movieMap[movieId]) {
      console.error("movieId inválido");
      return;
    }

    const urls = movieMap[movieId];
    const fetchCSV = async () => {
      try {
        // First fetch to determine if it's a Movie or TV Show
        const infoResponse = await fetch(urls[2]);
        const infoCsv = await infoResponse.text();
        const infoParsed = Papa.parse(infoCsv, { header: true });
        const isMovie = infoParsed.data[0]?.Type === "Movie";

        // Then fetch the chart data
        const response = await fetch(urls[3]);
        const rawCsv = await response.text();
        const cleanCsv = rawCsv.split("\n").slice(1).join("\n");
        const parsed = Papa.parse(cleanCsv, {
          header: true,
          skipEmptyLines: true,
        });

        // Process data differently for Movies vs TV Shows
        const formattedData = parsed.data
          .filter((row) => {
            if (isMovie) {
              return row["Date2"] && row["Total Votes"] && row["Average Rating"];
            } else {
              return row["Date2"] && row["Seasons"] && row["Episodes"] && 
                     row["Total Votes"] && row["Average Votes"] && row["Average Rating"];
            }
          })
          .map((row) => {
            const baseData = {
              dateISO: new Date(row["Date2"]).toISOString().split("T")[0],
              totalVotes: parseInt(row["Total Votes"].replace(/,/g, ""), 10),
              averageRating: parseFloat(row["Average Rating"]),
            };

            if (isMovie) {
              return {
                ...baseData,
              };
            } else {
              return {
                ...baseData,
                seasons: row["Seasons"],
                episodes: row["Episodes"],
                averageVotes: parseFloat(row["Average Votes"].replace(/,/g, "")),
              };
            }
          });

        // Calculate rating bounds (keep original appearance)
        const ratings = formattedData.map((d) => d.averageRating);
        const minRating = Math.min(...ratings);
        const maxRating = Math.max(...ratings);
        setY2Min(Math.floor(minRating - 1));
        setY2Max(Math.ceil(maxRating + 1));

        // Keep original point styling calculations
        const totalPoints = formattedData.length;
        const maxRadius = 6;
        const minRadius = 0;
        const calculatedRadius = Math.max(minRadius, maxRadius - totalPoints / 50);
        const maxBorderWidth = 3;
        const minBorderWidth = 2;
        const calculatedBorderWidth = Math.max(
          minBorderWidth,
          maxBorderWidth - totalPoints / 50
        );

        // Maintain original dataset configuration
        setChartData({
          labels: formattedData.map((d) => d.dateISO),
          datasets: [
            {
              label: "Total Votes",
              data: formattedData.map((d) => ({ x: d.dateISO, y: d.totalVotes })),
              yAxisID: "y1",
              borderColor: "#F7A35C",
              pointBackgroundColor: "#F7A35C",
              pointBorderColor: "#F7A35C",
              fill: false,
              pointRadius: calculatedRadius,
              pointHoverRadius: calculatedRadius + 5,
              borderWidth: calculatedBorderWidth,
              cubicInterpolationMode: 'monotone',
              tension: 1,
              spanGaps: true,
            },
            {
              label: "Average Rating",
              data: formattedData.map((d) => ({ x: d.dateISO, y: d.averageRating })),
              yAxisID: "y2",
              borderColor: "#F15C80",
              pointBackgroundColor: "#F15C80",
              pointBorderColor: "#F15C80",
              fill: false,
              pointRadius: calculatedRadius,
              pointHoverRadius: calculatedRadius + 5,
              borderWidth: calculatedBorderWidth,
              cubicInterpolationMode: 'monotone',
              tension: 1,
              spanGaps: true,
            },
          ],
          tooltipsMap: formattedData,
          isMovie,
        });
      } catch (error) {
        console.error("Erro ao carregar CSV:", error);
      }
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
          callback: function(value, index, ticks) {
    const dataLength = this.chart.data.labels.length; // or this.chart.data.datasets[0].data.length
    const labelDate = this.getLabelForValue(value);
    const date = new Date(labelDate);
    if (isNaN(date)) return labelDate;
    
    if (dataLength < 180) {
        // Format: 05 Jan
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short"
        });
    } else {
        // Format: Jan '24
        const month = date.toLocaleString("en-US", { month: "short" });
        const year = date.getFullYear().toString().slice(-2);
        return `${month} '${year}`;
    }
}
        },
        grid: {
          color: "#E6E6E6",
          drawOnChartArea: false,
        },
      },
      y1: {
        position: "left",
        alignToPixels: true,
        ticks: {
          count: 5,
          callback: (val) => (val === 0 ? "0" : `${(val / 1000).toFixed(0)}k`),
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
        alignToPixels: true,
        alignTicks: true,
        min: y2Min ?? 0,
        max: y2Max ?? 10,
        ticks: {
          count: 5,
          callback: (val) => val.toFixed(1),
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
              tooltipLines.splice(1, 0, 
                `Seasons: ${d.seasons}`,
                `Episodes: ${d.episodes}`,
                `Average Votes: ${d.averageVotes.toLocaleString()}`
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