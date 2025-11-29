// src/modules/gpsTrackerCustomer.js
// berubah menjadi util GPS berbasis geolocation browser,
// tanpa Firebase

export async function getCustomerLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject("Geolocation tidak tersedia");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        reject("Gagal mengambil lokasi: " + err.message);
      }
    );
  });
}
