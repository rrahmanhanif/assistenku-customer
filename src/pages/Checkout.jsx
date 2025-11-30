import { useState } from "react";
import { supabase } from "../modules/supabaseClient";
import { calculateFees } from "../modules/calculateFee";

export default function Checkout({ layanan, harga }) {
  const [loading, setLoading] = useState(false);
  const customerId = localStorage.getItem("customer_id");

  const buatOrder = async () => {
    setLoading(true);

    const fees = calculateFees(harga);

    const { data, error } = await supabase.from("orders").insert([
      {
        customer_id: customerId,
        mitra_id: null,   // nanti dipilih admin/otomatis
        amount: fees.amount,
        platform_fee: fees.feePlatform,
        mitra_receive: fees.mitraReceive,
        status: "waiting_payment",
      }
    ]).select().single();

    setLoading(false);

    if (error) {
      alert("Gagal membuat order!");
      console.log(error);
      return;
    }

    alert("Order berhasil dibuat. Lanjut pembayaran.");
    window.location.href = `/pay/${data.id}`;
  };

  return (
    <button
      disabled={loading}
      onClick={buatOrder}
      className="btn"
    >
      {loading ? "Memproses..." : `Pesan - Rp ${harga}`}
    </button>
  );
}
