const RatingsBarChart = ({ ratings }) => {
  const maxValue = Math.max(...Object.values(ratings));

  // Total votes (for percentage)
  const totalVotes = Object.values(ratings).reduce((a, b) => a + b, 0);

  // Format numbers like IMDb (K / M)
  const formatCount = (num) => {
    if (num < 1000) return num.toString();

    if (num < 10000) {
      const k = (num / 1000).toFixed(1);
      return k.endsWith(".0") ? `${parseInt(k)}K` : `${k}K`;
    }

    if (num < 1000000) {
      return `${Math.round(num / 1000)}K`;
    }

    const m = (num / 1000000).toFixed(1);
    return m.endsWith(".0") ? `${parseInt(m)}M` : `${m}M`;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "3px",
        fontFamily: "Roboto,Helvetica,Arial,sans-serif",
        maxWidth: "808px",
      }}
    >
      {Object.entries(ratings)
        .sort((a, b) => b[0] - a[0]) // 10 → 1
        .map(([rating, count]) => {
          const width = (count / maxValue) * 100;
          const percentage = ((count / totalVotes) * 100).toFixed(1) + "%";

          return (
            <div
              key={rating}
              style={{
                display: "flex",
                alignItems: "center",
                maxWidth: "808px",
              }}
            >
              {/* Rating number */}
              <div
                style={{
                  width: "20px",
                  fontWeight: "600",
                  fontSize: "16px",
                  color: "rgba(0,0,0,0.87)",
                }}
              >
                {rating}
              </div>

              {/* Bar */}
              <div
                style={{
                  flex: 1,
                  margin: "0 8px",
                  height: "38px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {/* Bar */}
                <div
                  style={{
                    width: `${width}%`,
                    height: "100%",
                    backgroundColor: "rgb(245, 197, 24)",
                    stroke: "rgb(245,197,24)",
                    borderRadius: "4px",
                    minWidth: "1px",
                    transition: "width 0.3s ease",
                  }}
                />

                {/* Label that follows bar */}
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "14px",
                    color: "rgba(0,0,0,0.87)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {percentage} ({formatCount(count)})
                </span>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default RatingsBarChart;
