import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { supabase } from "../lib/supabaseClient"; // ✔ perbaikan import

// ICON MITRA
const mitraIcon = new L.Icon({
  iconUrl: "/mitra.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

export default function TrackOrder() {
  const { id } = useParams(); // ID order
  const [order, setOrder] = useState(null);
  const [mitra, setMitra] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil data order + data mitra
  const loadOrder = async () => {
    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (orderData) {
      setOrder(orderData);

      const { data: mitraData } = await supabase
        .from("mitra")
        .select("*")
        .eq("id", orderData.mitra_id)
        .single();

      setMitra(mitraData);
    }

    setLoading(false);
  };

  // Listener realtime posisi MITRA
  const listenMitra = () => {
    if (!order) return;

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
          setMitra(payload.new); // update realtime
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

  // Loading
  if (loading) return <div className="p-5">Memuat...</div>;
  if (!order) return <div className="p-5">Order tidak ditemukan</div>;

  // Mitra belum mengaktifkan GPS
  if (!mitra || !mitra.lat || !mitra.lng) {
    return (
      <div className="p-5">
        <h2 className="text-xl font-semibold text-blue-600">Lacak Mitra</h2>
        <p className="mt-3 text-gray-600">
          Menunggu mitra mengaktifkan GPS...
        </p>
      </div>
    );
  }

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
