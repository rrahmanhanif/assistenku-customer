# Environment setup

Copy `supabase.env` to `.env.local` (or export the variables) before running the app:

VITE_SUPABASE_URL= 'https://nssfojyjcnwscyoqmpvt.supabase.co'
VITE_SUPABASE_ANON_KEY= 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zc2ZvanlqY253c2N5b3FtcHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMDY5MTAsImV4cCI6MjA3Nzg4MjkxMH0.dPARgL9wcJO3dJZHgp7FDbqFqaKTnpfZG_m0L5drUmU'
VITE_API_BASE_URL= 'https://nssfojyjcnwscyoqmpvt.supabase.co'

`VITE_API_BASE_URL` points to the Admin/Core API gateway (defaults to same origin). The API client automatically forwards `x-customer-id` and the Supabase access token from localStorage.

Run the dev server:
npm install
npm run dev
