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
import { useParams } from "react-router-dom";
import { movieMap } from "./data/MovieMap";

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

  // Custom Tooltip para mostrar dados
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
            <strong>{entry.date}</strong>
          </div>
          <br />
          <div>
            Seasons: <strong>{entry.seasons}</strong>
          </div>
          <div>
            Episodes: <strong>{entry.episodes}</strong>
          </div>
          <div>
            Total Votes: <strong>{entry.totalVotes.toLocaleString()}</strong>
          </div>
          <div>
            Avg. Votes: <strong>{entry.averageVotes.toLocaleString()}</strong>
          </div>
          <div>
            Avg. Rating: <strong>{entry.averageRating.toFixed(1)}</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) return <div>Loading...</div>;

  // Arrays para cálculos
  const totalVotesArray = data.map((d) => d.totalVotes);
  const averageRatingArray = data.map((d) => d.averageRating);

  // Função para calcular passo "bonito" automático para votos
  const calculateNiceStep = (minVal, maxVal, desiredTicks = 10) => {
    const range = maxVal - minVal;
    if (range === 0) return 50;

    const rawStep = range / (desiredTicks - 1);

    // Passos comuns para ticks de votos
    const niceSteps = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 15000, 20000, 250000, 50000, 100000, 150000, 200000, 250000];

    const step = niceSteps.find((s) => s >= rawStep) || rawStep;

    return step;
  };

  const votesMin = Math.min(...totalVotesArray);
  const votesMax = Math.max(...totalVotesArray);

  const stepVotes = calculateNiceStep(votesMin, votesMax, 10);

  const domainMinVotes = Math.max(0, Math.floor(votesMin / stepVotes) * stepVotes);
  const domainMaxVotes = Math.ceil(votesMax / stepVotes) * stepVotes;

  // Gera ticks para votos
  const votesTicks = [];
  for (let val = domainMinVotes; val <= domainMaxVotes; val += stepVotes) {
    votesTicks.push(val);
  }

  // Calcula domínio do rating com margem de 2%
  const calcDomainWithMargin = (values, marginFactor = 0.1
  ) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const margin = (max - min) * marginFactor || 1;
    return [min - margin, max + margin];
  };

  const ratingDomain = calcDomainWithMargin(averageRatingArray, 0.1);

  // Função para mapear ticks dos votos para rating para alinhar os ticks nos dois eixos
  const mapTick = (val, domainSrc, domainDst) => {
    return (
      domainDst[0] +
      ((val - domainSrc[0]) * (domainDst[1] - domainDst[0])) /
        (domainSrc[1] - domainSrc[0])
    );
  };

  // Gera ticks de rating alinhados aos votos
  const ratingTicks = votesTicks.map((tick) =>
    Number(mapTick(tick, [domainMinVotes, domainMaxVotes], ratingDomain).toFixed(2))
  );

  // Ajusta ticks do eixo X para evitar excesso
  const desiredXTicks = 10;
  const intervalX =
    data.length > desiredXTicks ? Math.floor(data.length / desiredXTicks) : 0;

  return (
    <div style={{ width: 1100, height: 560, backgroundColor: "white" }}>
      <ResponsiveContainer width={1100} height={560}>
        <LineChart data={data} margin={{ top: 0, right: 11, left: 20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E6E6E6" />
          <XAxis
            dataKey="date"
            tickFormatter={(dateStr, index) => {
              if (index === 0) return "";
              const date = new Date(dateStr);
              const month = date.toLocaleString("en-US", { month: "short" });
              const year = date.getFullYear().toString().slice(-2);
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
            interval={intervalX}
          />
          <YAxis
            yAxisId="left"
            domain={[domainMinVotes, domainMaxVotes]}
            ticks={votesTicks}
            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
            axisLine={false}
            tickLine={false}
            label={{
              value: "Votes",
              angle: -90,
              position: "insideLeft",
              offset: 0,
              style: { fill: "#555", fontSize: 12 },
            }}
            stroke="#555"
            width={50}
            fontSize={11}
          />
          <YAxis
            yAxisId="right"
            domain={ratingDomain}
            ticks={ratingTicks}
            tickFormatter={(val) => val.toFixed(1)}
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
