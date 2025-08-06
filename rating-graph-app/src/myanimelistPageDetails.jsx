import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import Papa from "papaparse";
import { animeMap } from "../src/data/MovieMap";
import {
  getShowCoverSrc,
  getDefaultCover,
  getTrailerSrc,
  getCharacterSrc,
  getVoiceActorSrc,
  getStaffSrc,
} from "../src/ShowImageSrc";
import "./mal.css";

import Top from "../public/imgs/mal/top_mal.png";
import Navbar_mal from "../public/imgs/mal/navbar_mal.png";
import RatingBar from "../public/imgs/mal/ratingbar.png";
import Footer1 from "../public/imgs/mal/footer1_mal.png";
import Footer2 from "../public/imgs/mal/footer2_mal.png";
import BtnStremPlay from "../public/imgs/mal/btn_stream_play.png";
import RatingBarManga from "../public/imgs/mal/ratingbar_manga.png";
import MalxJapan from "../public/imgs/mal/malxjapan.png";
import ReadMangaMirai from "../public/imgs/mal/readmangamirai.png";
import ReadSample from "../public/imgs/mal/readsample.png";
import NotifyStart from "../public/imgs/mal/notifystart.png";
import MV from "../public/imgs/mal/mv.png";
import Play from "../public/imgs/mal/play.png";
import Reviews from "../public/imgs/mal/reviews.png";
import InterestStacks from "../public/imgs/mal/intereststacks.png";
import Recomendations from "../public/imgs/mal/recomendations.png";
import RecomendationsManga from "../public/imgs/mal/recommendations_manga.png";
import RecentNews from "../public/imgs/mal/recentnews.png";
import Discussions from "../public/imgs/mal/discussions.png";
import RecentArticles from "../public/imgs/mal/recentarticles.png";

