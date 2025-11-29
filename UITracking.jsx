// Contoh di page TrackOrder.jsx
import { subscribeOrderStatus } from "@/lib/realtimeCustomer";

useEffect(() => {
  const sub = subscribeOrderStatus(orderId, (data) => {
    setOrder(data);
    // Tampilkan notif sederhana
    alert("Status order berubah → " + data.status);
  });
  return () => supabase.removeChannel(sub);
}, [orderId]);
