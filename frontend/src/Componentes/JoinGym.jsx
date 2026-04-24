import React, { useState } from "react";
import { gymService } from "../api/gymService";
import "./JoinGym.css";

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
      setGyms(data);
      if (data.length === 0) {
        setError("Nenhuma academia encontrada.");
      }
    } catch (err) {
      setError("Erro ao buscar academias.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (gymIdOrCode) => {
    try {
      const response = await gymService.joinGym(gymIdOrCode);
      
      alert(response.message || "Você entrou na academia com sucesso!");
      if (onJoined) onJoined(response.user?.gymId || gymIdOrCode);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Erro ao entrar na academia");
    }
  };

  return (
    <div className="join-gym-container">
      <div className="join-gym-card">
        <h2>🏢 Encontre sua Academia</h2>
        <p>Insira o <strong>Identificador</strong> ou <strong>Código de Convite</strong></p>

        <form onSubmit={handleSearch} className="search-box">
          <input
            type="text"
            placeholder="Ex: ABC123..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "..." : "Buscar"}
          </button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        <div className="gym-results">
          {gyms.map((gym) => (
            <div key={gym.id} className="gym-item">
              <div className="gym-info">
                <h3>{gym.name}</h3>
                <p>{gym.address || "Endereço não informado"}</p>
                <span className="gym-code-tag">ID: {gym.inviteCode}</span>
              </div>
              <button onClick={() => handleJoin(gym.id)} className="join-btn">
                Entrar na Academia
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JoinGym;
