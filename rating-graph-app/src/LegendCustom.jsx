function LegendCustom({ datasets }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
      {datasets.map((dataset, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", marginRight: 15, cursor: "pointer" }}>
          {/* símbolo colorido */}
          <span
            style={{
              display: "inline-block",
              width: 14,  // controla o tamanho do símbolo
              height: 14,
              backgroundColor: dataset.backgroundColor,
              borderRadius: "50%",  // faz círculo, pode mudar pra quadrado etc
              marginRight: 6,
            }}
          />
          {/* label em negrito e preto */}
          <span style={{ fontWeight: "bold", color: "#000", fontSize: 14 }}>
            {dataset.label}
          </span>
        </div>
      ))}
    </div>
  );
}
