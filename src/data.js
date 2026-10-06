// Kontak: isi salah satu atau keduanya. Kosong semua = tombol Konsultasi menuju bagian CTA.
export const CONTACT_WA = '' // nomor WhatsApp, mis. 081234567890
export const CONTACT_EMAIL = '' // mis. namakamu@gmail.com
const waNum = CONTACT_WA.replace(/\D/g, '').replace(/^0/, '62')
export const channels = [
  ...(waNum ? [{ id: 'wa', label: 'WhatsApp', href: `https://wa.me/${waNum}?text=${encodeURIComponent('Halo Sagara Karya, saya ingin berkonsultasi.')}` }] : []),
  ...(CONTACT_EMAIL ? [{ id: 'mail', label: 'Gmail', href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Konsultasi Sagara Karya')}` }] : []),
]
export const contactHref = channels.length === 1 ? channels[0].href : '#mulai'

export const nav = [
  ['Beranda', '#beranda'], ['Layanan', '#layanan'], ['Paket', '#paket'], ['Cek Pesanan', '#cek'], ['Tentang', '#tentang'], ['FAQ', '#faq'],
]
export const services = [
  ['Website', 'Website personal, bisnis, portfolio, dan landing page.'],
  ['Personal Identity', 'Website untuk memperkenalkan diri, karya, pengalaman, dan profil.'],
  ['Portfolio', 'Tempat untuk menampilkan project dan hasil karya.'],
  ['CV Online', 'CV digital yang lebih mudah dibagikan.'],
  ['Logo & Identity', 'Logo sederhana dan identitas visual dasar.'],
  ['Custom', 'Kebutuhan khusus yang tidak masuk paket standar.'],
]
export const packages = [
  { name: 'Basic', price: 'Rp70.000', amount: 70000, stack: 'HTML + CSS + JavaScript', desc: 'Cocok untuk website sederhana.' },
  { name: 'Standard', price: 'Rp150.000', amount: 150000, stack: 'Vite + React', desc: 'Cocok untuk website modern dengan struktur component-based.' },
  { name: 'Advanced', price: 'Rp200.000', amount: 200000, stack: 'Vite + React + Tailwind CSS', desc: 'Untuk kebutuhan desain dan struktur yang lebih fleksibel.' },
  { name: 'Custom', price: 'Mulai Rp500.000', amount: 500000, stack: 'Vite + React + Tailwind CSS + fitur custom', desc: 'Fitur custom disesuaikan berdasarkan kebutuhan proyek.' },
]
export const why = [
  ['Rapi', 'Setiap detail dibuat dengan perhatian.'],
  ['Jelas', 'Komunikasi dan kebutuhan proyek dibahas sejak awal.'],
  ['Sesuai kebutuhan', 'Tidak semua orang membutuhkan website yang sama.'],
  ['Terjangkau', 'Mulai dari Rp70.000 untuk kebutuhan sederhana.'],
]
export const steps = ['Cerita kebutuhanmu', 'Tentukan konsep', 'Pengerjaan', 'Review', 'Website siap digunakan']
export const faqs = [
  ['Apakah bisa request desain sendiri?', 'Bisa. Ceritakan referensi atau gambaran yang kamu punya. Seberapa jauh bisa diwujudkan kita bahas di awal, menyesuaikan paket yang dipilih.'],
  ['Apakah bisa membuat website personal?', 'Bisa. Website personal, portfolio, dan CV online adalah bagian dari layanan kami.'],
  ['Apakah bisa custom?', 'Bisa. Paket Custom dimulai dari Rp500.000. Fitur dan harga akhirnya ditentukan setelah kebutuhanmu dibahas, jadi tidak semua fitur otomatis termasuk.'],
  ['Bagaimana cara memulai?', 'Klik Mulai Konsultasi lalu ceritakan kebutuhanmu. Dari situ kita tentukan paket dan konsep yang paling pas.'],
  ['Apakah harga bisa berubah?', 'Harga di halaman ini adalah acuan tiap paket. Jika kebutuhanmu di luar isi paket, kita bicarakan dan sepakati dulu sebelum pengerjaan dimulai.'],
  ['Apakah bisa membantu domain dan deployment?', 'Bisa dibicarakan saat konsultasi. Detail dan biayanya bergantung pada kebutuhan, dan tidak otomatis termasuk dalam paket.'],
]

export const socials = [
  { id: 'ig', label: 'Instagram', handle: '@sagarakaryastudio', href: 'https://www.instagram.com/sagarakaryastudio' },
  { id: 'tt', label: 'TikTok', handle: '@sagarakaryastudio', href: 'https://www.tiktok.com/@sagarakaryastudio' },
]
