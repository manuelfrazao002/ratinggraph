import { Link } from 'react-router-dom';
import React from 'react';

const movies = [
  {
    id: "toe",
    title: "The Outside Explorers"
  },
  {
    id: "spacemetro",
    title: "Space Metro"
  }
];

function MovieList() {
  return (
    <div>
      <h1>Lista de Séries</h1>
      {movies.map((movie) => (
        <div key={movie.id}>
          <h2>{movie.title}</h2>
          <Link to={`/imdb/${movie.id}`}>Ver Detalhes</Link>
        </div>
      ))}
    </div>
  );
}

export default MovieList;
