// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RatingsPage from "../src/RatingPage";
import IMDBMainPage from "./IMDBMainpage";
import EpisodePage from "./EpisodePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RatingsPage />} />
        <Route path="/imdb" element={<IMDBMainPage />} />
        <Route path="/episodepage" element={<EpisodePage />} />
      </Routes>
    </Router>
  );
}

export default App;
