// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RatingsPage from "../src/RatingPage";
import IMDBMainPage from "./IMDBMainpage";
import EpisodePage from "./EpisodePage";
import SeriesList from "./SeriesList";
import RatingList from "./RatingList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SeriesList/>}/>
        <Route path="/ratinggraph/:movieId" element={<RatingsPage />} />
        <Route path="/imdb/:movieId" element={<IMDBMainPage />} />
        <Route path="/episodepage/:movieId" element={<EpisodePage />} />
        <Route path="/ratinggraph/list" element={<RatingList />} />
      </Routes>
    </Router>
  );
}

export default App;
