import React from "react";

export default function TrackOrder() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Melacak Pesanan</h1>

      <div style={styles.card}>
        <p style={styles.text}>Fitur pelacakan sedang dalam pengembangan.</p>
        <p style={styles.textSmall}>
          Nantinya akan tampil peta real-time seperti Gojek & Grab.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
  },
  card: {
    background: "#f5f5f5",
    padding: "20px",
    borderRadius: "12px",
  },
  text: {
    fontSize: "18px",
  },
  textSmall: {
    opacity: 0.6,
    marginTop: "5px",
  },
};
