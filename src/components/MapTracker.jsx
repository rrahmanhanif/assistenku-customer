import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapTracker({ mitraPosition }) {
  useEffect(() => {
    // Inisialisasi map
    const map = L.map("mitraMap").setView([0, 0], 13);

    // Pakai tile openstreetmap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Marker MITRA
    const mitraMarker = L.marker([0, 0]).addTo(map);

    // Update marker realtime
    if (mitraPosition) {
      map.setView([mitraPosition.lat, mitraPosition.lng], 15);
      mitraMarker.setLatLng([mitraPosition.lat, mitraPosition.lng]);
    }

    return () => {
      map.remove();
    };
  }, [mitraPosition]);

  return (
    <div
      id="mitraMap"
      style={{
        width: "100%",
        height: "300px",
        borderRadius: "12px",
        marginTop: "10px",
      }}
    />
  );
}
