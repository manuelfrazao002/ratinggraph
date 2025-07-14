// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RatingsPage from "../src/RatingPage";
import IMDBMainPage from "./IMDBMainpage";
import EpisodePage from "./EpisodePage";
import SeriesList from "./SeriesList";
import RatingList from "./RatingList";
import MyAnimeList from "./myanimelist";
import MyAnimeListPageDetails from "./myanimelistPageDetails";
import SitesList from "./siteslist";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SitesList/>}/>
        <Route path="/imdb/list" element={<SeriesList/>}/>
        <Route path="/ratinggraph/:movieId" element={<RatingsPage />} />
        <Route path="/imdb/:movieId" element={<IMDBMainPage />} />
        <Route path="/episodepage/:movieId" element={<EpisodePage />} />
        <Route path="/ratinggraph/list" element={<RatingList />} />
        <Route path="/myanimelist/list" element={<MyAnimeList />} />
        <Route path="/anime/:id" element={<MyAnimeListPageDetails />} />
        <Route path="/manga/:id" element={<MyAnimeListPageDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
