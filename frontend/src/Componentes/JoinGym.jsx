import React, { useState } from "react";
import { gymService } from "../api/gymService";
import "./JoinGym.css";

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);

const AcademyIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" /><path d="M3 10h18" /><path d="M5 21V10" /><path d="M19 21V10" /><path d="M9 21V10" /><path d="M15 21V10" /><path d="m2 10 10-7 10 7" />
  </svg>
);

const JoinGym = ({ onJoined }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;

    setLoading(true);
    setError("");
    try {
      const data = await gymService.searchGyms(searchTerm);
      setGyms(data || []);
      if (data.length === 0) {
        setError("Nenhuma unidade encontrada com este identificador.");
      }
    } catch (err) {
      setError("Ocorreu um erro na busca. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (gymIdOrCode) => {
    try {
      const response = await gymService.joinGym(gymIdOrCode);
      if (onJoined) onJoined(response.user?.gymId || gymIdOrCode);
      window.dispatchEvent(new Event("userDataUpdated"));
    } catch (err) {
      setError(err.response?.data?.message || "Nao foi possivel vincular a unidade.");
    }
  };

  return (
    <div className="join-gym-container fade-in">
      <div className="join-gym-card">
        <header className="join-header-v3">
          <div className="header-icon-v3">
            <AcademyIcon />
          </div>
          <h2>Vincular Unidade</h2>
          <p>Insira o identificador ou codigo de convite para acessar os recursos da sua academia</p>
        </header>

        <form onSubmit={handleSearch} className="search-box-v3">
          <div className="input-wrapper-v3">
            <SearchIcon />
            <input
              type="text"
              placeholder="Ex: GYM-1234..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-search-v3" disabled={loading}>
            {loading ? <div className="loader-mini" /> : "BUSCAR"}
          </button>
        </form>

        {error && <div className="search-error-v3">{error}</div>}

        <div className="gym-results-v3">
          {gyms.map((gym) => (
            <div key={gym.id} className="gym-result-item glass">
              <div className="gym-result-info">
                <h3>{gym.name}</h3>
                <p>{gym.address || "Endereco institucional"}</p>
                <span className="gym-id-badge">ID: {gym.inviteCode}</span>
              </div>
              <button onClick={() => handleJoin(gym.id)} className="btn-join-v3">
                VINCULAR AGORA
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JoinGym;
