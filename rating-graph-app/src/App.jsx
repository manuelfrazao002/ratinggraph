// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RatingsPage from "../src/RatingPage";
import IMDBMainPage from "./IMDBMainpage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RatingsPage />} />
        <Route path="/imdb" element={<IMDBMainPage />} />
      </Routes>
    </Router>
  );
}

export default App;
