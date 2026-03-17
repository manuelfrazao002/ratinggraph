const RatingsHeatmap = ({ data }) => {
  // Get color based on rating
  const getColor = (rating) => {
    if (!rating || rating === "-") return "#fff";

    const value = parseFloat(rating);

    if (value >= 8.6) return "#f5c518"; // strong yellow
    if (value >= 7) return "#fadf80";
    if (value >= 5) return "#fdf3d1";
    return "#f4f4f4";
  };

  // ✅ Find max number of episodes in any season
  const maxEpisodes = Math.max(...data.map((season) => season.episodes.length));

  return (
    <div style={{ fontFamily: "Roboto,Helvetica,Arial,sans-serif" }}>
      {/* Header (E1, E2...) */}
      <div style={{ display: "flex", marginLeft: "40px", marginBottom: "6px" }}>
        {Array.from({ length: maxEpisodes }).map((_, i) => (
          <div
            key={i}
            style={{
              width: "50px",
              textAlign: "center",
              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
              fontSize: "0.75rem",
              fontWeight: "600",
              lineHeight: "1rem",
              letterSpacing: "0.16667em",
              color: "rgba(0,0,0,0.54)",
              marginRight: "4px",
            }}
          >
            E{i + 1}
          </div>
        ))}
      </div>

      {/* Rows */}
      {data.map((season, i) => (
        <div key={i} style={{ display: "flex", marginBottom: "6px" }}>
          {/* Season label */}
          <div
            style={{
              width: "40px",
              fontFamily: "Roboto,Helvetica,Arial,sans-serif",
              fontSize: "0.75rem",
              fontWeight: "600",
              lineHeight: "1rem",
              letterSpacing: "0.16667em",
              color: "rgba(0,0,0,0.54)",
              display: "flex",
              alignItems: "center",
            }}
          >
            S{i + 1}
          </div>

          {/* Episode cells */}
          {season.episodes.map((rating, j) => (
            <div
              key={j}
              style={{
                width: "48px",
                height: "36px",
                marginRight: "4px",
                borderRadius: "4px",
                backgroundColor: getColor(rating),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: "1rem",
                fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                letterSpacing: "0.00937em",
                lineHeight: "1.25rem",
                padding: "0.5rem, 0px",
                color: rating === "-" ? "#999" : "#000",
                border: "solid #f0f0f0 1px",
              }}
            >
              {rating && !isNaN(rating) ? Number(rating).toFixed(1) : "—"}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default RatingsHeatmap;
