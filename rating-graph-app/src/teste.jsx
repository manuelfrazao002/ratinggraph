import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import Papa from "papaparse";

const sheetUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJw0CO3rwdc7Zuc_x-Gn2mx_SU15aSJDVKqij3HPAdeSJKyOys69vM8nOYOY19rJy_pV_V_S6uFWc1/pub?gid=190829179&single=true&output=csv";

const seasonColors = [
  "#0074D9", "#FF4136", "#2ECC40", "#FF851B",
  "#B10DC9", "#39CCCC", "#FFDC00", "#AAAAAA",
  "#F012BE", "#3D9970",
];

function linearRegression(data) {
  const filtered = data
    .map((y, x) => (y != null ? { x, y } : null))
    .filter(Boolean);

  const n = filtered.length;
  if (n === 0) return null;

  const sumX = filtered.reduce((sum, p) => sum + p.x, 0);
  const sumY = filtered.reduce((sum, p) => sum + p.y, 0);
  const sumXY = filtered.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumXX = filtered.reduce((sum, p) => sum + p.x * p.x, 0);

  const a = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const b = (sumY - a * sumX) / n;
  return { a, b };
}

export default function RatingChart() {
  const [dataBySeason, setDataBySeason] = useState([]);

  useEffect(() => {
    fetch(sheetUrl)
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true });
        const filtered = parsed.data.filter(
          (row) =>
            row["Average Rating"] &&
            row["Season"] &&
            row["Episode"] &&
            row["Number"]
        );

        const seasons = {};
        filtered.forEach((row) => {
          const season = row["Season"];
          if (!seasons[season]) seasons[season] = [];
          seasons[season].push({
            episodeNum: row["Number"],
            episodeLabel: row["Episode"],
            rating: parseFloat(row["Average Rating"]),
            title: row["Title"],
            votes: parseInt(row["Votes"].replace(/,/g, "")) || 0,
            year: row["Year"],
            trend: parseInt(row["Trend"].replace(/,/g, "")) || 0,
          });
        });

        const seasonList = Object.keys(seasons)
          .sort((a, b) => a - b)
          .map((seasonKey) => {
            const eps = seasons[seasonKey];
            const seasonIndex = parseInt(seasonKey) - 1;

            const ratings = eps.map((ep) => ep.rating);
            const lr = linearRegression(ratings);

            const trendLine = lr
              ? [
                  { x: 0, y: lr.a * 0 + lr.b },
                  { x: eps.length - 1, y: lr.a * (eps.length - 1) + lr.b },
                ]
              : [];

            return {
              season: `Season ${seasonKey}`,
              episodes: eps.map((ep, i) => ({
                ...ep,
                x: i,
                season: `Season ${seasonKey}`,
              })),
              trendLine,
              color: seasonColors[seasonIndex % seasonColors.length],
            };
          });

        setDataBySeason(seasonList);
      });
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const ep = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p><strong>{ep.episodeLabel}</strong> ({ep.year})</p>
          <p>{ep.title}</p>
          <p>Trend: {ep.trend.toLocaleString()}</p>
          <p>Votes: {ep.votes.toLocaleString()}</p>
          <p>Rating: {ep.rating.toFixed(1)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100%", height: 600 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            tickFormatter={(x) => `Ep ${x + 1}`}
            label={{ value: "Episódios", position: "insideBottom", offset: -5 }}
          />
          <YAxis domain={[8, 10]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {dataBySeason.map((season, idx) => (
            <>
              <Line
                key={`season-${idx}`}
                data={season.episodes}
                type="linear"
                dataKey="rating"
                name={season.season}
                stroke={season.color}
                dot={{ r: 4 }}
              />
              <Line
                key={`trend-${idx}`}
                data={season.trendLine}
                type="linear"
                dataKey="y"
                name={`Trend ${season.season}`}
                stroke={season.color}
                strokeDasharray="5 5"
                dot={false}
              />
            </>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
