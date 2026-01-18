# API Integration

## Base URL

Customer app menggunakan endpoint terpusat melalui variabel lingkungan:

VITE_API_BASE_URL=https://api.assistenku.com

csharp
Salin kode

Nilai default ada di `src/services/http/baseUrl.ts` dan contoh konfigurasi ada di `.env.example`.

## HTTP Client

Semua request HTTP harus menggunakan helper di `src/services/http/httpClient.ts` bersama daftar path di `src/services/http/endpoints.ts`.

Contoh:

```ts
import { endpoints } from "./services/http/endpoints";
import { httpClient } from "./services/http/httpClient";

const data = await httpClient.get(endpoints.auth.whoami);
Helper ini otomatis menambahkan:

Authorization: Bearer <customer_token> (dari localStorage)

x-customer-id (dari localStorage)

Content-Type: application/json

Jika response gagal, helper melempar HttpError dengan status dan details.

Endpoint utama
auth.whoami → identitas customer yang sedang login.

client.invoicesList → daftar invoice customer.

Halaman Home memanggil kedua endpoint ini setelah login untuk menampilkan role/ID dan invoice terbaru. Jika endpoint gagal, UI menampilkan pesan:

nginx
Salin kode
FEATURE NOT READY: <detail error>
Catatan
Jangan menambah folder api/ di root repo.

Semua request HTTP baru wajib memakai httpClient + endpoints.
