{/* Images */}
{episodeImages.length > 0 && (() => {
  const visibleImages = episodeImages.slice(0, 5);
  const remainingCount = episodeImages.length - visibleImages.length;

  return (
    <section
      style={{
        padding: "24px",
        width: "856px",
        marginBottom: "8px",
      }}
    >
      <div style={{ display: "block", marginBottom: "30px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
            width: "808px",
            height: "38.4px",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "28.8px",
              borderRadius: "12px",
              backgroundColor: "rgb(245, 197, 24)",
            }}
          />
          <div>
            <Link
              to={`/episodepage/${movieId}`}
              style={{
                display: "flex",
                alignItems: "center",
                color: "black",
              }}
            >
              <h3
                style={{
                  paddingLeft: "10px",
                  margin: 0,
                  fontSize: "1.5rem",
                  fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                  fontWeight: "600",
                }}
              >
                Photos
              </h3>
              <span
                style={{
                  paddingLeft: "12px",
                  color: "rgba(0,0,0,.54)",
                  fontSize: "0.875rem",
                }}
              >
                {episodeImages.length}
              </span>
            </Link>
          </div>
        </div>

        {/* GRID */}
        <div>
          {/* Linha 1 – 2 imagens grandes */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            {visibleImages.slice(0, 2).map((src, i) => (
              <img
                key={i}
                src={src}
                style={{
                  width: "396px",
                  height: "162.5px",
                  borderRadius: "0.75rem",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                onError={(e) =>
                  (e.currentTarget.style.display = "none")
                }
              />
            ))}
          </div>

          {/* Linha 2 – 2 médias + 1 pequena */}
          <div style={{ display: "flex", gap: "1rem" }}>
            {visibleImages.slice(2, 5).map((src, i) => {
              const isLast = i === 2 && remainingCount > 0;

              return (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    width: i < 2 ? "338.333px" : "100px",
                    height: "149.817px",
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={src}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onError={(e) =>
                      (e.currentTarget.style.display = "none")
                    }
                  />

                  {/* Overlay "+N" */}
                  {isLast && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        pointerEvents: "none",
                      }}
                    >
                      +{formatVotes(remainingCount)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
})()}
