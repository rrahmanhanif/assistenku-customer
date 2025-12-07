export default defineConfig({
  plugins: [react()],
  server: { port: 5174 }
})
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },

  build: {
    rollupOptions: {
      external: ["firebase", "firebase/app", "firebase/auth"]
    }
  }
});
