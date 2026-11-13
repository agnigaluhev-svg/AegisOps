# PROJECT_CONTEXT.md — AegisOps

> Baca file ini pertama. Isinya: apa proyeknya, untuk apa, kondisi saat ini, dan batasan yang tidak boleh dilanggar.
> Dokumen lain: `PRD.md` (apa yang dibangun), `ARCHITECTURE.md` (bagaimana), `AGENTS.md` (aturan kerja AI agent), `TASKS.md` (urutan kerja dan checklist).

Terakhir diperbarui: 13 Nov 2026

---

## 1. Ringkasan satu paragraf

**AegisOps** adalah platform *Cyber Defense & Infrastructure Intelligence* yang memantau jaringan dan perangkat, mendeteksi aktivitas mencurigakan, mengorelasikan temuan dengan aset dan log, lalu memberi **alert yang disertai bukti, dampak, prioritas, dan rekomendasi tindakan yang aman**. Operator dapat mengelola temuan itu sebagai insiden sampai selesai. Hardware health dan predictive maintenance adalah pembeda jangka panjang, bukan fokus demo pertama.

## 2. Konteks kompetisi (target saat ini)

| Item | Isi |
|---|---|
| Nama | Kartika Cyber Hackathon 2026 |
| Penyelenggara | Pusat Siber Angkatan Darat (PUSSIBERAD) dan CODEPOLITAN |
| Tema | Solusi keamanan siber untuk pertahanan negara; karya terbaik berpeluang diadopsi TNI AD |
| **Track yang dipilih** | **Penangkalan (Defensive Shield)**: mendeteksi, mencegah, dan merespons ancaman siber |
| Peserta | Individu atau tim maks. 3 orang. Wajib punya akun CODEPOLITAN |
| **Batas pengumpulan** | **15 November 2026** (jam tepatnya tidak tertulis; anggap pagi hari demi aman) |
| Penjurian online | mulai 16 Nov. Top 10 diumumkan 20 Nov |
| Final offline | 24 Nov 2026, Hotel Aston Kartika, Jakarta. Presentasi 10 menit + demo prototipe |
| Sumber | https://kartikacyberhackathon.id/ |

**Yang wajib dikumpulkan (3 item):**
1. Link karya/prototipe yang bisa diakses (juri harus bisa membuka tanpa instalasi)
2. Video presentasi
3. Slide penjelasan proyek

Format file, durasi video, dan jumlah slide **tidak dicantumkan** di situs. Tanyakan di grup WhatsApp panitia atau cek dashboard CODEPOLITAN.

**Kriteria penilaian:**

| Bobot | Kriteria | Artinya untuk AegisOps |
|---|---|---|
| 25% | Relevansi dan manfaat (kebutuhan keamanan IT/OT TNI AD) | Tunjukkan deteksi + respons pada infrastruktur jaringan yang kritis |
| 25% | Inovasi teknis | Korelasi deteksi + aset + kesehatan perangkat; rekomendasi yang bisa ditindaklanjuti |
| 25% | Fungsi prototipe | Demo harus **berjalan** sesuai rancangan, dari deteksi sampai penutupan insiden |
| 15% | Kelayakan implementasi | Jalur deployment nyata (sensor pasif, agen ringan, bisa lokal/air-gapped) |
| 10% | Dokumentasi | Link, video, dan slide jelas |

## 3. Posisi produk

- **Kategori:** Defensive Shield (Penangkalan). Kategori Core Infra tidak dipilih agar fokus tidak melebar.
- **Fitur unggulan demo:** **Network Threat Detection** dengan alur lengkap deteksi → korelasi → alert → rekomendasi → incident management.
- **Pembeda:** (1) alert yang membawa bukti, dampak, dan langkah pemeriksaan, (2) prioritas berdasarkan kepentingan aset dan perangkat terdampak, (3) satu platform untuk keamanan dan kesehatan perangkat, (4) jalur ke OT/aset strategis.
- **Kalimat posisi:** *AegisOps membantu operator jaringan mengetahui apa yang terjadi, apa yang terdampak, dan apa yang harus diperiksa lebih dulu.*

Catatan jujur: monitoring (SNMP/NMS), IDS (Suricata/Zeek), dan SIEM sudah ada sebagai kategori produk. Nilai AegisOps harus dibuktikan lewat integrasi, kejelasan rekomendasi, dan hasil uji, bukan lewat klaim "belum ada yang seperti ini".

## 4. Kondisi saat ini

**Tahap: sudah ada prototipe dashboard (simulasi).** Belum ada aplikasi dengan data nyata.

Prototipe yang ada (satu file HTML, JS murni, data simulasi di browser):
- Ringkasan: KPI, indeks kesehatan, topologi, antrean "Perlu diperbaiki sekarang", ringkasan situasi
- Alert & Perbaikan: bukti, dampak, langkah periksa, tiket (baru → ditangani → selesai)
- Inventaris perangkat (12 aset), Prediksi tren (regresi linear), Riwayat
- Simulasi gangguan (7 skenario infrastruktur: packet loss, switch mati, pendingin gagal, UPS, disk, CPU, error interface)
- Tema gelap/terang, responsif

Prototipe ini fokus ke **kesehatan infrastruktur**. **Yang belum ada dan wajib ditambah untuk track Defensive Shield:** modul deteksi ancaman jaringan, analisis event keamanan, dan insiden keamanan. Lihat `PRD.md`.

Referensi UI: dashboard NOC bergaya gelap (layout saja; **jangan** menyalin merek atau aset pihak lain).

## 5. Prinsip yang tidak boleh dilanggar

1. **Jujur soal data.** Semua data demo adalah simulasi atau dataset contoh dan harus diberi label jelas ("Data simulasi"). Jangan menampilkan angka seolah hasil monitoring nyata.
2. **Tidak ada klaim yang belum diuji.** Jangan klaim "AI", "zero-day detection", atau "memprediksi kerusakan pasti". Prediksi = indikasi tren dengan tingkat keyakinan. Deteksi = aturan dan ambang yang bisa dijelaskan.
3. **Rekomendasi aman.** Sistem merekomendasikan langkah investigasi dan mitigasi. Tindakan yang mengubah jaringan (blokir, isolasi) memerlukan persetujuan operator dan hanya disimulasikan di demo.
4. **Tidak ada alat serang.** Skenario port scan/brute force adalah **event sintetis** yang diputar ulang. Jangan menulis atau menyertakan kode yang memindai atau menyerang jaringan nyata.
5. **Alutsista dan OT = roadmap.** Sebut sebagai arah pengembangan (diagnostik resmi dan diizinkan). Jangan mengklaim kemampuan atau kebutuhan TNI AD yang belum diketahui.
6. **Demo harus berjalan tanpa instalasi.** Juri membuka satu URL dan langsung bisa mencoba.

## 6. Istilah

| Istilah | Arti |
|---|---|
| Event | Satu kejadian ternormalisasi dari sumber (Suricata, Zeek, firewall, SNMP, agen) |
| Detection rule | Aturan yang menilai kumpulan event dan menghasilkan temuan |
| Alert | Temuan dengan severity, bukti, dampak, rekomendasi |
| Incident | Satu atau lebih alert yang dikelola operator sampai selesai |
| Asset | Perangkat dalam inventaris dengan kepentingan (1–5), pemilik, dan relasi |
| AegisNode | Node sensor fisik ESP32-S3 + BME280 (roadmap; di demo disimulasikan) |