function RelatedEntries({ seriesId, currentId, csvUrl }) {
  const { id } = useParams();
  const [relatedEntries, setRelatedEntries] = useState([]);
  const [animeData, setAnimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Função para carregar os dados
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Carrega dados do anime principal
      const baseId = id.replace(/_\w+$/, "");
      const animeCsvUrl = animeMap[baseId]?.[0];
      if (!animeCsvUrl) throw new Error("Base anime data not found");

      const [animeResponse, relatedResponse] = await Promise.all([
        fetch(animeCsvUrl),
        fetch(csvUrl),
      ]);

      const [animeCsvText, relatedCsvText] = await Promise.all([
        animeResponse.text(),
        relatedResponse.text(),
      ]);

      // Processa os dados do anime principal
      const animeData = await new Promise((resolve, reject) => {
        Papa.parse(animeCsvText, {
          header: true,
          complete: (results) => {
            const anime = results.data.find((item) => item.showId === id);
            if (anime) resolve(anime);
            else reject(new Error(`Anime with id ${id} not found`));
          },
          error: (err) => reject(new Error("Error parsing anime CSV")),
        });
      });

      // Processa os dados relacionados
      Papa.parse(relatedCsvText, {
        header: true,
        complete: (results) => {
          console.log("Total de entradas no CSV:", results.data.length);
          console.log("Primeiras entradas:", results.data);
          const currentSeasonNum = parseInt(
            currentId.match(/_s(\d+)$/)?.[1] || 0
          );

          // Filtra por série e remove o currentId
          let related = results.data.filter(
            (entry) => entry.showId !== currentId
          );

          related = related.filter((entry) => {
            const isManga = animeData.Type2 === "Manga";
            console.log("Tipo do anime:", isManga);

            if (isManga) {
              return ["Adaptation"].includes(entry.NameEntriesManga);
            } else {
              const entrySeasonNum = parseInt(
                entry.showId.match(/_s(\d+)$/)?.[1] || 0
              );

              // Determina dinamicamente o tipo de relação
              if (entrySeasonNum === currentSeasonNum + 1) {
                entry.NameEntries = "Sequel"; // Atualiza dinamicamente
                return true;
              } else if (entrySeasonNum === currentSeasonNum - 1) {
                entry.NameEntries = "Prequel"; // Atualiza dinamicamente
                return true;
              }
              // Mantém outras relações (Adaptation)
              return entry.NameEntries === "Adaptation";
            }
          });

          // Mapeia os resultados finais
          related = related.map((entry) => ({
            ...entry,
            coverImage: getShowCoverSrc(entry.showId),
            isManga: entry.Type2 === "Manga",
            isAnime: entry.Type2 === "Anime",
            displayName:
              animeData.Type2 === "Manga"
                ? entry.NameEntriesManga || entry.NameEntries
                : entry.NameEntries,
          }));

          console.log("Filtered related entries:", related);
          setRelatedEntries(related);
          setLoading(false);
        },
        error: () => {
          throw new Error("Error parsing related entries CSV");
        },
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [id, currentId, seriesId, csvUrl]);

  // Carrega os dados inicialmente e configura polling
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Atualiza os dados quando lastUpdate muda
  useEffect(() => {
    loadData();
  }, [lastUpdate, loadData]);

  const isManga = animeData.Type2 === "Manga";
  const isAnime = animeData.Type2 === "Anime";

  console.log(relatedEntries);
  // Componente de renderização de item
  const renderEntryItem = (entry, index) => {
    return (
      <li
        key={`${entry.showId}-${entry.NameEntries}-${index}`}
        style={{
          backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F8F8F8",
          borderBottom: "1px solid #e5e5e5",
          display: "flex",
          height: "78px",
        }}
      >
        <div style={{ marginRight: "4px", flexShrink: 0, padding: "3px" }}>
          <img
            src={entry.coverImage}
            alt=""
            style={{
              width: "50px",
              height: "70px",
              border: "1px solid #bebebe",
              objectFit: "cover",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingTop: "3px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {entry.isAnime && (
              <span
                style={{
                  color: "#000",
                  fontSize: "11px",
                  marginRight: "8px",
                }}
              >
                {entry.displayName} ({entry.Type})
              </span>
            )}
            {entry.isManga && (
              <span
                style={{
                  color: "#000",
                  fontSize: "11px",
                  marginRight: "8px",
                }}
              >
                {entry.NameEntriesManga} ({entry.Type})
              </span>
            )}
          </div>
          <Link
            to={`/${entry.isManga ? "manga" : "anime"}/${entry.showId}`}
            style={{
              color: "#1c439b",
              textDecoration: "none",
              fontSize: "11px",
              lineHeight: "1.5em",
              ":hover": { textDecoration: "underline" },
              marginBottom: "3px",
            }}
          >
            {entry.TitleJapanese || entry.Title}
          </Link>
        </div>
      </li>
    );
  };

  if (error)
    return <div style={{ padding: "5px 0", color: "red" }}>Error: {error}</div>;
  if (relatedEntries.length < 1) return null;

  // Divide os itens em duas colunas
  const half = Math.ceil(relatedEntries.length / 2);
  const columns = [relatedEntries.slice(0, half), relatedEntries.slice(half)];

  return (
    <>
      <div
        style={{
          borderColor: "#bebebe",
          borderStyle: "solid",
          borderWidth: "0 0 1px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "4px 0 5px",
          padding: "3px 0",
          height: "16.5px",
        }}
      >
        <h2
          style={{
            fontSize: "12px",
            color: "#000",
            fontWeight: "700",
            margin: "0",
          }}
        >
          Related Entries
        </h2>
        <span
          style={{
            fontWeight: "normal",
            fontSize: "11px",
            color: "#1c439b",
            height: "16.5px",
            paddingRight: "2px",
          }}
        >
          Edit
        </span>
      </div>
      <div style={{ display: "flex" }}>
        {columns.map((column, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <div
                style={{
                  width: "1px",
                  backgroundColor: "#e5e5e5",
                  margin: "0 8px",
                }}
              />
            )}
            <div style={{ width: "392px" }}>
              <ul
                style={{ listStyleType: "none", paddingLeft: "0", margin: "0" }}
              >
                {column.map(renderEntryItem)}
              </ul>
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

function CharactersVoiceActorsEntries({ seriesId, currentId }) {
  const { id } = useParams();
  const [characters, setCharacters] = useState([]);
  const [voiceActors, setVoiceActors] = useState([]);
  const [voiceActorRelations, setVoiceActorRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obter URLs dos CSVs
  const baseId = id.replace(/_\w+$/, "");
  const CharacterUrl = animeMap[baseId]?.[1];
  const VoiceActorUrl = animeMap[baseId]?.[2];
  const VoiceActorRelationUrl = animeMap[baseId]?.[3];

  // Carrega dados dos personagens
  const loadCharacters = useCallback(async () => {
    try {
      const response = await fetch(CharacterUrl);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          const filtered = results.data.filter(
            (item) => item.showId === currentId
          );
          setCharacters(
            filtered.map((char) => ({
              ...char,
              coverImage: getCharacterSrc(char.characterId),
              DisplayName: char.Name,
              Type: char.Role,
            }))
          );
        },
      });
    } catch (err) {
      setError("Error loading characters: " + err.message);
    }
  }, [currentId, CharacterUrl]);

  // Carrega dados dos dubladores
  const loadVoiceActors = useCallback(async () => {
    try {
      const response = await fetch(VoiceActorUrl);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          const filtered = results.data.filter(
            (item) => item.showId === currentId
          );
          setVoiceActors(
            filtered.map((va) => ({
              ...va,
              coverImage: getVoiceActorSrc(va.VCId),
              DisplayName: va.Name,
              Type: va.Nationality,
            }))
          );
        },
      });
    } catch (err) {
      setError("Error loading voice actors: " + err.message);
    }
  }, [currentId, VoiceActorUrl]);

  // Carrega dados das relações
  const loadVoiceActorRelations = useCallback(async () => {
    try {
      if (!VoiceActorRelationUrl) return;

      const response = await fetch(VoiceActorRelationUrl);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          setVoiceActorRelations(
            results.data.filter((item) => item.showId === currentId)
          );
        },
      });
    } catch (err) {
      setError("Error loading voice actor relations: " + err.message);
    }
  }, [currentId, VoiceActorRelationUrl]);

  // Carrega todos os dados
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          loadCharacters(),
          loadVoiceActors(),
          loadVoiceActorRelations(),
        ]);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    loadAll();
  }, [loadCharacters, loadVoiceActors, loadVoiceActorRelations]);

  // Função para associar personagens a dubladores
  const getPairedEntries = () => {
    return characters.map((character) => {
      const relation = voiceActorRelations.find(
        (rel) => rel.characterId === character.characterId
      );

      const voiceActor = relation
        ? voiceActors.find((va) => va.VCId === relation.VCId)
        : null;

      return {
        character,
        voiceActor: voiceActor || {
          DisplayName: "",
          Type: "",
          coverImage: "",
        },
      };
    });
  };

  const renderEntryItem = ({ character, voiceActor, language }, index) => (
    <li
      key={`${character.characterId}-${voiceActor.VCId || "unknown"}`}
      style={{
        backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F8F8F8",
        borderBottom: "1px solid #e5e5e5",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {/* Lado esquerdo - Personagem */}
      <div style={{ display: "flex" }}>
        <div style={{ flexShrink: 0, padding: "3px", height: "64px" }}>
          <img
            src={character.coverImage}
            alt=""
            style={{
              width: "42px",
              height: "62px",
              border: "1px solid #bebebe",
              objectFit: "cover",
            }}
          />
        </div>
        <div style={{ padding: "3px", verticalAlign: "top" }}>
          <Link
            to={``}
            style={{
              color: "#1c439b",
              textDecoration: "none",
              fontSize: "11px",
              lineHeight: "1.5em",
              ":hover": { textDecoration: "underline" },
            }}
          >
            {character.DisplayName}
          </Link>
          <div
            style={{ display: "flex", alignItems: "center", padding: "3px 0" }}
          >
            <small style={{ color: "#000" }}>{character.Type}</small>
          </div>
        </div>
      </div>

      {/* Lado direito - Dublador */}
      <div style={{ display: "flex" }}>
        <div style={{ padding: "3px", verticalAlign: "top" }}>
          <Link
            to={``}
            style={{
              color: "#1c439b",
              textDecoration: "none",
              fontSize: "11px",
              lineHeight: "1.5em",
              ":hover": { textDecoration: "underline" },
              textAlign: "right",
            }}
          >
            {voiceActor.Name}
          </Link>
          <div style={{ textAlign: "right" }}>
            <small style={{ color: "#000" }}>{voiceActor.Type}</small>
          </div>
        </div>
        <div
          style={{
            flexShrink: 0,
            padding: "3px",
            height: "64px",
            float: "right",
          }}
        >
          {voiceActor.coverImage != "" && (
          <img
            src={voiceActor.coverImage}
            alt=""
            style={{
              width: "42px",
              height: "62px",
              border: "1px solid #bebebe",
              objectFit: "cover",
            }}
          />
          )}
        </div>
      </div>
    </li>
  );

  if (error)
    return (
      <>
        <div
          style={{
            borderColor: "#bebebe",
            borderStyle: "solid",
            borderWidth: "0 0 1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "4px 0 5px",
            padding: "3px 0",
            height: "16.5px",
          }}
        >
          <h2
            style={{
              fontSize: "12px",
              color: "#000",
              fontWeight: "700",
              margin: "0",
            }}
          >
            Characters & Voice Actors
          </h2>
          <span
            style={{
              fontWeight: "normal",
              fontSize: "11px",
              color: "#1c439b",
              height: "16.5px",
              paddingRight: "2px",
            }}
          >
            More characters
          </span>
        </div>
        <span style={{ color: "#000" }}>
          No characters and voice actors have been added to this title. Help
          improve our database by adding characters or voice actors{" "}
          <span style={{ color: "#1c439b" }}>here</span>.
        </span>
      </>
    );

  const pairedEntries = getPairedEntries();

  if (pairedEntries.length === 0) {
    return (
      <>
        <div
          style={{
            borderColor: "#bebebe",
            borderStyle: "solid",
            borderWidth: "0 0 1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "4px 0 5px",
            padding: "3px 0",
            height: "16.5px",
          }}
        >
          <h2
            style={{
              fontSize: "12px",
              color: "#000",
              fontWeight: "700",
              margin: "0",
            }}
          >
            Characters & Voice Actors
          </h2>
          <span
            style={{
              fontWeight: "normal",
              fontSize: "11px",
              color: "#1c439b",
              height: "16.5px",
              paddingRight: "2px",
            }}
          >
            More characters
          </span>
        </div>
        <span style={{ color: "#000" }}>
          No characters or voice actors have been added to this title. Help
          improve our database by adding characters or voice actors{" "}
          <span style={{ color: "#1c439b" }}>here</span>.
        </span>
      </>
    );
  }

  // Divide os itens em colunas
  const half = Math.ceil(pairedEntries.length / 2);
  const columns = [pairedEntries.slice(0, half), pairedEntries.slice(half)];

  return (
    <>
      <div
        style={{
          borderColor: "#bebebe",
          borderStyle: "solid",
          borderWidth: "0 0 1px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "4px 0 5px",
          padding: "3px 0",
          height: "16.5px",
        }}
      >
        <h2
          style={{
            fontSize: "12px",
            color: "#000",
            fontWeight: "700",
            margin: "0",
          }}
        >
          Characters & Voice Actors
        </h2>
        <span
          style={{
            fontWeight: "normal",
            fontSize: "11px",
            color: "#1c439b",
            height: "16.5px",
            paddingRight: "2px",
          }}
        >
          More characters
        </span>
      </div>
      <div style={{ display: "flex" }}>
        {columns.map((column, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <div
                style={{
                  width: "1px",
                  backgroundColor: "#e5e5e5",
                  margin: "0 8px",
                }}
              />
            )}
            <div style={{ width: "392px" }}>
              <ul
                style={{ listStyleType: "none", paddingLeft: "0", margin: "0" }}
              >
                {column.map(renderEntryItem)}
              </ul>
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

function Characters({ seriesId, currentId, csvUrl }) {
  const { id } = useParams();
  const [relatedEntries, setRelatedEntries] = useState([]);
  const [animeData, setAnimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Função para carregar os dados
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Carrega dados do anime principal
      const baseId = id.replace(/_\w+$/, "");
      const animeCsvUrl = animeMap[baseId]?.[1];
      if (!animeCsvUrl) throw new Error("Base anime data not found");

      const [animeResponse, relatedResponse] = await Promise.all([
        fetch(animeCsvUrl),
        fetch(csvUrl),
      ]);

      const [animeCsvText, relatedCsvText] = await Promise.all([
        animeResponse.text(),
        relatedResponse.text(),
      ]);

      // Processa os dados do anime principal
      Papa.parse(animeCsvText, {
        header: true,
        complete: (results) => {
          const anime = results.data.find((item) => item.mangaId === id);
          if (anime) setAnimeData(anime);
          else throw new Error(`Character with id ${id} not found`);
        },
        error: () => {
          throw new Error("Error parsing anime CSV");
        },
      });

      // Dentro da função loadData, modifique a parte que processa os dados relacionados:
      Papa.parse(relatedCsvText, {
        header: true,
        complete: (results) => {
          // Filtra para remover duplicatas baseado no characterMangaId
          const uniqueEntries = results.data.reduce((acc, entry) => {
            if (
              !acc.some(
                (item) => item.characterMangaId === entry.characterMangaId
              )
            ) {
              acc.push(entry);
            }
            return acc;
          }, []);

          const related = uniqueEntries.map((entry) => ({
            ...entry,
            coverImage: getCharacterSrc(entry.characterMangaId),
            DisplayName: entry.Name,
            Type: entry.Role,
            isManga: true,
          }));

          setRelatedEntries(related);
          setLoading(false);
        },
        error: () => {
          throw new Error("Error parsing related entries CSV");
        },
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [id, currentId, seriesId, csvUrl]);

  // Carrega os dados inicialmente e configura polling
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Atualiza os dados quando lastUpdate muda
  useEffect(() => {
    loadData();
  }, [lastUpdate, loadData]);

  const isManga = animeData.Type2 === "Manga";
  const isAnime = animeData.Type2 === "Anime";

  // Componente de renderização de item
  const renderEntryItem = (entry, index) => (
    <li
      key={`${entry.characterMangaId}-${entry.Name}`}
      style={{
        backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F8F8F8",
        borderBottom: "1px solid #e5e5e5",
        display: "flex",
      }}
    >
      <div style={{ flexShrink: 0, padding: "3px", height: "64px" }}>
        <img
          src={entry.coverImage}
          alt=""
          style={{
            width: "42px",
            height: "62px",
            border: "1px solid #bebebe",
            objectFit: "cover",
          }}
        />
      </div>
      <div style={{ padding: "3px", verticalAlign: "top" }}>
        <Link
          to={``}
          style={{
            color: "#1c439b",
            textDecoration: "none",
            fontSize: "11px",
            lineHeight: "1.5em",
            ":hover": { textDecoration: "underline" },
          }}
        >
          {entry.DisplayName}
        </Link>
        <div
          style={{ display: "flex", alignItems: "center", padding: "3px 0" }}
        >
          <small
            style={{
              color: "#000",
            }}
          >
            {entry.Type}
          </small>
        </div>
      </div>
    </li>
  );

  if (error)
    return (
      <>
        <div
          style={{
            borderColor: "#bebebe",
            borderStyle: "solid",
            borderWidth: "0 0 1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "4px 0 5px",
            padding: "3px 0",
            height: "16.5px",
          }}
        >
          <h2
            style={{
              fontSize: "12px",
              color: "#000",
              fontWeight: "700",
              margin: "0",
            }}
          >
            Characters
          </h2>
          <span
            style={{
              fontWeight: "normal",
              fontSize: "11px",
              color: "#1c439b",
              height: "16.5px",
              paddingRight: "2px",
            }}
          >
            More caracters
          </span>
        </div>
        <span style={{ color: "#000" }}>
          No characters have been added to this title. Help improve our database
          by adding characters <span style={{ color: "#1c439b" }}>here</span>.
        </span>
      </>
    );
  if (relatedEntries.length < 1)
    return (
      <>
        <div
          style={{
            borderColor: "#bebebe",
            borderStyle: "solid",
            borderWidth: "0 0 1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "4px 0 5px",
            padding: "3px 0",
            height: "16.5px",
          }}
        >
          <h2
            style={{
              fontSize: "12px",
              color: "#000",
              fontWeight: "700",
              margin: "0",
            }}
          >
            Characters
          </h2>
          <span
            style={{
              fontWeight: "normal",
              fontSize: "11px",
              color: "#1c439b",
              height: "16.5px",
              paddingRight: "2px",
            }}
          >
            More characters
          </span>
        </div>
        <span style={{ color: "#000" }}>
          No characters have been added to this title. Help improve our database
          by adding characters <span style={{ color: "#1c439b" }}>here</span>.
        </span>
      </>
    );

  // Divide os itens em duas colunas
  const half = Math.ceil(relatedEntries.length / 2);
  const columns = [relatedEntries.slice(0, half), relatedEntries.slice(half)];

  return (
    <>
      <div
        style={{
          borderColor: "#bebebe",
          borderStyle: "solid",
          borderWidth: "0 0 1px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "4px 0 5px",
          padding: "3px 0",
          height: "16.5px",
        }}
      >
        <h2
          style={{
            fontSize: "12px",
            color: "#000",
            fontWeight: "700",
            margin: "0",
          }}
        >
          Characters
        </h2>
        <span
          style={{
            fontWeight: "normal",
            fontSize: "11px",
            color: "#1c439b",
            height: "16.5px",
            paddingRight: "2px",
          }}
        >
          More characters
        </span>
      </div>
      <div style={{ display: "flex" }}>
        {columns.map((column, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <div
                style={{
                  width: "1px",
                  backgroundColor: "#e5e5e5",
                  margin: "0 8px",
                }}
              />
            )}
            <div style={{ width: "392px" }}>
              <ul
                style={{ listStyleType: "none", paddingLeft: "0", margin: "0" }}
              >
                {column.map(renderEntryItem)}
              </ul>
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

function StaffEntries({ seriesId, currentId }) {
  const { id } = useParams();
  const [staffEntries, setStaffEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Obtém a URL do CSV de staff (posição [4] no animeMap)
      const baseId = id.replace(/_\w+$/, "");
      const staffCsvUrl = animeMap[baseId]?.[4];

      if (!staffCsvUrl) {
        setStaffEntries([]);
        setLoading(false);
        return;
      }

      const response = await fetch(staffCsvUrl);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          // Filtra apenas as entradas do anime atual
          const filtered = results.data.filter(
            (entry) =>
              entry.showId === currentId &&
              entry.staffId &&
              entry.staffId !== "-" &&
              entry.Name &&
              entry.Role
          );

          // Remove duplicatas
          const uniqueEntries = filtered.reduce((acc, entry) => {
            if (!acc.some((item) => item.staffId === entry.staffId)) {
              acc.push(entry);
            }
            return acc;
          }, []);

          // Processa os dados
          const staffData = uniqueEntries.map((entry) => ({
            ...entry,
            coverImage: getStaffSrc(entry.staffId),
            DisplayName: entry.Name,
            Type: entry.Role,
          }));

          console.log("Staff data loaded:", staffData);
          setStaffEntries(staffData);
          setLoading(false);
        },
        error: () => {
          throw new Error("Error parsing staff CSV");
        },
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [currentId, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Componente de renderização de item
  const renderEntryItem = (entry, index) => (
    <li
      key={`${entry.staffId}-${index}`}
      style={{
        backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F8F8F8",
        borderBottom: "1px solid #e5e5e5",
        display: "flex",
      }}
    >
      <div style={{ flexShrink: 0, padding: "3px", height: "64px" }}>
        <img
          src={entry.coverImage}
          alt=""
          style={{
            width: "42px",
            height: "62px",
            border: "1px solid #bebebe",
            objectFit: "cover",
          }}
        />
      </div>
      <div style={{ padding: "3px", verticalAlign: "top" }}>
        <Link
          to={``}
          style={{
            color: "#1c439b",
            textDecoration: "none",
            fontSize: "11px",
            lineHeight: "1.5em",
            ":hover": { textDecoration: "underline" },
          }}
        >
          {entry.DisplayName}
        </Link>
        <div
          style={{ display: "flex", alignItems: "center", padding: "3px 0" }}
        >
          <small
            style={{
              color: "#000",
            }}
          >
            {entry.Type}
          </small>
        </div>
      </div>
    </li>
  );

  if (error)
    return (
      <>
        <div
          style={{
            borderColor: "#bebebe",
            borderStyle: "solid",
            borderWidth: "0 0 1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "4px 0 5px",
            padding: "3px 0",
            height: "16.5px",
          }}
        >
          <h2
            style={{
              fontSize: "12px",
              color: "#000",
              fontWeight: "700",
              margin: "0",
            }}
          >
            Staff
          </h2>
          <span
            style={{
              fontWeight: "normal",
              fontSize: "11px",
              color: "#1c439b",
              height: "16.5px",
              paddingRight: "2px",
            }}
          >
            More staff
          </span>
        </div>
        <span style={{ color: "#000" }}>
          No staff has been added to this title. Help improve our database by
          adding staff <span style={{ color: "#1c439b" }}>here</span>.
        </span>
      </>
    );
  if (staffEntries.length < 1)
    return (
      <>
        <div
          style={{
            borderColor: "#bebebe",
            borderStyle: "solid",
            borderWidth: "0 0 1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "4px 0 5px",
            padding: "3px 0",
            height: "16.5px",
          }}
        >
          <h2
            style={{
              fontSize: "12px",
              color: "#000",
              fontWeight: "700",
              margin: "0",
            }}
          >
            Staff
          </h2>
          <span
            style={{
              fontWeight: "normal",
              fontSize: "11px",
              color: "#1c439b",
              height: "16.5px",
              paddingRight: "2px",
            }}
          >
            More staff
          </span>
        </div>
        <span style={{ color: "#000" }}>
          No staff has been added to this title. Help improve our database by
          adding staff <span style={{ color: "#1c439b" }}>here</span>.
        </span>
      </>
    );

  // Divide os itens em duas colunas
  const half = Math.ceil(staffEntries.length / 2);
  const columns = [staffEntries.slice(0, half), staffEntries.slice(half)];

  return (
    <>
      <div
        style={{
          borderColor: "#bebebe",
          borderStyle: "solid",
          borderWidth: "0 0 1px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "4px 0 5px",
          padding: "3px 0",
          height: "16.5px",
        }}
      >
        <h2
          style={{
            fontSize: "12px",
            color: "#000",
            fontWeight: "700",
            margin: "0",
          }}
        >
          Staff
        </h2>
        <span
          style={{
            fontWeight: "normal",
            fontSize: "11px",
            color: "#1c439b",
            height: "16.5px",
            paddingRight: "2px",
          }}
        >
          More staff
        </span>
      </div>
      <div style={{ display: "flex" }}>
        {columns.map((column, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <div
                style={{
                  width: "1px",
                  backgroundColor: "#e5e5e5",
                  margin: "0 8px",
                }}
              />
            )}
            <div style={{ width: "392px" }}>
              <ul
                style={{ listStyleType: "none", paddingLeft: "0", margin: "0" }}
              >
                {column.map(renderEntryItem)}
              </ul>
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

function OpTheme({ seriesId, currentId }) {
  const { id } = useParams();
  const [opEntries, setOpEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Obtém a URL do CSV de staff (posição [4] no animeMap)
      const baseId = id.replace(/_\w+$/, "");
      const opCsvUrl = animeMap[baseId]?.[5];

      if (!opCsvUrl) {
        setOpEntries([]);
        setLoading(false);
        return;
      }

      const response = await fetch(opCsvUrl);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          // Filtra apenas as entradas do anime atual
          const filtered = results.data.filter(
            (entry) =>
              entry.showId === currentId &&
              entry.OPId &&
              entry.Num &&
              entry.Name &&
              entry.Band &&
              entry.Eps
          );

          // Remove duplicatas
          const uniqueEntries = filtered.reduce((acc, entry) => {
            if (!acc.some((item) => item.OPId === entry.OPId)) {
              acc.push(entry);
            }
            return acc;
          }, []);

          // Processa os dados
          const opData = uniqueEntries.map((entry) => ({
            ...entry,
            DisplayName: entry.Name,
            Num: entry.Num,
            Band: entry.Band,
            Eps: entry.Eps,
          }));

          console.log("OP data loaded:", opData);
          setOpEntries(opData);
          setLoading(false);
        },
        error: () => {
          throw new Error("Error parsing op CSV");
        },
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [currentId, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Componente de renderização de item
  const renderEntryItem = (entry, index) => (
    <li
      key={`${entry.OPId}-${index}`}
      style={{
        backgroundColor: "#ffffff",
        display: "flex",
        paddingLeft: "1px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={Play} alt="" style={{ padding: "1px" }} />
      </div>
      <div
        style={{
          padding: "1px",
          display: "flex",
          alignItems: "center",
          width: "322.533px",
        }}
      >
        <span>
          <span style={{ marginRight: "4px" }}>{entry.Num}:</span>
          <Link
            to={``}
            style={{
              color: "#1c439b",
              textDecoration: "none",
              fontSize: "11px",
              lineHeight: "1.5em",
              ":hover": { textDecoration: "underline" },
              marginRight: "4px",
            }}
          >
            "{entry.DisplayName}"
          </Link>
          <span style={{ marginRight: "4px" }}>by {entry.Band}</span>
          <span>(eps {entry.Eps})</span>
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={MV} alt="" />
      </div>
    </li>
  );

  if (error)
    return (
      <>
        <div
          style={{
            borderColor: "#bebebe",
            borderStyle: "solid",
            borderWidth: "0 0 1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "4px 0 5px",
            padding: "3px 0",
            height: "16.5px",
            width: "392px",
          }}
        >
          <h2
            style={{
              fontSize: "12px",
              color: "#000",
              fontWeight: "700",
              margin: "0",
            }}
          >
            Opening Theme
          </h2>
          <span
            style={{
              fontWeight: "normal",
              fontSize: "11px",
              color: "#1c439b",
              height: "16.5px",
              paddingRight: "2px",
            }}
          >
            Edit
          </span>
        </div>
        <span style={{ color: "#000" }}>
          No opening themes have been added to this title. Help improve our
          database by adding an opening theme{" "}
          <span style={{ color: "#1c439b" }}>here</span>.
        </span>
      </>
    );
  if (opEntries.length < 1)
    return (
      <div style={{ width: "392px" }}>
        <div
          style={{
            borderColor: "#bebebe",
            borderStyle: "solid",
            borderWidth: "0 0 1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "4px 0 5px",
            padding: "3px 0",
            height: "16.5px",
          }}
        >
          <h2
            style={{
              fontSize: "12px",
              color: "#000",
              fontWeight: "700",
              margin: "0",
            }}
          >
            Opening Theme
          </h2>
          <span
            style={{
              fontWeight: "normal",
              fontSize: "11px",
              color: "#1c439b",
              height: "16.5px",
              paddingRight: "2px",
            }}
          >
            Edit
          </span>
        </div>
        <span style={{ color: "#000" }}>
          No opening themes have been added to this title. Help improve our
          database by adding an opening theme{" "}
          <span style={{ color: "#1c439b" }}>here</span>.
        </span>
      </div>
    );

  // Divide os itens em duas colunas
  const half = Math.ceil(opEntries.length);
  const columns = [opEntries.slice(0, half), opEntries.slice(half)];

  return (
    <div style={{ width: "392px" }}>
      <div
        style={{
          borderColor: "#bebebe",
          borderStyle: "solid",
          borderWidth: "0 0 1px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "4px 0 5px",
          padding: "3px 0",
          height: "16.5px",
          width: "392px",
        }}
      >
        <h2
          style={{
            fontSize: "12px",
            color: "#000",
            fontWeight: "700",
            margin: "0",
          }}
        >
          Opening Theme
        </h2>
        <span
          style={{
            fontWeight: "normal",
            fontSize: "11px",
            color: "#1c439b",
            height: "16.5px",
            paddingRight: "2px",
          }}
        >
          Edit
        </span>
      </div>
      <div style={{ display: "flex" }}>
        {columns.map((column, index) => (
          <React.Fragment key={index}>
            <div style={{ width: "392px" }}>
              <ul
                style={{ listStyleType: "none", paddingLeft: "0", margin: "0" }}
              >
                {column.map(renderEntryItem)}
              </ul>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function EdTheme({ seriesId, currentId }) {
  const { id } = useParams();
  const [edEntries, setEdEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Obtém a URL do CSV de staff (posição [4] no animeMap)
      const baseId = id.replace(/_\w+$/, "");
      const opCsvUrl = animeMap[baseId]?.[6];

      if (!opCsvUrl) {
        setEdEntries([]);
        setLoading(false);
        return;
      }

      const response = await fetch(opCsvUrl);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          // Filtra apenas as entradas do anime atual
          const filtered = results.data.filter(
            (entry) =>
              entry.showId === currentId &&
              entry.EDId &&
              entry.Num &&
              entry.Name &&
              entry.Band &&
              entry.Eps
          );

          // Remove duplicatas
          const uniqueEntries = filtered.reduce((acc, entry) => {
            if (!acc.some((item) => item.EDId === entry.EDId)) {
              acc.push(entry);
            }
            return acc;
          }, []);

          // Processa os dados
          const edData = uniqueEntries.map((entry) => ({
            ...entry,
            DisplayName: entry.Name,
            Num: entry.Num,
            Band: entry.Band,
            Eps: entry.Eps,
          }));

          console.log("ED data loaded:", edData);
          setEdEntries(edData);
          setLoading(false);
        },
        error: () => {
          throw new Error("Error parsing op CSV");
        },
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [currentId, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Componente de renderização de item
  const renderEntryItem = (entry, index) => (
    <li
      key={`${entry.EDId}-${index}`}
      style={{
        backgroundColor: "#ffffff",
        display: "flex",
        paddingLeft: "1px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={Play} alt="" style={{ padding: "1px" }} />
      </div>
      <div
        style={{
          padding: "1px",
          display: "flex",
          alignItems: "center",
          width: "322.533px",
        }}
      >
        <span>
          <span style={{ marginRight: "4px" }}>{entry.Num}:</span>
          <Link
            to={``}
            style={{
              color: "#1c439b",
              textDecoration: "none",
              fontSize: "11px",
              lineHeight: "1.5em",
              ":hover": { textDecoration: "underline" },
              marginRight: "4px",
            }}
          >
            "{entry.DisplayName}"
          </Link>
          <span style={{ marginRight: "4px" }}>by {entry.Band}</span>
          <span>(eps {entry.Eps})</span>
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={MV} alt="" />
      </div>
    </li>
  );

  if (error)
    return (
      <>
        <div
          style={{
            borderColor: "#bebebe",
            borderStyle: "solid",
            borderWidth: "0 0 1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "4px 0 5px",
            padding: "3px 0",
            height: "16.5px",
            width: "392px",
          }}
        >
          <h2
            style={{
              fontSize: "12px",
              color: "#000",
              fontWeight: "700",
              margin: "0",
            }}
          >
            Ending Theme
          </h2>
          <span
            style={{
              fontWeight: "normal",
              fontSize: "11px",
              color: "#1c439b",
              height: "16.5px",
              paddingRight: "2px",
            }}
          >
            Edit
          </span>
        </div>
        <span style={{ color: "#000" }}>
          No ending themes have been added to this title. Help improve our
          database by adding an ending theme{" "}
          <span style={{ color: "#1c439b" }}>here</span>.
        </span>
      </>
    );
  if (edEntries.length < 1)
    return (
      <div style={{ width: "392px" }}>
        <div
          style={{
            borderColor: "#bebebe",
            borderStyle: "solid",
            borderWidth: "0 0 1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "4px 0 5px",
            padding: "3px 0",
            height: "16.5px",
          }}
        >
          <h2
            style={{
              fontSize: "12px",
              color: "#000",
              fontWeight: "700",
              margin: "0",
            }}
          >
            Ending Theme
          </h2>
          <span
            style={{
              fontWeight: "normal",
              fontSize: "11px",
              color: "#1c439b",
              height: "16.5px",
              paddingRight: "2px",
            }}
          >
            Edit
          </span>
        </div>
        <span style={{ color: "#000" }}>
          No ending themes have been added to this title. Help improve our
          database by adding an ending theme{" "}
          <span style={{ color: "#1c439b" }}>here</span>.
        </span>
      </div>
    );

  // Divide os itens em duas colunas
  const half = Math.ceil(edEntries.length);
  const columns = [edEntries.slice(0, half), edEntries.slice(half)];

  return (
    <div style={{ width: "392px" }}>
      <div
        style={{
          borderColor: "#bebebe",
          borderStyle: "solid",
          borderWidth: "0 0 1px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "4px 0 5px",
          padding: "3px 0",
          height: "16.5px",
          width: "392px",
        }}
      >
        <h2
          style={{
            fontSize: "12px",
            color: "#000",
            fontWeight: "700",
            margin: "0",
          }}
        >
          Ending Theme
        </h2>
        <span
          style={{
            fontWeight: "normal",
            fontSize: "11px",
            color: "#1c439b",
            height: "16.5px",
            paddingRight: "2px",
          }}
        >
          Edit
        </span>
      </div>
      <div style={{ display: "flex" }}>
        {columns.map((column, index) => (
          <React.Fragment key={index}>
            <div style={{ width: "392px" }}>
              <ul
                style={{ listStyleType: "none", paddingLeft: "0", margin: "0" }}
              >
                {column.map(renderEntryItem)}
              </ul>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function MyAnimeList({ match }) {
  const { id } = useParams();
  const [animeData, setAnimeData] = useState(null);
  const [coverImage, setCoverImage] = useState(getDefaultCover());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailerImage, setTrailerSrc] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const baseColor = "#1c439b"; // cor do texto original
  const hoverStyle = {
    backgroundColor: isHovered ? baseColor : "#fff",
    color: isHovered ? "#fff" : baseColor,
    fontFamily: "Avenir, lucida grande, tahoma, verdana, arial, sans-serif",
    fontSize: "12px",
    fontWeight: "400",
    padding: "2px 4px",
    textDecoration: "none",
    height: "14px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  };

  // Load anime data from CSV
  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        setLoading(true);

        // Extrai o ID base (remove o _s2, _s3 etc)
        const baseId = id.replace(/_\w+$/, "");
        const csvUrl = animeMap[baseId]?.[0];

        if (!csvUrl) {
          throw new Error("Base anime data not found");
        }

        const response = await fetch(csvUrl);
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            // Encontra o anime com showId correspondente
            const anime = results.data.find((item) => item.showId === id);

            if (anime) {
              setAnimeData(anime);
              const coverSrc = getShowCoverSrc(id);
              const trailerSrc = getTrailerSrc(id);
              setCoverImage(coverSrc);
              setTrailerSrc(trailerSrc);
            } else {
              throw new Error(`Anime with id ${id} not found in CSV`);
            }
            setLoading(false);
          },
          error: (error) => {
            setError("Error parsing CSV data");
            setLoading(false);
          },
        });
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAnimeData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
        {error}
      </div>
    );
  }

  if (!animeData) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        No data available for this anime
      </div>
    );
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "?";
    return dateString;
  };

  const isManga = animeData.Type2 === "Manga";
  const isAnime = animeData.Type2 === "Anime";

  return (
    <div className="my-anime-list">
      <div
        style={{
          maxWidth: "1060px",
          margin: "0 auto",
          fontFamily: "Verdana, Arial",
        }}
      >
        <header>
          <div>
            <Link to={`/myanimelist/list`}>
              <img
                src={Top}
                alt="My Anime List"
                style={{ marginBottom: "-6px" }}
              />
            </Link>
            <img
              src={Navbar_mal}
              alt="Navbar"
              style={{ marginBottom: "-4px", zIndex: 1, position: "relative" }}
            />
          </div>
        </header>

        <main
          style={{
            backgroundColor: "#fff",
            minHeight: "555px",
            paddingBottom: "30px",
            position: "relative",
          }}
        >
          <div
            style={{
              backgroundColor: "#e1e7f5",
              borderBottomColor: "#1c439b",
              borderRightColor: "#e5e5e5",
              borderLeftColor: "#e5e5e5",
              borderStyle: "solid",
              borderTopColor: "#e5e5e5",
              borderWidth: "1px",
              color: "#000",
              fontFamily: "Verdana, Arial",
              fontWeight: "700",
              margin: "0",
              padding: "5px 9px",
              textAlign: "left",
            }}
          >
            {animeData.TitleJapanese != animeData.TitleEnglish && (
              <div
                style={{
                  display: "table-cell",
                  width: "855px",
                }}
              >
                <h1
                  style={{
                    fontSize: "16px",
                    margin: "0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {animeData.TitleJapanese || animeData.Title}
                </h1>
                <h2
                  style={{
                    fontSize: "14px",
                    margin: "0",
                    height: "17px",
                    display: "flex",
                    alignItems: "center",
                    color: "gray",
                  }}
                >
                  {animeData.TitleEnglish || animeData.Title}
                </h2>
              </div>
            )}
            {animeData.TitleJapanese === animeData.TitleEnglish && (
              <div
                style={{
                  display: "table-cell",
                  width: "855px",
                }}
              >
                <h1
                  style={{
                    fontSize: "16px",
                    margin: "0",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {animeData.TitleEnglish}
                </h1>
              </div>
            )}
          </div>

          <div
            className="content"
            style={{
              backgroundColor: "#fff",
              borderColor: "#e5e5e5",
              borderStyle: "solid",
              borderWidth: "0 1px 1px",
              padding: "5px 10px 10px",
              position: "relative",
            }}
          >
            <table border={0} cellPadding={0} cellSpacing={0} width={"100%"}>
              <tbody>
                <tr>
                  <td
                    style={{
                      borderWidth: "0 1px 0 0",
                      borderColor: "#e5e5e5",
                      borderStyle: "solid",
                      padding: "3px",
                      width: "225px",
                      verticalAlign: "top",
                    }}
                  >
                    <div
                      style={{
                        width: "225px",
                        lineHeight: "1.5em",
                      }}
                    >
                      <div>
                        <img
                          src={coverImage}
                          alt={animeData.Title}
                          width={225}
                          height={350}
                          style={{objectFit: "cover"}}
                        />
                      </div>
                      {animeData.Status === "Not yet aired" && (
                        <img
                          src={NotifyStart}
                          alt=""
                          style={{ marginTop: "4px" }}
                        />
                      )}
                      {isAnime && (
                        <div style={{ paddingTop: "8px" }}>
                          <div
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              borderColor: "#92b0f1",
                              borderStyle: "solid",
                              borderWidth: "0 0 1px",
                              color: "#1c439b",
                              cursor: "pointer",
                              display: "block",
                              textDecoration: "none",
                              fontSize: "11px",
                              height: "16.5px",
                              padding: "2px 3px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                position: "relative",
                                top: "1px",
                              }}
                            >
                              Add to My List
                            </span>
                          </div>
                          <div
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              borderColor: "#92b0f1",
                              borderStyle: "solid",
                              borderWidth: "0 0 1px",
                              color: "#1c439b",
                              cursor: "pointer",
                              display: "block",
                              textDecoration: "none",
                              fontSize: "11px",
                              height: "16.5px",
                              padding: "3px 3px",
                              display: "flex",
                              alignItems: "center",
                              position: "relative",
                              top: "-1px",
                            }}
                          >
                            <span
                              style={{
                                position: "relative",
                                top: "1px",
                              }}
                            >
                              Add to Favorites
                            </span>
                          </div>
                        </div>
                      )}
                      {isManga && (
                        <div style={{ paddingTop: "4px" }}>
                          <div
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              borderColor: "#92b0f1",
                              borderStyle: "solid",
                              borderWidth: "0 0 1px",
                              color: "#1c439b",
                              cursor: "pointer",
                              display: "block",
                              textDecoration: "none",
                              fontSize: "11px",
                              height: "16.5px",
                              padding: "2px 3px",
                              paddingBottom: "3px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                position: "relative",
                                top: "1px",
                              }}
                            >
                              Add to My List
                            </span>
                          </div>
                          <div
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              borderColor: "#92b0f1",
                              borderStyle: "solid",
                              borderWidth: "0 0 1px",
                              color: "#1c439b",
                              cursor: "pointer",
                              display: "block",
                              textDecoration: "none",
                              fontSize: "11px",
                              height: "16.5px",
                              padding: "3px 3px",
                              paddingTop: "2px",
                              display: "flex",
                              alignItems: "center",
                              position: "relative",
                              top: "-1px",
                            }}
                          >
                            <span
                              style={{
                                position: "relative",
                                top: "1px",
                              }}
                            >
                              Add to Favorites
                            </span>
                          </div>
                        </div>
                      )}
                      {isAnime && (
                        <div
                          class="js-sns-icon-container icon-block mt8"
                          style={{
                            marginTop: "17px",
                            marginBottom: "20px",
                          }}
                        >
                          <a
                            data-ga-network="facebook"
                            data-ga-screen="Share Button Location: common"
                            class="js-share-button-popup js-share-button-tracking sprite-icon-social icon-social icon-facebook"
                            target="_blank"
                            style={{
                              backgroundColor: "#fff",
                              border: "#bebebe 1px solid",
                              color: "#5d5d5d",
                              borderRadius: "3px",
                              fontSize: "18px",
                              height: "28px",
                              marginRight: "6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "48px",
                              height: "28px",
                              display: "inline-block",
                              lineHeight: "1.5em",
                            }}
                          >
                            <div
                              class="ga-click"
                              data-ga-click-type="share-facebook"
                              data-ga-click-param=""
                            >
                              <i
                                title="Facebook"
                                class="fa-brands fa-facebook-f"
                                data-ga-click-type="share-facebook"
                                data-ga-click-param=""
                              ></i>
                            </div>
                          </a>
                          <a
                            data-ga-network="twitter"
                            data-ga-screen="Share Button Location: common"
                            class="js-share-button-popup js-share-button-tracking sprite-icon-social icon-social icon-twitter"
                            target="_blank"
                            style={{
                              backgroundColor: "#fff",
                              border: "#bebebe 1px solid",
                              color: "#5d5d5d",
                              borderRadius: "3px",
                              fontSize: "18px",
                              height: "28px",
                              marginRight: "6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "48px",
                              height: "28px",
                              display: "inline-block",
                              lineHeight: "1.5em",
                            }}
                          >
                            <div
                              class="ga-click"
                              data-ga-click-type="share-twitter"
                              data-ga-click-param=""
                            >
                              <i
                                title="Twitter"
                                class="fa-brands fa-twitter"
                                data-ga-click-type="share-twitter"
                                data-ga-click-param=""
                              ></i>
                            </div>
                          </a>
                          <a
                            data-ga-network="reddit"
                            data-ga-screen="Share Button Location: common"
                            class="js-share-button-popup js-share-button-tracking sprite-icon-social icon-social icon-reddit"
                            target="_blank"
                            style={{
                              backgroundColor: "#fff",
                              border: "#bebebe 1px solid",
                              color: "#5d5d5d",
                              borderRadius: "3px",
                              fontSize: "18px",
                              height: "28px",
                              marginRight: "6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "48px",
                              height: "28px",
                              display: "inline-block",
                              lineHeight: "1.5em",
                            }}
                          >
                            <div
                              class="ga-click"
                              data-ga-click-type="share-reddit"
                              data-ga-click-param=""
                            >
                              <i
                                title="Reddit"
                                class="fa-brands fa-reddit-alien"
                                data-ga-click-type="share-reddit"
                                data-ga-click-param=""
                              ></i>
                            </div>
                          </a>
                          <a
                            data-ga-network="tumblr"
                            data-ga-screen="Share Button Location: common"
                            class="js-share-button-popup js-share-button-tracking sprite-icon-social icon-social icon-tumblr"
                            target="_blank"
                            style={{
                              backgroundColor: "#fff",
                              border: "#bebebe 1px solid",
                              color: "#5d5d5d",
                              borderRadius: "3px",
                              fontSize: "18px",
                              height: "28px",
                              marginRight: "6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "48px",
                              height: "28px",
                              display: "inline-block",
                              lineHeight: "1.5em",
                            }}
                          >
                            <div
                              class="ga-click"
                              data-ga-click-type="share-tumblr"
                              data-ga-click-param=""
                            >
                              <i
                                title="Tumblr"
                                class="fa-brands fa-tumblr"
                                data-ga-click-type="share-tumblr"
                                data-ga-click-param=""
                              ></i>
                            </div>
                          </a>
                        </div>
                      )}
                      {isManga && (
                        <div
                          class="js-sns-icon-container icon-block mt8"
                          style={{
                            marginTop: "9px",
                            marginBottom: "20px",
                          }}
                        >
                          <a
                            data-ga-network="facebook"
                            data-ga-screen="Share Button Location: common"
                            class="js-share-button-popup js-share-button-tracking sprite-icon-social icon-social icon-facebook"
                            target="_blank"
                            style={{
                              backgroundColor: "#fff",
                              border: "#bebebe 1px solid",
                              color: "#5d5d5d",
                              borderRadius: "3px",
                              fontSize: "18px",
                              height: "28px",
                              marginRight: "6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "48px",
                              height: "28px",
                              display: "inline-block",
                              lineHeight: "1.5em",
                            }}
                          >
                            <div
                              class="ga-click"
                              data-ga-click-type="share-facebook"
                              data-ga-click-param=""
                            >
                              <i
                                title="Facebook"
                                class="fa-brands fa-facebook-f"
                                data-ga-click-type="share-facebook"
                                data-ga-click-param=""
                              ></i>
                            </div>
                          </a>
                          <a
                            data-ga-network="twitter"
                            data-ga-screen="Share Button Location: common"
                            class="js-share-button-popup js-share-button-tracking sprite-icon-social icon-social icon-twitter"
                            target="_blank"
                            style={{
                              backgroundColor: "#fff",
                              border: "#bebebe 1px solid",
                              color: "#5d5d5d",
                              borderRadius: "3px",
                              fontSize: "18px",
                              height: "28px",
                              marginRight: "6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "48px",
                              height: "28px",
                              display: "inline-block",
                              lineHeight: "1.5em",
                            }}
                          >
                            <div
                              class="ga-click"
                              data-ga-click-type="share-twitter"
                              data-ga-click-param=""
                            >
                              <i
                                title="Twitter"
                                class="fa-brands fa-twitter"
                                data-ga-click-type="share-twitter"
                                data-ga-click-param=""
                              ></i>
                            </div>
                          </a>
                          <a
                            data-ga-network="reddit"
                            data-ga-screen="Share Button Location: common"
                            class="js-share-button-popup js-share-button-tracking sprite-icon-social icon-social icon-reddit"
                            target="_blank"
                            style={{
                              backgroundColor: "#fff",
                              border: "#bebebe 1px solid",
                              color: "#5d5d5d",
                              borderRadius: "3px",
                              fontSize: "18px",
                              height: "28px",
                              marginRight: "6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "48px",
                              height: "28px",
                              display: "inline-block",
                              lineHeight: "1.5em",
                            }}
                          >
                            <div
                              class="ga-click"
                              data-ga-click-type="share-reddit"
                              data-ga-click-param=""
                            >
                              <i
                                title="Reddit"
                                class="fa-brands fa-reddit-alien"
                                data-ga-click-type="share-reddit"
                                data-ga-click-param=""
                              ></i>
                            </div>
                          </a>
                          <a
                            data-ga-network="tumblr"
                            data-ga-screen="Share Button Location: common"
                            class="js-share-button-popup js-share-button-tracking sprite-icon-social icon-social icon-tumblr"
                            target="_blank"
                            style={{
                              backgroundColor: "#fff",
                              border: "#bebebe 1px solid",
                              color: "#5d5d5d",
                              borderRadius: "3px",
                              fontSize: "18px",
                              height: "28px",
                              marginRight: "6px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "48px",
                              height: "28px",
                              display: "inline-block",
                              lineHeight: "1.5em",
                            }}
                          >
                            <div
                              class="ga-click"
                              data-ga-click-type="share-tumblr"
                              data-ga-click-param=""
                            >
                              <i
                                title="Tumblr"
                                class="fa-brands fa-tumblr"
                                data-ga-click-type="share-tumblr"
                                data-ga-click-param=""
                              ></i>
                            </div>
                          </a>
                        </div>
                      )}

                      <h2
                        style={{
                          borderColor: "#bebebe",
                          borderStyle: "solid",
                          borderWidth: "0 0 1px",
                          color: "#000",
                          fontSize: "12px",
                          fontWeight: "700",
                          margin: "4px 0 5px",
                          padding: "3px 0",
                          height: "16.5px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Alternative Titles
                      </h2>
                      {animeData.Synonyms != "-" && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                            position: "relative",
                            top: "1px",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Synonyms:{" "}
                          </span>
                          {animeData.Synonyms || "N/A"}
                        </div>
                      )}

                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Japanese:{" "}
                        </span>
                        {animeData.TitleJapanese2 || "N/A"}
                      </div>
                      <br style={{ fontSize: "11px", lineHeight: "1.5em" }} />
                      <h2
                        style={{
                          borderColor: "#bebebe",
                          borderStyle: "solid",
                          borderWidth: "0 0 1px",
                          color: "#000",
                          fontSize: "12px",
                          fontWeight: "700",
                          margin: "4px 0 5px",
                          padding: "3px 0",
                          height: "16.5px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Information
                      </h2>
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Type:{" "}
                        </span>
                        <span
                          style={{
                            color:
                              animeData.Type != "Unknown" ? "#1c439b" : "#000",
                          }}
                        >
                          {animeData.Type || "N/A"}
                        </span>
                      </div>
                      {isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Episodes:{" "}
                          </span>
                          {animeData.Episodes || "N/A"}
                        </div>
                      )}
                      {isManga && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Volumes:{" "}
                          </span>
                          {animeData.Volumes || "N/A"}
                        </div>
                      )}
                      {isManga && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Chapters:{" "}
                          </span>
                          {animeData.Chapters || "N/A"}
                        </div>
                      )}
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Status:{" "}
                        </span>
                        {animeData.Status || "N/A"}
                      </div>
                      {isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Aired:{" "}
                          </span>
                          {animeData.BeginningDate != "?" && (
                            <>
                              {formatDate(animeData.BeginningDate)} to{" "}
                              {formatDate(animeData.EndingDate)}
                            </>
                          )}
                          {animeData.BeginningDate === "?" && (
                            <span>Not available</span>
                          )}
                        </div>
                      )}
                      {isManga && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Published:{" "}
                          </span>
                          {formatDate(animeData.BeginningDate)} to{" "}
                          {formatDate(animeData.EndingDate)}
                        </div>
                      )}
                      {animeData.Premiered != "Unknown" && isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Premiered:{" "}
                          </span>
                          <span style={{ color: "#1c439b" }}>
                            {animeData.Premiered || "N/A"}
                          </span>
                        </div>
                      )}
                      {animeData.Premiered != "Unknown" && isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Broadcast:{" "}
                          </span>
                          {animeData.Broadcast || "N/A"}
                        </div>
                      )}
                      {isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Producers:{" "}
                          </span>
                          <span style={{ color: "#1c439b" }}>
                            {animeData.Producers || "N/A"}
                          </span>
                        </div>
                      )}
                      {isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Licensors:{" "}
                          </span>
                          {animeData.BeginningDate != "?" && (
                            <span style={{ color: "#1c439b" }}>
                              {animeData.Licensors || "N/A"}
                            </span>
                          )}
                          {animeData.BeginningDate === "?" && (
                            <>
                              <span>
                                None found,{" "}
                                <span style={{ color: "#1c439b" }}>
                                  add some
                                </span>
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      {isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Studios:{" "}
                          </span>
                          <span style={{ color: "#1c439b" }}>
                            {animeData.Studios || "N/A"}
                          </span>
                        </div>
                      )}
                      {isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Source:{" "}
                          </span>
                          {animeData.Source != "Original" && (
                            <span style={{ color: "#1c439b" }}>
                              {animeData.Source || "N/A"}
                            </span>
                          )}
                          {animeData.Source === "Original" && (
                            <span>Original</span>
                          )}
                        </div>
                      )}
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Genres:{" "}
                        </span>
                        <span style={{ color: "#1c439b" }}>
                          {animeData.Genres || "N/A"}
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Themes:{" "}
                        </span>
                        <span style={{ color: "#1c439b" }}>
                          {animeData.Themes || "N/A"}
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Demographic:{" "}
                        </span>
                        <span style={{ color: "#1c439b" }}>
                          {animeData.Demographic || "N/A"}
                        </span>
                      </div>
                      {isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Duration:{" "}
                          </span>
                          {animeData.BeginningDate != "?" && (
                            <>{animeData.Duration || "N/A"}</>
                          )}
                          {animeData.BeginningDate === "?" && <>Unknown</>}
                        </div>
                      )}
                      {isAnime && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Rating:{" "}
                          </span>
                          {animeData.Rating || "N/A"}
                        </div>
                      )}
                      {isManga && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Serialization:{" "}
                          </span>
                          <span style={{ color: "#1c439b" }}>
                            {animeData.Studios || "N/A"}
                          </span>
                        </div>
                      )}
                      {isManga && (
                        <div
                          style={{
                            padding: "3px 0",
                            fontSize: "11px",
                            lineHeight: "1.5em",
                          }}
                        >
                          <span style={{ color: "#444", fontWeight: "700" }}>
                            Authors:{" "}
                          </span>
                          <span style={{ color: "#1c439b" }}>
                            {animeData.Author || "N/A"}
                          </span>{" "}
                          (Story & Art)
                        </div>
                      )}
                      <br style={{ fontSize: "11px", lineHeight: "1.5em" }} />
                      <h2
                        style={{
                          borderColor: "#bebebe",
                          borderStyle: "solid",
                          borderWidth: "0 0 1px",
                          color: "#000",
                          fontSize: "12px",
                          fontWeight: "700",
                          margin: "4px 0 5px",
                          padding: "3px 0",
                          height: "16.5px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Statistics
                      </h2>
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Score:{" "}
                        </span>
                        {animeData.Score || "N/A"} (scored by{" "}
                        {animeData.UserVotes || "N/A"} users)
                      </div>
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Ranked:
                        </span>{" "}
                        {animeData.Ranked || "N/A"}
                      </div>
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Popularity:
                        </span>{" "}
                        {animeData.Popularity || "N/A"}
                      </div>
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Members:
                        </span>{" "}
                        {animeData.Members || "N/A"}
                      </div>
                      <div
                        style={{
                          padding: "3px 0",
                          fontSize: "11px",
                          lineHeight: "1.5em",
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: "700" }}>
                          Favorites:{" "}
                        </span>
                        {animeData.Favorites || "N/A"}
                      </div>
                      <br style={{ fontSize: "11px", lineHeight: "1.5em" }} />
                      {/* Other sections remain the same */}
                    </div>
                  </td>
                  <td
                    style={{
                      paddingLeft: "5px",
                      fontSize: "11px",
                      lineHeight: "1.5em",
                      maxWidth: "801px",
                      verticalAlign: "baseline",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          margin: "0 auto",
                        }}
                      >
                        {isManga && (
                          <div
                            className="horizontal-nav"
                            style={{
                              margin: "5px 0 10px 0",
                              borderColor: "#1c439b",
                              borderStyle: "solid",
                              borderWidth: "0 0 1px",
                              padding: "0 0 2px",
                              lineHeight: "1.5em",
                              height: "18px",
                            }}
                          >
                            <ul
                              style={{
                                marginRight: "0",
                                paddingRight: "0",
                                paddingLeft: "0",
                                marginTop: "0",
                                marginLeft: "0",
                                fontFamily: "arial,helvetica,sans-serif",
                                lineHeight: "1.5em",
                                listStyleType: "none",
                                display: "flex",
                                position: "relative",
                                top: "-1px",
                                alignItems: "center",
                                width: "639.217px",
                                justifyContent: "space-between",
                              }}
                            >
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#fff",
                                  backgroundColor: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Details
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Characters
                              </li>
                              <Link to={`/manga/${animeData.showId}/stats`}>
                                <li
                                  style={hoverStyle}
                                  onMouseEnter={() => setIsHovered(true)}
                                  onMouseLeave={() => setIsHovered(false)}
                                >
                                  Stats
                                </li>
                              </Link>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Reviews
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Recommendations
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Interest Stacks
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                News
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Forum
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Clubs
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Pictures
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                More Info
                              </li>
                            </ul>
                          </div>
                        )}
                        {isAnime && (
                          <div
                            className="horizontal-nav"
                            style={{
                              margin: "5px 0 10px 0",
                              borderColor: "#1c439b",
                              borderStyle: "solid",
                              borderWidth: "0 0 1px",
                              padding: "0 0 2px",
                              lineHeight: "1.5em",
                              height: "18px",
                            }}
                          >
                            <ul
                              style={{
                                marginRight: "0",
                                paddingRight: "0",
                                paddingLeft: "0",
                                marginTop: "0",
                                marginLeft: "0",
                                fontFamily: "arial,helvetica,sans-serif",
                                lineHeight: "1.5em",
                                listStyleType: "none",
                                display: "flex",
                                position: "relative",
                                top: "-1px",
                                alignItems: "center",
                                width: "782.483px",
                                justifyContent: "space-between",
                              }}
                            >
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#fff",
                                  backgroundColor: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Details
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Characters & Staff
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Episodes
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Videos
                              </li>
                              <Link to={`/anime/${animeData.showId}/stats`}>
                                <li
                                  style={hoverStyle}
                                  onMouseEnter={() => setIsHovered(true)}
                                  onMouseLeave={() => setIsHovered(false)}
                                >
                                  Stats
                                </li>
                              </Link>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Reviews
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Recommendations
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Interest Stacks
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                News
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Forum
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Clubs
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                Pictures
                              </li>
                              <li
                                style={{
                                  backgroundColor: "#fff",
                                  color: "#1c439b",
                                  fontFamily:
                                    "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                  fontSize: "12px",
                                  fontWeight: "400",
                                  padding: "2px 4px",
                                  textDecoration: "none",
                                  height: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                More Info
                              </li>
                            </ul>
                          </div>
                        )}
                        <div
                          className="breadcrumb"
                          style={{
                            fontFamily:
                              "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                            fontSize: "12px",
                            margin: 0,
                            padding: 0,
                            paddingBottom: "2px",
                            lineHeight: "1.5em",
                            display: "flex",
                            alignContent: "center",
                          }}
                        >
                          <div>
                            <span
                              style={{
                                margin: 0,
                                padding: 0,
                                color: "#1c439b",
                              }}
                            >
                              Top
                            </span>
                          </div>
                          <span
                            style={{
                              width: "23.7px",
                              margin: "0",
                              padding: "0",
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            &#62;
                          </span>
                          <div
                            style={{
                              margin: 0,
                              padding: 0,
                              color: "#1c439b",
                            }}
                          >
                            <span>{animeData.Type2}</span>
                          </div>
                          <span
                            style={{
                              width: "23.7px",
                              margin: "0",
                              padding: "0",
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            &#62;
                          </span>
                          <div
                            style={{
                              margin: 0,
                              padding: 0,
                              color: "#1c439b",
                            }}
                          >
                            <span>
                              {animeData.TitleJapanese || animeData.Title}
                            </span>
                          </div>
                        </div>
                        <table border={0} cellPadding={0} width={"100%"}>
                          <tbody>
                            <tr>
                              <td>
                                <div
                                  style={{
                                    paddingBottom: "8px",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "100%",
                                      display: "table",
                                      marginTop: "12px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "table-cell",
                                        verticalAlign: "top",
                                      }}
                                    >
                                      <div style={{ display: "flex" }}>
                                        <div
                                          style={{
                                            position: "relative",
                                            left: "-4px",
                                            top: "-4px",
                                          }}
                                        >
                                          {isAnime && (
                                            <div
                                              style={{
                                                content: "",
                                                display: "flex",
                                                height: "68px",
                                                backgroundColor: "#f8f8f8",
                                                border: "#e5e5e5 1px solid",
                                                borderRadius: "1px",
                                                padding: "8px 10px",
                                                alignItems: "center",
                                                width: "563px",
                                              }}
                                            >
                                              <div style={{ display: "block" }}>
                                                <div
                                                  style={{
                                                    width: "60px",
                                                    height: "14px",
                                                    backgroundColor: "#2e51a2",
                                                    color: "#fff",
                                                    fontSize: "10px",
                                                    fontWeight: "400",
                                                    borderRadius: "2px",
                                                    textAlign: "center",
                                                    lineHeight: "1.0em",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    whiteSpace: "nowrap",
                                                    fontFamily:
                                                      "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                    position: "relative",
                                                    top: "-7px",
                                                  }}
                                                >
                                                  SCORE
                                                </div>
                                                <div
                                                  style={{
                                                    color: "#323232",
                                                    fontFamily:
                                                      "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                    fontSize: "24px",
                                                    fontWeight: "700",
                                                    textAlign: "center",
                                                    position: "relative",
                                                    top: "2px",
                                                  }}
                                                >
                                                  {animeData.Score || "N/A"}
                                                </div>
                                                <div
                                                  style={{
                                                    textAlign: "center",
                                                    fontSize: "10px",
                                                    position: "relative",
                                                    whiteSpace: "nowrap",
                                                    display: "block",
                                                    width: "60px",
                                                    lineHeight: "1.0em",
                                                    fontFamily:
                                                      "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                    top: "8px",
                                                  }}
                                                >
                                                  {animeData.UserVotes || "N/A"}{" "}
                                                  users
                                                </div>
                                              </div>

                                              <div
                                                style={{
                                                  backgroundColor: "#d8d8d8",
                                                  boxShadow: "#fff 1px 0 1px 0",
                                                  content: "",
                                                  display: "block",
                                                  height: "60px",
                                                  width: "1px",
                                                  marginLeft: "18px",
                                                  marginRight: "13px",
                                                }}
                                              ></div>

                                              <div
                                                style={{
                                                  height: "60px",
                                                  display: "grid",
                                                  alignContent: "end",
                                                  position: "absolute",
                                                  left: "103px",
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    height: "19px",
                                                    paddingTop: "8px",
                                                    marginBottom: "20px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                  }}
                                                >
                                                  <span
                                                    style={{
                                                      fontSize: "16px",
                                                      fontFamily:
                                                        "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                      marginRight: "24px",
                                                      whiteSpace: "nowrap",
                                                      lineHeight: "1.5em",
                                                    }}
                                                  >
                                                    Ranked{" "}
                                                    <strong>
                                                      {animeData.Ranked ||
                                                        "N/A"}
                                                    </strong>
                                                  </span>
                                                  <span
                                                    style={{
                                                      fontSize: "16px",
                                                      fontFamily:
                                                        "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                      marginRight: "24px",
                                                      whiteSpace: "nowrap",
                                                      lineHeight: "1.5em",
                                                    }}
                                                  >
                                                    Popularity{" "}
                                                    <strong>
                                                      {animeData.Popularity ||
                                                        "N/A"}
                                                    </strong>
                                                  </span>
                                                  <span
                                                    style={{
                                                      fontSize: "16px",
                                                      fontFamily:
                                                        "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                      marginRight: "24px",
                                                      whiteSpace: "nowrap",
                                                      lineHeight: "1.5em",
                                                    }}
                                                  >
                                                    Members{" "}
                                                    <strong>
                                                      {animeData.Members ||
                                                        "N/A"}
                                                    </strong>
                                                  </span>
                                                </div>
                                                <div
                                                  style={{
                                                    height: "15px",
                                                    paddingLeft: "3px",
                                                  }}
                                                >
                                                  {animeData.Premiered !=
                                                    "Unknown" && (
                                                    <span
                                                      style={{
                                                        borderRight:
                                                          "#bebebe 1px solid",
                                                        color: "#1c439b",
                                                        fontFamily:
                                                          "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                        fontSize: "10px",
                                                        marginRight: "12px",
                                                        paddingRight: "12px",
                                                      }}
                                                    >
                                                      {animeData.Premiered ||
                                                        "N/A"}
                                                    </span>
                                                  )}
                                                  <span
                                                    style={{
                                                      borderRight:
                                                        "#bebebe 1px solid",
                                                      color:
                                                        animeData.Type !=
                                                        "Unknown"
                                                          ? "#1c439b"
                                                          : "#444",
                                                      fontFamily:
                                                        "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                      fontSize: "10px",
                                                      marginRight: "12px",
                                                      paddingRight: "12px",
                                                    }}
                                                  >
                                                    {animeData.Type}
                                                  </span>
                                                  <span
                                                    style={{
                                                      color: "#1c439b",
                                                      fontFamily:
                                                        "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                      fontSize: "10px",
                                                      marginRight: "12px",
                                                      paddingRight: "12px",
                                                    }}
                                                  >
                                                    {animeData.Studios || "N/A"}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                          {isManga && (
                                            <div
                                              style={{
                                                content: "",
                                                display: "flex",
                                                height: "68px",
                                                backgroundColor: "#f8f8f8",
                                                border: "#e5e5e5 1px solid",
                                                borderRadius: "1px",
                                                padding: "8px 10px",
                                                alignItems: "center",
                                                width: "508px",
                                              }}
                                            >
                                              <div style={{ display: "block" }}>
                                                <div
                                                  style={{
                                                    width: "60px",
                                                    height: "14px",
                                                    backgroundColor: "#2e51a2",
                                                    color: "#fff",
                                                    fontSize: "10px",
                                                    fontWeight: "400",
                                                    borderRadius: "2px",
                                                    textAlign: "center",
                                                    lineHeight: "1.0em",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    whiteSpace: "nowrap",
                                                    fontFamily:
                                                      "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                    position: "relative",
                                                    top: "-7px",
                                                  }}
                                                >
                                                  SCORE
                                                </div>
                                                <div
                                                  style={{
                                                    color: "#323232",
                                                    fontFamily:
                                                      "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                    fontSize: "24px",
                                                    fontWeight: "700",
                                                    textAlign: "center",
                                                    position: "relative",
                                                    top: "2px",
                                                  }}
                                                >
                                                  {animeData.Score || "N/A"}
                                                </div>
                                                <div
                                                  style={{
                                                    textAlign: "center",
                                                    fontSize: "10px",
                                                    position: "relative",
                                                    whiteSpace: "nowrap",
                                                    display: "block",
                                                    width: "60px",
                                                    lineHeight: "1.0em",
                                                    fontFamily:
                                                      "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                    top: "8px",
                                                  }}
                                                >
                                                  {animeData.UserVotes || "N/A"}{" "}
                                                  users
                                                </div>
                                              </div>

                                              <div
                                                style={{
                                                  backgroundColor: "#d8d8d8",
                                                  boxShadow: "#fff 1px 0 1px 0",
                                                  content: "",
                                                  display: "block",
                                                  height: "60px",
                                                  width: "1px",
                                                  marginLeft: "18px",
                                                  marginRight: "13px",
                                                }}
                                              ></div>

                                              <div
                                                style={{
                                                  height: "60px",
                                                  display: "grid",
                                                  alignContent: "end",
                                                  position: "absolute",
                                                  left: "103px",
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    height: "19px",
                                                    paddingTop: "8px",
                                                    marginBottom: "20px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                  }}
                                                >
                                                  <span
                                                    style={{
                                                      fontSize: "16px",
                                                      fontFamily:
                                                        "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                      marginRight: "24px",
                                                      whiteSpace: "nowrap",
                                                      lineHeight: "1.5em",
                                                    }}
                                                  >
                                                    Ranked{" "}
                                                    <strong>
                                                      {animeData.Ranked ||
                                                        "N/A"}
                                                    </strong>
                                                  </span>
                                                  <span
                                                    style={{
                                                      fontSize: "16px",
                                                      fontFamily:
                                                        "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                      marginRight: "24px",
                                                      whiteSpace: "nowrap",
                                                      lineHeight: "1.5em",
                                                    }}
                                                  >
                                                    Popularity{" "}
                                                    <strong>
                                                      {animeData.Popularity ||
                                                        "N/A"}
                                                    </strong>
                                                  </span>
                                                  <span
                                                    style={{
                                                      fontSize: "16px",
                                                      fontFamily:
                                                        "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                      marginRight: "24px",
                                                      whiteSpace: "nowrap",
                                                      lineHeight: "1.5em",
                                                    }}
                                                  >
                                                    Members{" "}
                                                    <strong>
                                                      {animeData.Members ||
                                                        "N/A"}
                                                    </strong>
                                                  </span>
                                                </div>
                                                <div
                                                  style={{
                                                    height: "15px",
                                                    paddingLeft: "3px",
                                                    display: "flex",
                                                  }}
                                                >
                                                  <span
                                                    style={{
                                                      borderRight:
                                                        "#bebebe 1px solid",
                                                      color: "#1c439b",
                                                      fontFamily:
                                                        "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                      fontSize: "10px",
                                                      marginRight: "12px",
                                                      paddingRight: "12px",
                                                    }}
                                                  >
                                                    {animeData.Type || "N/A"}
                                                  </span>
                                                  <span
                                                    style={{
                                                      borderRight:
                                                        "#bebebe 1px solid",
                                                      color: "#1c439b",
                                                      fontFamily:
                                                        "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                      fontSize: "10px",
                                                      marginRight: "12px",
                                                      paddingRight: "12px",
                                                    }}
                                                  >
                                                    {animeData.Studios || "N/A"}
                                                  </span>
                                                  <div
                                                    style={{
                                                      marginRight: "12px",
                                                      paddingRight: "12px",
                                                      fontFamily:
                                                        "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                      display: "flex",
                                                    }}
                                                  >
                                                    <span
                                                      style={{
                                                        color: "#1c439b",

                                                        fontSize: "10px",
                                                        marginRight: "3px",
                                                      }}
                                                    >
                                                      {animeData.Author ||
                                                        "N/A"}
                                                    </span>
                                                    <span
                                                      style={{
                                                        fontSize: "10px",
                                                      }}
                                                    >
                                                      (Story & Art)
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                          {isAnime && (
                                            <img
                                              src={RatingBar}
                                              alt=""
                                              style={{ marginTop: "8px" }}
                                            />
                                          )}
                                          {isManga && (
                                            <img
                                              src={RatingBarManga}
                                              alt=""
                                              style={{ marginTop: "8px" }}
                                            />
                                          )}
                                        </div>
                                        {isAnime && (
                                          <div
                                            style={{
                                              paddingLeft: "12px",
                                              position: "relative",
                                              display: "inline-block",
                                              top: "-4px",
                                            }}
                                          >
                                            <div
                                              style={{ position: "relative" }}
                                            >
                                              <img
                                                src={trailerImage}
                                                alt="Trailer"
                                                width={200}
                                                height={133}
                                                style={{
                                                  backgroundColor: "#000",
                                                  objectFit: "cover",
                                                  display: "block",
                                                }}
                                              />
                                              {/* Overlay com gradiente e botão play */}
                                              <div
                                                style={{
                                                  position: "absolute",
                                                  top: 0,
                                                  left: 0,
                                                  right: 0,
                                                  bottom: 0,
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                  cursor: "pointer",
                                                  background:
                                                    "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%)", // Estado inicial
                                                  transition:
                                                    "background 2s ease-in-out", // Transição mais rápida (300ms)
                                                }}
                                                onMouseOver={(e) => {
                                                  e.currentTarget.style.background =
                                                    "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%)";
                                                }}
                                                onMouseOut={(e) => {
                                                  e.currentTarget.style.background =
                                                    "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%)";
                                                }}
                                              >
                                                {/* Botão Play */}
                                                <img
                                                  src={BtnStremPlay}
                                                  alt=""
                                                  style={{
                                                    height: "25px",
                                                    position: "relative",
                                                    top: "-2px",
                                                  }}
                                                />
                                                <div
                                                  style={{
                                                    width: "100%",
                                                    background:
                                                      "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.8) 10%, transparent 100% )",
                                                    position: "absolute",
                                                    bottom: "0px",
                                                    height: "19.5px",
                                                    padding: "8px 0 4px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                  }}
                                                >
                                                  {/* Nome do Trailer */}
                                                  {animeData.NameTrailer && (
                                                    <span
                                                      style={{
                                                        color: "white",
                                                        fontSize: "13px",
                                                        textShadow:
                                                          "rgba(0,0,0,.8) 1px 1px 0",
                                                        paddingLeft: "4px",
                                                        paddingRight: "4px",
                                                        fontFamily:
                                                          "Avenir,lucida grande,tahoma,verdana,arial,sans-serif",
                                                      }}
                                                    >
                                                      {animeData.NameTrailer}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                            <span
                                              style={{
                                                float: "right",
                                                color: "#1c439b",
                                                fontSize: "11px",
                                                marginTop: "4px",
                                              }}
                                            >
                                              More videos
                                            </span>
                                          </div>
                                        )}
                                        {isManga && (
                                          <div
                                            style={{
                                              paddingLeft: "0px",
                                              position: "relative",
                                              display: "inline-block",
                                              top: "-4px",
                                              marginBottom: "8px",
                                            }}
                                          >
                                            <div
                                              style={{
                                                position: "relative",
                                                width: "253.383px",
                                                border: "#e5e5e5 1px solid",
                                                padding: "6px",
                                                height: "121px",
                                                display: "flex",
                                              }}
                                            >
                                              <img
                                                src={coverImage}
                                                alt="Trailer"
                                                style={{
                                                  backgroundColor: "#000",
                                                  objectFit: "cover",
                                                  display: "block",
                                                  width: "85px",
                                                  height: "120px",
                                                }}
                                              />
                                              <div
                                                style={{
                                                  position: "relative",
                                                  left: "8px",
                                                  width: "160px",
                                                }}
                                              >
                                                <img
                                                  src={ReadMangaMirai}
                                                  alt=""
                                                />
                                                <div
                                                  style={{
                                                    borderBottom:
                                                      "#787878 1px solid",
                                                    position: "relative",
                                                    top: "-3px",
                                                  }}
                                                />
                                                <div
                                                  style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                  }}
                                                >
                                                  <span
                                                    style={{
                                                      color: "#1c439b",
                                                      fontWeight: "700",
                                                      fontSize: "11px",
                                                      position: "relative",
                                                      top: "1px",
                                                    }}
                                                  >
                                                    {animeData.TitleEnglish}
                                                  </span>
                                                  {animeData.Volumes !=
                                                    "Unknown" && (
                                                    <span
                                                      style={{
                                                        color: "#1c439b",
                                                      }}
                                                    >
                                                      {animeData.VolumeSale}
                                                    </span>
                                                  )}
                                                  <span
                                                    style={{
                                                      lineHeight: "1.5em",
                                                      color: "#c0392b",
                                                      position: "absolute",
                                                      top: "55px",
                                                    }}
                                                  >
                                                    {animeData.VolumePrice}
                                                  </span>
                                                </div>
                                                <img
                                                  src={ReadSample}
                                                  alt=""
                                                  style={{
                                                    position: "absolute",
                                                    top: "75px",
                                                    right: "0px",
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <div
                          style={{
                            borderColor: "#bebebe",
                            borderStyle: "solid",
                            borderWidth: "0 0 1px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "4px 0 5px",
                            padding: "3px 0",
                            height: "16.5px",
                          }}
                        >
                          <h2
                            style={{
                              fontSize: "12px",
                              color: "#000",
                              fontWeight: "700",
                              margin: "0",
                            }}
                          >
                            Synopsis
                          </h2>
                          <span
                            style={{
                              fontWeight: "normal",
                              fontSize: "11px",
                              color: "#1c439b",
                              height: "16.5px",
                              paddingRight: "2px",
                            }}
                          >
                            Edit
                          </span>
                        </div>
                        {animeData.Synopsis != "-" && (
                          <>
                            <div style={{ marginTop: 0, fontSize: "11px" }}>
                              {animeData.Synopsis?.split("\n").map(
                                (paragraph, index) => (
                                  <p
                                    key={index}
                                    style={{
                                      color: "#000",
                                      lineHeight: "1.5em",
                                      margin: "0 0 16.5px 0",
                                    }}
                                  >
                                    {paragraph}
                                  </p>
                                )
                              )}
                            </div>
                            <span style={{ color: "#000" }}>
                              [Written by MAL Rewrite]
                            </span>
                          </>
                        )}
                        {animeData.Synopsis === "-" && (
                          <>
                            <div style={{ marginTop: 0, fontSize: "11px" }}>
                              {animeData.SeasonName} of{" "}
                              <i>{animeData.SeriesName}.</i>
                            </div>
                          </>
                        )}
                        <div style={{ marginBottom: "15px" }} />
                        {animeData.Status != "Not yet aired" &&
                          animeData.Background != "-" && (
                            <>
                              <div
                                style={{
                                  borderColor: "#bebebe",
                                  borderStyle: "solid",
                                  borderWidth: "0 0 1px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  margin: "4px 0 5px",
                                  padding: "3px 0",
                                  height: "16.5px",
                                }}
                              >
                                <h2
                                  style={{
                                    fontSize: "12px",
                                    color: "#000",
                                    fontWeight: "700",
                                    margin: "0",
                                  }}
                                >
                                  Background
                                </h2>
                                <span
                                  style={{
                                    fontWeight: "normal",
                                    fontSize: "11px",
                                    color: "#1c439b",
                                    height: "16.5px",
                                    paddingRight: "2px",
                                  }}
                                >
                                  Edit
                                </span>
                              </div>
                              <i>{animeData.TitleJapanese}</i>{" "}
                              {animeData.Background}
                            </>
                          )}
                        <div style={{ marginBottom: "28px" }} />

                        <div style={{ fontSize: "11px", lineHeight: "1.5em" }}>
                          {animeData.Series &&
                          animeMap[animeData.Series]?.[0] ? (
                            <RelatedEntries
                              seriesId={animeData.Series}
                              currentId={id}
                              csvUrl={animeMap[animeData.Series][0]}
                            />
                          ) : (
                            ""
                          )}
                        </div>
                        <div style={{ marginBottom: "28px" }} />
                        <div
                          style={{
                            borderColor: "#bebebe",
                            borderStyle: "solid",
                            borderWidth: "0 0 1px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "4px 0 5px",
                            padding: "3px 0",
                            height: "16.5px",
                          }}
                        >
                          <h2
                            style={{
                              fontSize: "12px",
                              color: "#000",
                              fontWeight: "700",
                              margin: "0",
                            }}
                          >
                            MALxJapan -More than just anime-
                          </h2>
                          <span
                            style={{
                              fontWeight: "normal",
                              fontSize: "11px",
                              color: "#1c439b",
                              height: "16.5px",
                              paddingRight: "2px",
                            }}
                          >
                            Visit MALxJapan
                          </span>
                        </div>
                        <img src={MalxJapan} alt="" />
                        <div style={{ marginBottom: "24px" }} />
                        {isAnime && (
                          <div
                            style={{ fontSize: "11px", lineHeight: "1.5em" }}
                          >
                            {animeData.Series &&
                            animeMap[animeData.Series]?.[0] ? (
                              <CharactersVoiceActorsEntries
                                seriesId={animeData.Series}
                                currentId={id}
                                csvUrl={animeMap[animeData.Series][1]}
                              />
                            ) : (
<>
        <div
          style={{
            borderColor: "#bebebe",
            borderStyle: "solid",
            borderWidth: "0 0 1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "4px 0 5px",
            padding: "3px 0",
            height: "16.5px",
          }}
        >
          <h2
            style={{
              fontSize: "12px",
              color: "#000",
              fontWeight: "700",
              margin: "0",
            }}
          >
            Characters & Voice Actors
          </h2>
          <span
            style={{
              fontWeight: "normal",
              fontSize: "11px",
              color: "#1c439b",
              height: "16.5px",
              paddingRight: "2px",
            }}
          >
            More characters
          </span>
        </div>
        <span style={{ color: "#000" }}>
          No characters and voice actors have been added to this title. Help
          improve our database by adding characters or voice actors{" "}
          <span style={{ color: "#1c439b" }}>here</span>.
        </span>
      </>
                            )}
                          </div>
                        )}
                        {isManga && (
                          <div
                            style={{ fontSize: "11px", lineHeight: "1.5em" }}
                          >
                            {animeData.Series &&
                            animeMap[animeData.Series]?.[0] ? (
                              <Characters
                                seriesId={animeData.Series}
                                currentId={id}
                                csvUrl={animeMap[animeData.Series][1]}
                              />
                            ) : (
                              <>
        <div
          style={{
            borderColor: "#bebebe",
            borderStyle: "solid",
            borderWidth: "0 0 1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "4px 0 5px",
            padding: "3px 0",
            height: "16.5px",
          }}
        >
          <h2
            style={{
              fontSize: "12px",
              color: "#000",
              fontWeight: "700",
              margin: "0",
            }}
          >
            Characters
          </h2>
          <span
            style={{
              fontWeight: "normal",
              fontSize: "11px",
              color: "#1c439b",
              height: "16.5px",
              paddingRight: "2px",
            }}
          >
            More characters
          </span>
        </div>
        <span style={{ color: "#000" }}>
          No characters have been added to this title. Help
          improve our database by adding characters{" "}
          <span style={{ color: "#1c439b" }}>here</span>.
        </span>
      </>
                            )}
                          </div>
                        )}
                        <div style={{ marginBottom: "20px" }} />
                        {isAnime && (
                          <div
                            style={{ fontSize: "11px", lineHeight: "1.5em" }}
                          >
                            {animeData.Series &&
                            animeMap[animeData.Series]?.[0] ? (
                              <StaffEntries
                                seriesId={animeData.Series}
                                currentId={id}
                                csvUrl={animeMap[animeData.Series][3]}
                              />
                            ) : (
                              <>
        <div
          style={{
            borderColor: "#bebebe",
            borderStyle: "solid",
            borderWidth: "0 0 1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "4px 0 5px",
            padding: "3px 0",
            height: "16.5px",
          }}
        >
          <h2
            style={{
              fontSize: "12px",
              color: "#000",
              fontWeight: "700",
              margin: "0",
            }}
          >
            Staff
          </h2>
          <span
            style={{
              fontWeight: "normal",
              fontSize: "11px",
              color: "#1c439b",
              height: "16.5px",
              paddingRight: "2px",
            }}
          >
            More staff
          </span>
        </div>
        <span style={{ color: "#000" }}>
          No staff has been added to this title. Help
          improve our database by adding staff{" "}
          <span style={{ color: "#1c439b" }}>here</span>.
        </span>
      </>
                            )}
                          </div>
                        )}
                        <div style={{ marginBottom: "32px" }} />
                        {isAnime && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{ fontSize: "11px", lineHeight: "1.5em" }}
                            >
                              {animeData.Series &&
                              animeMap[animeData.Series]?.[0] ? (
                                <OpTheme
                                  seriesId={animeData.Series}
                                  currentId={id}
                                  csvUrl={animeMap[animeData.Series][5]}
                                />
                              ) : (
                                <>
        <div
          style={{
            borderColor: "#bebebe",
            borderStyle: "solid",
            borderWidth: "0 0 1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "4px 0 5px",
            padding: "3px 0",
            height: "16.5px",
            width: "392px",
          }}
        >
          <h2
            style={{
              fontSize: "12px",
              color: "#000",
              fontWeight: "700",
              margin: "0",
            }}
          >
            Opening Theme
          </h2>
          <span
            style={{
              fontWeight: "normal",
              fontSize: "11px",
              color: "#1c439b",
              height: "16.5px",
              paddingRight: "2px",
            }}
          >
            Edit
          </span>
        </div>
        <span style={{ color: "#000" }}>
          No opening themes have been added to this title. Help improve our
          database by adding an opening theme{" "}
          <span style={{ color: "#1c439b" }}>here</span>.
        </span>
      </>
                              )}
                            </div>
                            <div
                              style={{ fontSize: "11px", lineHeight: "1.5em" }}
                            >
                              {animeData.Series &&
                              animeMap[animeData.Series]?.[0] ? (
                                <EdTheme
                                  seriesId={animeData.Series}
                                  currentId={id}
                                  csvUrl={animeMap[animeData.Series][6]}
                                />
                              ) : (
                                <>
        <div
          style={{
            borderColor: "#bebebe",
            borderStyle: "solid",
            borderWidth: "0 0 1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "4px 0 5px",
            padding: "3px 0",
            height: "16.5px",
            width: "392px",
          }}
        >
          <h2
            style={{
              fontSize: "12px",
              color: "#000",
              fontWeight: "700",
              margin: "0",
            }}
          >
            Ending Theme
          </h2>
          <span
            style={{
              fontWeight: "normal",
              fontSize: "11px",
              color: "#1c439b",
              height: "16.5px",
              paddingRight: "2px",
            }}
          >
            Edit
          </span>
        </div>
        <span style={{ color: "#000" }}>
          No ending themes have been added to this title. Help improve our
          database by adding an ending theme{" "}
          <span style={{ color: "#1c439b" }}>here</span>.
        </span>
      </>
                              )}
                            </div>
                          </div>
                        )}
                        <div style={{ marginBottom: "72px" }} />
                        <h2
                          style={{
                            borderColor: "#bebebe",
                            borderStyle: "solid",
                            borderWidth: "0 0 1px",
                            color: "#000",
                            fontSize: "12px",
                            fontWeight: "700",
                            margin: "4px 0 5px",
                            padding: "3px 0",
                          }}
                        >
                          Reviews
                        </h2>
                        <div
                          style={{
                            display: "flex",
                            backgroundColor: "#f6f6f6",
                            padding: ".5rem 10px",
                            justifyContent: "space-between",
                            paddingBottom: "0px",
                            marginTop: "1px",
                          }}
                        >
                          <div style={{ color: "#1c439b" }}>
                            <i class="fa-regular fa-square-plus"></i>
                            <span> Write review</span>
                          </div>
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <div style={{ display: "flex" }}>
                              <div
                                style={{ color: "#26448f", margin: "0 8px" }}
                              >
                                <i class="fas fa-star">
                                  <span
                                    style={{
                                      fontFamily: "Verdana, Arial",
                                      fontWeight: "normal",
                                    }}
                                  >
                                    <strong> {animeData.Recommended}</strong>{" "}
                                    Recommended
                                  </span>
                                </i>
                              </div>
                              <div
                                style={{ color: "#787878", margin: "0 8px" }}
                              >
                                <i class="fas fa-star-half-stroke">
                                  <span
                                    style={{
                                      fontFamily: "Verdana, Arial",
                                      fontWeight: "normal",
                                    }}
                                  >
                                    <strong> {animeData.MixedFeelings}</strong>{" "}
                                    Mixed Feelings
                                  </span>
                                </i>
                              </div>
                              <div
                                style={{ color: "#a12f31", margin: "0 8px" }}
                              >
                                <i class="far fa-star">
                                  <span
                                    style={{
                                      fontFamily: "Verdana, Arial",
                                      fontWeight: "normal",
                                    }}
                                  >
                                    <strong> {animeData.NotRecommended}</strong>{" "}
                                    Not Recommended
                                  </span>
                                </i>
                              </div>
                            </div>
                            {/* Barra de progresso corrigida */}
                            <div
                              style={{
                                display: "flex",
                                height: "6px",
                                width: "100%",
                                overflow: "hidden",
                                marginTop: "2px",
                              }}
                            >
                              <div
                                style={{
                                  backgroundColor: "#26448f",
                                  width: `${Math.max(
                                    (animeData.Recommended /
                                      animeData.Reviews) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                              <div
                                style={{
                                  backgroundColor: "#787878",
                                  width: `${Math.max(
                                    (animeData.MixedFeelings /
                                      animeData.Reviews) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                              <div
                                style={{
                                  backgroundColor: "#a12f31",
                                  width: `${Math.max(
                                    (animeData.NotRecommended /
                                      animeData.Reviews) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <div style={{ color: "#1c439b" }}>
                            <i class="fa-solid fa-angle-right"></i>
                            <span>
                              {" "}
                              All reviews (<strong>{animeData.Reviews}</strong>)
                            </span>
                          </div>
                        </div>
                        {animeData.Reviews > 0 && (
                        <img
                          src={Reviews}
                          alt=""
                          style={{ marginTop: "7px" }}
                        />
                        )}
                        {animeData.Reviews < 1 && (
                          <span style={{position:"relative", top:"8px", marginBottom:"8px"}}>No reviews have been submitted for this title. Be the first to make a review <span style={{color:"#1c439b", cursor:"pointer"}}>here</span>!</span>
                        )}
                        <div style={{ marginBottom: "28px" }} />
                        <div
                          style={{
                            borderColor: "#bebebe",
                            borderStyle: "solid",
                            borderWidth: "0 0 1px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "4px 0 5px",
                            padding: "3px 0",
                            height: "16.5px",
                          }}
                        >
                          <h2
                            style={{
                              fontSize: "12px",
                              color: "#000",
                              fontWeight: "700",
                              margin: "0",
                            }}
                          >
                            Interest Stacks
                          </h2>
                          <span
                            style={{
                              fontWeight: "normal",
                              fontSize: "11px",
                              color: "#1c439b",
                              height: "16.5px",
                              paddingRight: "2px",
                            }}
                          >
                            More stacks
                          </span>
                        </div>
                        <img src={InterestStacks} alt="" />
                        <div style={{ marginBottom: "11px" }} />
                        {isAnime &&(<>
                        <div
                          style={{
                            borderColor: "#bebebe",
                            borderStyle: "solid",
                            borderWidth: "0 0 1px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "4px 0 5px",
                            padding: "3px 0",
                            height: "16.5px",
                          }}
                        >
                          <h2
                            style={{
                              fontSize: "12px",
                              color: "#000",
                              fontWeight: "700",
                              margin: "0",
                            }}
                          >
                            Recommendations
                          </h2>
                          <span
                            style={{
                              fontWeight: "normal",
                              fontSize: "11px",
                              color: "#1c439b",
                              height: "16.5px",
                              paddingRight: "2px",
                            }}
                          >
                            More recommendations
                          </span>
                        </div>
                        <img src={Recomendations} alt="" />
                        </>)}
                        <div style={{ marginBottom: "15px" }} />
                        {isManga &&(<>
                        <div
                          style={{
                            borderColor: "#bebebe",
                            borderStyle: "solid",
                            borderWidth: "0 0 1px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "4px 0 5px",
                            padding: "3px 0",
                            height: "16.5px",
                          }}
                        >
                          <h2
                            style={{
                              fontSize: "12px",
                              color: "#000",
                              fontWeight: "700",
                              margin: "0",
                            }}
                          >
                            Recommendations
                          </h2>
                          <span
                            style={{
                              fontWeight: "normal",
                              fontSize: "11px",
                              color: "#1c439b",
                              height: "16.5px",
                              paddingRight: "2px",
                            }}
                          >
                            More recommendations
                          </span>
                        </div>
                        <img src={RecomendationsManga} alt="" />
                        </>)}
                        <div style={{ marginBottom: "15px" }} />
                        <div
                          style={{
                            borderColor: "#bebebe",
                            borderStyle: "solid",
                            borderWidth: "0 0 1px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "4px 0 5px",
                            padding: "3px 0",
                            height: "16.5px",
                          }}
                        >
                          <h2
                            style={{
                              fontSize: "12px",
                              color: "#000",
                              fontWeight: "700",
                              margin: "0",
                            }}
                          >
                            Recent News
                          </h2>
                          <span
                            style={{
                              fontWeight: "normal",
                              fontSize: "11px",
                              color: "#1c439b",
                              height: "16.5px",
                              paddingRight: "2px",
                            }}
                          >
                            More news
                          </span>
                        </div>
                        <img src={RecentNews} alt="" />
                        <div style={{ marginBottom: "15px" }} />
                        <div
                          style={{
                            borderColor: "#bebebe",
                            borderStyle: "solid",
                            borderWidth: "0 0 1px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "4px 0 5px",
                            padding: "3px 0",
                            height: "16.5px",
                          }}
                        >
                          <h2
                            style={{
                              fontSize: "12px",
                              color: "#000",
                              fontWeight: "700",
                              margin: "0",
                            }}
                          >
                            Recent Forum Discussion
                          </h2>
                          <span
                            style={{
                              fontWeight: "normal",
                              fontSize: "11px",
                              color: "#1c439b",
                              height: "16.5px",
                              paddingRight: "2px",
                            }}
                          >
                            More discussions
                          </span>
                        </div>
                        <img src={Discussions} alt="" />
                        <div style={{ marginBottom: "15px" }} />
                        <div
                          style={{
                            borderColor: "#bebebe",
                            borderStyle: "solid",
                            borderWidth: "0 0 1px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "4px 0 5px",
                            padding: "3px 0",
                            height: "16.5px",
                          }}
                        >
                          <h2
                            style={{
                              fontSize: "12px",
                              color: "#000",
                              fontWeight: "700",
                              margin: "0",
                            }}
                          >
                            Recent Featured Articles
                          </h2>
                          <span
                            style={{
                              fontWeight: "normal",
                              fontSize: "11px",
                              color: "#1c439b",
                              height: "16.5px",
                              paddingRight: "2px",
                            }}
                          >
                            More features articles
                          </span>
                        </div>
                        <img src={RecentArticles} alt="" />
                        <div style={{ marginBottom: "100px" }} />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <footer>
        <img
          src={Footer1}
          alt="Footer 1"
          className="footer-image"
          style={{ marginBottom: "-5px" }}
        />
        <img
          src={Footer2}
          alt="Footer 2"
          className="footer-image"
          style={{ marginBottom: "-6px" }}
        />
      </footer>
    </div>
  );
}

export default MyAnimeList;
