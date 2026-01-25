const RatingsBarChart = ({ ratings }) => {
  const maxValue = Math.max(...Object.values(ratings));

  return (
    <div
      style={{
        width: "631.85px",
        height: "max-content",
        display: "flex",
        alignItems: "flex-end",
        gap: "4px",
        fontFamily: "Roboto,Helvetica,Arial,sans-serif",
      }}
    >
      {Object.entries(ratings)
        .sort((a, b) => a[0] - b[0]) // 1 → 10
        .map(([rating, count]) => {
          const height = (count / maxValue) * 60;

          return (
            <div
              key={rating}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {/* Barra */}
              <div
                style={{
                  width: "59.5833px",
                  height: `${height}px`,
                  maxHeight:"56px",
                  backgroundColor: "rgb(14,99,190)",
                  borderRadius: "4px",
                }}
              />

              {/* Label */}
              <span
                style={{
                  marginTop: "0.25rem",
                  fontSize: "1rem",
                  color: "#000",
                }}
              >
                {rating}
              </span>
            </div>
          );
        })}
    </div>
  );
};

export default RatingsBarChart;
