import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import IMDBMainpage from "./IMDBMainpage"; // importe sua página aqui

function MainRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/imdb" element={<IMDBMainpage />} />
      </Routes>
    </Router>
  );
}

export default MainRoutes;
