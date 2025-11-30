import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MapTracker from "../components/MapTracker";
import { subscribeMitraLocation } from "../lib/realtimeMitra";

export default function TrackOrder() {
  const { orderId } = useParams();
  const [mitraPos, setMitraPos] = useState(null);

  useEffect(() => {
    // Subscribe realtime GPS MITRA
    const channel = subscribeMitraLocation(orderId, (pos) => {
      setMitraPos(pos);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [orderId]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Tracking Pesanan #{orderId}</h2>

      {!mitraPos && <p>Menunggu lokasi mitra...</p>}

      {mitraPos && (
        <div>
          <MapTracker mitraPosition={mitraPos} />

          <p style={{ marginTop: 10 }}>
            <strong>Lokasi Terakhir Mitra:</strong>  
            <br />
            Lat: {mitraPos.lat}
            <br />
            Lng: {mitraPos.lng}
            <br />
            Waktu: {new Date(mitraPos.time).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
