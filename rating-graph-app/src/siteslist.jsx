import React from "react";
import { Link } from "react-router-dom";

function SitesList() {
  return (
    <div style={{ display: "flex", flexDirection: "column", margin: "0 auto" }}>
      <Link to={`/imdb/list`}>Imdb</Link>
      <Link to={`/ratinggraph/list`}>RatingGraph</Link>
      <Link to={`/myanimelist/list`}>MyAnimeList</Link>
    </div>
  );
}

export default SitesList;
