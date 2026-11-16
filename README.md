# MotoCare ID — Aplikasi Pengingat Servis & Perawatan Sepeda Motor

**MotoCare ID** adalah aplikasi web/PWA (*Progressive Web App*) yang dirancang secara *offline-first* untuk membantu pemilik sepeda motor memantau jadwal servis berkala, menghitung konsumsi bahan bakar (`km/L` & `Rp/km`), mengawasi tekanan ban ideal, mengingatkan jatuh tempo pajak/STNK, serta melihat statistik pengeluaran bulanan kendaraan langsung dari perangkat tanpa perlu login atau server backend.

---

## Base Idea (Ide Dasar & Konsep)

### Latar Belakang
Banyak pengendara motor harian sering melewatkan jadwal ganti oli mesin/gardan, terlambat mengecek tekanan ban, lupa tanggal jatuh tempo pajak STNK, atau tidak mengetahui seberapa irit konsumsi bahan bakar motornya (terutama setelah melakukan modifikasi seperti komponen CVT, koil, atau busi).

### Tujuan Utama
1. **Satu Dashboard Terpusat & Offline-First**: Seluruh catatan tersimpan lokal di browser (`localStorage`) dan dapat diekspor/impor sebagai file JSON backup sehingga langsung siap pakai kapan saja tanpa akun atau koneksi internet.
2. **Pengingat Cerdas Berbasis Odometer & Waktu**:
   - Komponen servis berkala (Oli Mesin, Oli Gardan, CVT, Kampas Rem, Busi, Filter Udara, V-Belt, dll.) dihitung ganda berdasarkan sisa kilometer maupun sisa waktu bulan.
   - Pengingat cek tekanan ban berkala dengan panduan PSI Depan & Belakang untuk berkendara sendiri (*solo*) maupun boncengan.
   - Pengingat jatuh tempo Pajak Tahunan (PKB) dan STNK 5 Tahunan (ganti plat).
3. **Kalkulator Konsumsi BBM Otomatis**:
   - Mendukung pencatatan berdasarkan odometer maupun jarak tempuh (*trip*), dengan perhitungan efisiensi `km/L`, biaya operasional per km (`Rp/km`), serta estimasi jarak 1 tangki penuh.
4. **Statistik & Grafik Pengeluaran**:
   - Grafik batang bertumpuk per bulan (Bensin vs Servis vs Pajak & Ban) yang otomatis mengikuti rentang bulan data aktif, dilengkapi distribusi persentase kategori biaya.

---

## Struktur Data

Seluruh struktur tipe data didefinisikan di [`src/types.ts`](src/types.ts) dengan objek utama `MotoCareData`:

### 1. `MotoCareData` (Root Store)
| Field | Tipe | Deskripsi |
| --- | --- | --- |
| `version` | `number` | Versi skema penyimpanan data |
| `profile` | `MotorProfile` | Identitas, spesifikasi, odometer, dan konfigurasi motor |
| `serviceSchedules` | `ServiceScheduleItem[]` | Daftar jadwal perawatan berkala |
| `serviceHistory` | `ServiceHistoryLog[]` | Riwayat servis bengkel yang telah dilakukan |
| `fuelLogs` | `FuelLog[]` | Catatan pengisian bahan bakar |
| `tireLogs` | `TireLog[]` | Catatan pengecekan & pengisian angin ban |
| `taxLogs` | `TaxPaymentLog[]` | Riwayat pembayaran pajak & STNK |

### 2. `MotorProfile`
- `name`: Nama/model motor (contoh: `Honda Scoopy 2023`)
- `plateNumber`: Nomor polisi / plat kendaraan (contoh: `DD3777XAB`)
- `type`: Jenis transmisi motor (`'matic' | 'bebek' | 'sport'`)
- `year`: Tahun pembuatan
- `specs` *(opsional)*: Catatan spesifikasi atau modifikasi kendaraan
- `currentOdo`: Odometer saat ini (`km`)
- `tankCapacityLiters`: Kapasitas tangki BBM (`liter`)
- `recommendedPsiFrontSolo`, `recommendedPsiRearSolo`: Tekanan ban ideal saat sendiri (`PSI`)
- `recommendedPsiFrontTandem`, `recommendedPsiRearTandem`: Tekanan ban ideal saat boncengan (`PSI`)
- `annualTaxDate`, `annualTaxCost`: Jatuh tempo (`YYYY-MM-DD`) & estimasi biaya Pajak Tahunan
- `stnkFiveYearDate`, `stnkFiveYearCost`: Jatuh tempo (`YYYY-MM-DD`) & estimasi biaya STNK 5 Tahunan
- `tireCheckIntervalDays`: Interval pengingat cek ban rutin (hari)

### 3. `ServiceScheduleItem` & `ServiceHistoryLog`
- **Jadwal (`ServiceScheduleItem`)**: `id`, `name`, `intervalKm`, `intervalMonths`, `lastServiceOdo`, `lastServiceDate`, `estimatedCost`.
- **Riwayat (`ServiceHistoryLog`)**: `id`, `date`, `odoKm`, `items` (`string[]`), `totalCost`, `workshopName`, `notes`.

### 4. `FuelLog`
- `id`: ID unik catatan pengisian
- `date`: Tanggal pengisian (`YYYY-MM-DD`)
- `odoKm`: Odometer saat mengisi (`km`)
- `tripKm` *(opsional)*: Jarak tempuh sejak pengisian sebelumnya (`km`)
- `fuelType`: Jenis BBM (contoh: `Pertalite`, `Pertamax`)
- `pricePerLiter`: Harga per liter (`Rp`)
- `liters`: Jumlah liter yang diisi
- `totalCost`: Total pembayaran (`Rp`)
- `isFullTank`: Penanda pengisian penuh untuk kalkulasi akurat `km/L`

### 5. `TireLog`
- `id`, `date`, `odoKm`, `frontPsi`, `rearPsi`, `filledToStandard`, `gasType` (`'Angin Biasa' | 'Nitrogen'`), `tireCondition` (`'Baik' | 'Mulai Aus' | 'Perlu Ganti'`), `cost`, `notes`.

### 6. `TaxPaymentLog`
- `id`, `date`, `type` (`'Pajak Tahunan' | 'STNK 5 Tahunan'`), `cost`, `notes`.

---

## Teknologi & Pengembangan

- **Frontend:** React 18 + TypeScript + Vite + Lucide Icons
- **Penyimpanan:** `localStorage` + Export/Import Backup JSON
- **Deployment:** GitHub Pages (otomatis melalui GitHub Actions pada branch `main` maupun static build di `gh-pages`)

```bash
npm install
npm run dev     # Jalankan secara lokal
npm run build   # Build produksi ke folder dist/
```
