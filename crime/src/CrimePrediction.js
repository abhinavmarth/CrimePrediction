import React, { useState, useMemo, useEffect } from "react";
import regions from "./Regions"; 
import RegionDropdown from "./RegionsDropdown"; 
import "./CrimePrediction.css";

const CrimePrediction = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [mapUrl, setMapUrl] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // NEW: Loading indicator

  // Memoize region options
  const regionOptions = useMemo(
    () => regions.map(region => ({ value: region, label: region })), 
    []
  );

  // Fetch crime map from backend when a region is selected
  useEffect(() => {
    if (!selectedRegion) return;

    setError(null);
    setMapUrl("");
    setLoading(true);

    const fetchMap = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5001/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ region: selectedRegion.value }),
        });

        const data = await response.json();
        if (response.ok) {
          setMapUrl(data.map_url);
        } else {
          setError(data.error || "Something went wrong");
        }
      } catch (err) {
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchMap();
  }, [selectedRegion]);

  // Opens map in a new tab
  const openFullScreenMap = () => {
    if (mapUrl) {
      const newWindow = window.open(mapUrl, "_blank", "fullscreen=yes");
      if (newWindow) {
        newWindow.focus();
      } else {
        setError("Popup blocked! Please allow popups in your browser.");
      }
    }
  };

  return (
    <div className="container">
      <h2>Crime Prediction</h2>

      <label>Select Region:</label>
      <RegionDropdown 
        options={regionOptions} 
        onChange={(selectedOption) => setSelectedRegion(selectedOption)}
      />

      {selectedRegion && (
        <>
          <p>You selected: <strong>{selectedRegion.label}</strong></p>

          {loading && <p>Loading map...</p>}
          {error && <p className="error">{error}</p>}

          {mapUrl && !loading && (
            <button 
              className="view-map-btn" 
              onClick={openFullScreenMap}
            >
              View Fullscreen Crime Map
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CrimePrediction;
