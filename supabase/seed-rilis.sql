-- Isi awal untuk rilis: 1 promo, 3 voucher, 3 broadcast.
-- Jalankan di SQL Editor Supabase SETELAH schema.sql, update-promo-cek.sql, dan update-voucher-broadcast.sql.
-- Ubah angka sesuai keputusanmu sebelum dijalankan. Aman diulang (tidak membuat data ganda).

-- Promo otomatis: 15% semua paket selama 14 hari sejak dijalankan
insert into public.promos (name, kind, value, packages, ends_at)
select 'Promo Rilis', 'persen', 15, '{}', now() + interval '14 days'
where not exists (select 1 from public.promos where name = 'Promo Rilis');

-- Voucher (kartu muncul otomatis di halaman utama), berlaku 30 hari
insert into public.vouchers (code, title, description, kind, value, packages, quota, ends_at) values
 ('RILIS10', 'Voucher Rilis', E'Potongan Rp10.000 untuk pesananmu.\nBerlaku untuk semua paket. Satu voucher untuk satu nomor WhatsApp atau Gmail.', 'nominal', 10000, '{}', 50, now() + interval '30 days'),
 ('PELAJAR', 'Voucher Pelajar', E'Potongan 10% khusus pelajar dan mahasiswa.\nBerlaku untuk paket Basic dan Standard.', 'persen', 10, '{Basic,Standard}', 30, now() + interval '30 days'),
 ('CUSTOM50', 'Voucher Custom', E'Potongan Rp50.000 untuk paket Custom.\nFitur dan detail akhir tetap dibahas saat konsultasi.', 'nominal', 50000, '{Custom}', 10, now() + interval '30 days')
on conflict (code) do nothing;

-- Broadcast (notifikasi bergaya iPhone). Yang terbaru tampil sebagai banner pertama.
insert into public.broadcasts (title, body, created_at)
select t, b, c from (values
 ('Pantau pesananmu kapan saja', E'Simpan ID pesananmu, lalu cek statusnya lewat menu Lacak Pesanan.', now() - interval '2 minutes'),
 ('Voucher rilis sudah tersedia', E'Ambil voucher RILIS10, PELAJAR, atau CUSTOM50 di bagian Voucher, lalu tukarkan saat memesan. Kuota terbatas.', now() - interval '1 minute'),
 ('Sagara Karya resmi dibuka', E'Terima kasih sudah mampir. Promo Rilis 15% untuk semua paket berlaku selama 14 hari.', now())
) as v(t, b, c)
where not exists (select 1 from public.broadcasts x where x.title = v.t);
