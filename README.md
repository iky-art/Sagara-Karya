# Sagara Karya
1. `cp .env.example .env` lalu isi 3 nilainya.
2. Supabase: jalankan `supabase/schema.sql` di SQL Editor; buat 1 user admin di Authentication > Users; matikan "Allow new users to sign up".
2c. Jalankan `supabase/update-subscribers.sql` (langganan email).
2b. Jalankan juga `supabase/update-promo-cek.sql` (promo + cek pesanan), lalu `supabase/update-voucher-broadcast.sql` (voucher + broadcast).
3. `npm install && npm run dev`. Admin: `/<VITE_ADMIN_UUID>/admin`.
4. Deploy (Cloudflare Pages): set 3 env var yang sama. `public/_redirects` sudah ada.
- PWA: aplikasi terbuka di `/app` (tampilan khusus aplikasi). Terpasang di layar utama, tampilan ini otomatis dipakai. Pratinjau di browser: buka `/app`. Service worker hanya aktif di build produksi (`npm run build`).
- Rilis dari admin: jalankan `supabase/update-releases.sql`, lalu terbitkan versi di Admin > Rilis setelah deploy Cloudflare Success.
- Versi: MAJOR.MINOR dari `package.json`, PATCH naik otomatis tiap build (jumlah commit). Setiap rilis fitur: naikkan MINOR di package.json dan tambah entri di `src/changelog.js`. Aplikasi mengecek `/version.json` dan menawarkan/memuat pembaruan sendiri.
- Isi `CONTACT_WA` dan `CONTACT_EMAIL` di `src/data.js` (salah satu atau keduanya; jika keduanya terisi, tombol Konsultasi menampilkan pilihan WhatsApp/Gmail); ganti `https://sagarakarya.example` di index.html, robots.txt, sitemap.xml.

