// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RatingsPage from "../src/RatingPage";
import IMDBMainPage from "./IMDBMainpage";
import EpisodePage from "./EpisodePage";
import SeriesList from "./SeriesList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SeriesList/>}/>
        <Route path="/ratinggraph/:movieId" element={<RatingsPage />} />
        <Route path="/imdb/:movieId" element={<IMDBMainPage />} />
        <Route path="/episodepage/:movieId" element={<EpisodePage />} />
      </Routes>
    </Router>
  );
}

export default App;
