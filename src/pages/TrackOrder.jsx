import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { supabase } from "../supabaseClient";

const mitraIcon = new L.Icon({
  iconUrl: "/mitra.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

export default function TrackOrder() {
  const { id } = useParams(); // id order
  const [order, setOrder] = useState(null);
  const [mitra, setMitra] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setOrder(data);

      // Ambil data mitra
      const m = await supabase
        .from("mitra")
        .select("*")
        .eq("id", data.mitra_id)
        .single();

      setMitra(m.data);
    }

    setLoading(false);
  };

  // 🔄 Listener realtime posisi mitra
  const listenMitra = () => {
    supabase
      .channel("mitra-location")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mitra",
          filter: `id=eq.${order.mitra_id}`,
        },
        (payload) => {
          setMitra(payload.new); // update titik MITRA
        }
      )
      .subscribe();
  };

  useEffect(() => {
    loadOrder();
  }, []);

  useEffect(() => {
    if (order) listenMitra();
  }, [order]);

  if (loading) return <div className="p-5">Memuat...</div>;
  if (!order) return <div className="p-5">Order tidak ditemukan</div>;

  return (
    <div className="w-full h-screen">
      <h1 className="p-3 text-xl font-bold text-blue-600">Lacak Mitra</h1>

      <MapContainer
        center={[mitra.lat, mitra.lng]}
        zoom={15}
        style={{ height: "90vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={[mitra.lat, mitra.lng]} icon={mitraIcon}>
          <Popup>Mitra sedang menuju lokasi Anda</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
