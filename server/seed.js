const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    console.log('--- ENTERPRISE SEED V6.0 BAŞLATILIYOR ---');
    console.log('Veritabanı temizleniyor...');

    // Temizlik sırası (Dependent kısıtlamaları nedeniyle önemli)
    await prisma.log.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.healthProfile.deleteMany();
    await prisma.labResult.deleteMany();
    await prisma.prescriptionItem.deleteMany();
    await prisma.visitRecord.deleteMany();
    await prisma.appointmentDraft.deleteMany();
    await prisma.prescription.deleteMany();
    await prisma.report.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.timeSlot.deleteMany();
    await prisma.favoriteDoctor.deleteMany();
    await prisma.unavailability.deleteMany();
    await prisma.waitingList.deleteMany();
    await prisma.dependent.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.clinic.deleteMany();
    // User'ları silmiyoruz (opsiyonel)

    console.log('Kritik veriler yükleniyor...');

    const branches = [
        "Kardiyoloji", "Göz Hastalıkları", "Dahiliye", "Kulak Burun Boğaz",
        "Nöroloji", "Ortopedi", "Çocuk Sağlığı", "Dermatoloji",
        "Kadın Doğum", "Genel Cerrahi", "Üroloji", "Psikiyatri", "Onkoloji"
    ];

    const hospitalTypes = ["Şehir Hastanesi", "Eğitim ve Araştırma Hastanesi", "Devlet Hastanesi", "Üniversite Hastanesi", "Medipol Mega", "Acıbadem", "Medical Park"];

    // 81 İl ve İlçeler (locationData.js ile uyumlu kısa liste, tam liste için döngü)
    const citiesData = {
        "İstanbul": ["Kadıköy", "Beşiktaş", "Üsküdar", "Şişli", "Fatih", "Esenyurt", "Beylikdüzü"],
        "Ankara": ["Çankaya", "Keçiören", "Yenimahalle", "Sincan"],
        "İzmir": ["Konak", "Karşıyaka", "Bornova", "Buca"],
        "Bursa": ["Nilüfer", "Osmangazi", "Yıldırım", "İnegöl"],
        "Antalya": ["Muratpaşa", "Kepez", "Alanya"],
        "Adana": ["Seyhan", "Çukurova"],
        "Konya": ["Selçuklu", "Meram"],
        "Gaziantep": ["Şahinbey", "Şehitkamil"],
        "Kocaeli": ["İzmit", "Gebze"],
        "Samsun": ["Atakum", "İlkadım"],
        "Trabzon": ["Ortahisar", "Akçaabat"]
        // Diğer iller için 'Merkez' default
    };

    const allCities = [
        "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
    ];

    console.log('Klinikler ve Hastaneler oluşturuluyor...');

    const createdClinics = [];
    // Her il için en az 2 hastane ve poliklinik
    for (const city of allCities) {
        const districts = citiesData[city] || ["Merkez"];
        for (const dist of districts) {
            for (let i = 0; i < 3; i++) { // Her ilçeye 3 poliklinik
                const branch = branches[Math.floor(Math.random() * branches.length)];
                const clinic = await prisma.clinic.create({
                    data: {
                        name: `${branch} Polikliniği`,
                        city: city,
                        district: dist
                    }
                });
                createdClinics.push(clinic);
            }
        }
    }

    console.log(`${createdClinics.length} klinik oluşturuldu.`);

    const firstNames = ["Ahmet", "Mehmet", "Ayşe", "Fatma", "Mustafa", "Can", "Elif", "Deniz", "Ege", "Selin", "Burak", "Zeynep"];
    const lastNames = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Öztürk", "Arslan", "Doğan", "Kılıç", "Yıldız"];

    console.log('Doktorlar oluşturuluyor (Enterprise Scale)...');

    const createdDoctors = [];
    // Yaklaşık 300 doktor oluşturalım
    for (let i = 0; i < 300; i++) {
        const clinic = createdClinics[Math.floor(Math.random() * createdClinics.length)];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const hospitalType = hospitalTypes[Math.floor(Math.random() * hospitalTypes.length)];

        const doctor = await prisma.doctor.create({
            data: {
                name: `Dr. ${firstName} ${lastName}`,
                branch: clinic.name.replace(' Polikliniği', ''),
                hospital: `${clinic.city} ${hospitalType}`,
                clinicId: clinic.id
            }
        });
        createdDoctors.push(doctor);
    }

    console.log(`${createdDoctors.length} doktor sisteme dahil edildi.`);

    // Test Kullanıcısı ve E-Nabız Verisi (Entegrasyonun çalışması için)
    console.log('Test verileri (E-Nabız) hazırlanıyor...');

    // 'admin@mhrs.gov.tr' kullanıcısını bul veya oluştur
    let testUser = await prisma.user.findUnique({ where: { email: 'admin@mhrs.gov.tr' } });
    if (!testUser) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        testUser = await prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'admin@mhrs.gov.tr',
                password: hashedPassword,
                role: 'ADMIN',
                tcNo: '12345678901'
            }
        });
    }

    let doctorUser = await prisma.user.findUnique({ where: { email: 'doctor@mhrs.gov.tr' } });
    if (!doctorUser) {
        const doctorPassword = await bcrypt.hash('doctor123', 10);
        doctorUser = await prisma.user.create({
            data: {
                name: 'Dr. Sistem Doktoru',
                email: 'doctor@mhrs.gov.tr',
                password: doctorPassword,
                role: 'DOCTOR',
                tcNo: '12345678902'
            }
        });
    } else if (doctorUser.role !== 'DOCTOR') {
        doctorUser = await prisma.user.update({
            where: { id: doctorUser.id },
            data: { role: 'DOCTOR' }
        });
    }

    const linkedDoctor = createdDoctors[0];
    await prisma.doctor.update({
        where: { id: linkedDoctor.id },
        data: { userId: doctorUser.id }
    });

    // Birkaç geçmiş randevu ve rapor (E-Nabız için)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    for (let i = 0; i < 5; i++) {
        const doc = createdDoctors[i % createdDoctors.length];

        // Önce bir slot lazım (Booked=true)
        const slot = await prisma.timeSlot.create({
            data: {
                startTime: pastDate,
                endTime: new Date(pastDate.getTime() + 1800000),
                doctorId: doc.id,
                isBooked: true
            }
        });

        const appointment = await prisma.appointment.create({
            data: {
                userId: testUser.id,
                doctorId: doc.id,
                date: pastDate,
                status: 'COMPLETED'
            }
        });

        await prisma.report.create({
            data: {
                appointmentId: appointment.id,
                title: `${doc.branch} Muayene Raporu`,
                content: `Hastanın ${doc.branch} kontrolleri yapıldı. Reçete düzenlendi.`,
            }
        });
    }

    const doctorPanelPatient = await prisma.user.upsert({
        where: { email: 'hasta1@mhrs.gov.tr' },
        update: {},
        create: {
            name: 'Demo Hasta',
            email: 'hasta1@mhrs.gov.tr',
            password: await bcrypt.hash('hasta123', 10),
            role: 'USER',
            tcNo: '12345678903'
        }
    });

    const now = new Date();
    const upcomingDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const pastVisitDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const doctorSlotFuture = await prisma.timeSlot.create({
        data: {
            startTime: upcomingDate,
            endTime: new Date(upcomingDate.getTime() + 30 * 60 * 1000),
            doctorId: linkedDoctor.id,
            isBooked: true
        }
    });

    const doctorAppointmentUpcoming = await prisma.appointment.create({
        data: {
            userId: doctorPanelPatient.id,
            doctorId: linkedDoctor.id,
            date: doctorSlotFuture.startTime,
            status: 'CONFIRMED'
        }
    });

    const doctorPastAppointment = await prisma.appointment.create({
        data: {
            userId: doctorPanelPatient.id,
            doctorId: linkedDoctor.id,
            date: pastVisitDate,
            status: 'COMPLETED'
        }
    });

    await prisma.visitRecord.upsert({
        where: { appointmentId: doctorPastAppointment.id },
        update: {},
        create: {
            appointmentId: doctorPastAppointment.id,
            doctorId: linkedDoctor.id,
            diagnosis: 'ÜSYE',
            examinationNote: 'Boğaz kızarık, ateş düşük.'
        }
    });

    await prisma.healthProfile.upsert({
        where: { userId: testUser.id },
        update: {},
        create: {
            userId: testUser.id,
            bloodType: 'A Rh+',
            allergies: 'Penisilin',
            chronicConditions: 'Hipertansiyon',
            medications: 'Günlük antihipertansif',
            emergencyContact: 'Ayşe Yılmaz - 05320000000'
        }
    });

    await prisma.notification.createMany({
        data: [
            { userId: testUser.id, title: 'Hoş geldiniz', message: 'Bildirim merkezi aktif edildi.', type: 'INFO' },
            { userId: testUser.id, title: 'Randevu Hatırlatma', message: 'Yarın 09:00 randevunuz bulunuyor.', type: 'WARNING' }
        ]
    });

    // Gelecek Randevular için Slotlar
    console.log('Randevu slotları oluşturuluyor...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = 1; d <= 3; d++) { // 3 günlük slot
        const slotDate = new Date(today);
        slotDate.setDate(slotDate.getDate() + d);

        // Sadece rastgele 50 doktora slot ekleyelim (performans için)
        for (let i = 0; i < 50; i++) {
            const doc = createdDoctors[Math.floor(Math.random() * createdDoctors.length)];
            const hours = [9, 10, 11, 14, 15];
            for (const h of hours) {
                const start = new Date(slotDate);
                start.setHours(h, 0, 0, 0);
                const end = new Date(slotDate);
                end.setHours(h, 30, 0, 0);

                await prisma.timeSlot.create({
                    data: {
                        startTime: start,
                        endTime: end,
                        doctorId: doc.id,
                        isBooked: false
                    }
                });
            }
        }
    }

    console.log('--- ENTERPRISE SEED TAMAMLANDI ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
