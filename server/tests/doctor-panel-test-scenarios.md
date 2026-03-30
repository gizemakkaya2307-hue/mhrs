# Doktor Paneli Test Senaryolari

## Yetkilendirme
- DOCTOR kullanicisi `GET /api/doctor-panel/appointments` cagirinca 200 donmeli.
- USER kullanicisi ayni endpointi cagirinca 403 donmeli.
- Doktor profili ile eslesmeyen DOCTOR kullanicisi icin 403 donmeli.

## Randevu Listeleme
- Secilen tarih icin randevular `upcoming` ve `past` listeleri olarak ayrilmali.
- Doktor sadece kendi `doctorId` randevularini gormeli.

## Hasta Detay ve Visit History
- `GET /api/doctor-panel/appointments/:appointmentId` sadece ayni doktora ait randevuda 200 donmeli.
- Baska doktora ait randevuda 404 donmeli.
- `GET /api/doctor-panel/patients/:patientUserId/history` en son kayitlardan max 30 donmeli.

## Klinik Kayit
- `POST /api/doctor-panel/appointments/:appointmentId/clinical-note` tani, muayene notu ve recete kalemlerini kaydetmeli.
- Ayni endpoint tekrar cagrildiginda visit record upsert olmali, recete kalemleri replace edilmeli.
- Eksik `diagnosis` veya `examinationNote` icin 400 donmeli.

## Durum Guncelleme
- `PATCH /api/doctor-panel/appointments/:appointmentId/status` ile `COMPLETED`, `NO_SHOW`, `CANCELLED` guncellenmeli.
- Gecersiz status degeri icin 400 donmeli.

## Audit
- Klinik not ekleme ve durum guncelleme islemlerinde audit kaydi olusmali.
