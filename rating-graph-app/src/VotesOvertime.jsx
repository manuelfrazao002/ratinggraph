import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Papa from "papaparse";

import { useParams } from 'react-router-dom';
import { movieMap } from "./data/MovieMap";
import { Link } from "react-router-dom";

const VotesOverTime = () => {
  const { movieId } = useParams();
  const [data, setData] = useState([]);

  useEffect(() => {
        if (!movieId || !movieMap[movieId]) {
              console.error("movieId inválido");
              return;
            }
        
            const urls = movieMap[movieId];
    const fetchCSV = async () => {
      const response = await fetch(urls[3]);
      const rawCsv = await response.text();
      const cleanCsv = rawCsv.split("\n").slice(1).join("\n");

      const parsed = Papa.parse(cleanCsv, {
        header: true,
        skipEmptyLines: true,
      });

      const formatted = parsed.data
        .filter(
          (row) =>
            row["Date2"] &&
            row["Seasons"] &&
            row["Episodes"] &&
            row["Total Votes"] &&
            row["Average Votes"] &&
            row["Average Rating"]
        )
        .map((row) => ({
          date: row["Date2"],
          seasons: row["Seasons"],
          episodes: row["Episodes"],
          totalVotes: parseInt(row["Total Votes"].replace(/,/g, ""), 10),
          averageVotes: parseFloat(row["Average Votes"].replace(/,/g, "")),
          averageRating: parseFloat(row["Average Rating"]),
        }));

      setData(formatted);
    };

    fetchCSV();
  }, [movieId]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const entry = payload[0].payload;
      return (
        <div
          style={{
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontSize: "13px",
            lineHeight: "1.5",
            color: "black",
          }}
        >
          <div>
            <strong>{entry.date}</strong>{" "}
          </div>
          <br />
          <div>
            Seasons: <strong>{entry.seasons}</strong>
          </div>
          <div>
            Episodes: <strong>{entry.episodes}</strong>{" "}
          </div>
          <div>
            Total Votes: <strong>{entry.totalVotes.toLocaleString()}</strong>{" "}
          </div>
          <div>
            Avg. Votes: <strong>{entry.averageVotes.toLocaleString()}</strong>{" "}
          </div>
          <div>
            Avg. Rating: <strong>{entry.averageRating.toFixed(1)}</strong>{" "}
          </div>
        </div>
      );
    }
    return null;
  };

  const generateTicks = (min, max, step) => {
    const ticks = [];
    for (let val = min; val <= max; val += step) {
      ticks.push(Number(val.toFixed(2)));
    }
    return ticks;
  };

  const leftDomain = [500000, 1900000]; // exemplo
  const rightDomain = [8.8, 9.5];

  const leftStep = 200000;
  const rightStep = 0.1; // passo 0.1 para eixo da direita

  const leftTicks = generateTicks(leftDomain[0], leftDomain[1], leftStep);
  const rightTicks = generateTicks(rightDomain[0], rightDomain[1], rightStep);

  const desiredTicks = 10;
  const interval =
    data.length > desiredTicks ? Math.floor(data.length / desiredTicks) : 0;

  return (
    <div
      style={{
        width: 1100,
        height: 560,
        backgroundColor: "white",
      }}
    >
      <ResponsiveContainer width={1100} height={560}>
        <LineChart
          data={data}
          margin={{ top: 0, right: 11, left: 20, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="#E6E6E6" />
          <XAxis
            dataKey="date"
            tickFormatter={(dateStr, index) => {
              if (index === 0) return "";
              const date = new Date(dateStr);
              const month = date.toLocaleString("en-US", { month: "short" }); // "Jul"
              const year = date.getFullYear().toString().slice(-2); // "20"
              return `${month} '${year}`;
            }}
            label={{
              value: "Date",
              position: "center",
              offset: 0,
              style: { fill: "#555", fontSize: 12 },
            }}
            tick={{ fontSize: 11 }}
            textAnchor="middle"
            height={70}
            interval={interval}
          />
          <YAxis
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            label={{
              value: "Votes",
              angle: -90,
              position: "insideLeft",
              offset: 0,
              style: { fill: "#555", fontSize: 12 },
            }}
            domain={leftDomain}
            ticks={leftTicks}
            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} // mostra 100k, 200k...
            stroke="#555"
            width={50}
            fontSize={11}
          />
          <YAxis
            yAxisId="right"
            axisLine={false}
            tickLine={false}
            orientation="right"
            label={{
              value: "Rating",
              angle: 90,
              position: "insideRight",
              offset: 0,
              style: { fill: "#555", fontSize: 12 },
            }}
            domain={rightDomain}
            ticks={rightTicks}
            tickFormatter={(val) => val.toFixed(1)}
            stroke="#555"
            width={45}
            fontSize={11}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            height={40}
            wrapperStyle={{ fontSize: 13 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="totalVotes"
            stroke="#F7A35C"
            name="Total Votes"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="averageRating"
            stroke="#F15C80"
            name="Average Rating"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VotesOverTime;
