const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

const MAJOR_CITIES_DISTRICTS = {
  "İstanbul": ["Kadıköy", "Şişli", "Beşiktaş", "Başakşehir", "Pendik", "Kartal", "Üsküdar", "Bakırköy", "Fatih", "Zeytinburnu"],
  "Ankara": ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut", "Sincan", "Altındağ"],
  "İzmir": ["Konak", "Karşıyaka", "Bornova", "Buca", "Bayraklı", "Çiğli", "Karabağlar"],
  "Bursa": ["Nilüfer", "Osmangazi", "Yıldırım", "İnegöl"],
  "Antalya": ["Muratpaşa", "Kepez", "Konyaaltı", "Alanya"]
};

const BRANCHES = [
  "Dahiliye (İç Hastalıkları)",
  "Kardiyoloji",
  "Genel Cerrahi",
  "Göz Hastalıkları",
  "Kulak Burun Boğaz",
  "Ortopedi ve Travmatoloji",
  "Nöroloji",
  "Çocuk Sağlığı ve Hastalıkları",
  "Kadın Hastalıkları ve Doğum",
  "Psikiyatri",
  "Üroloji",
  "Cildiye (Dermatoloji)",
  "Göğüs Hastalıkları",
  "Enfeksiyon Hastalıkları",
  "Fizik Tedavi ve Rehabilitasyon"
];

const FIRST_NAMES_M = ["Ali", "Ahmet", "Mehmet", "Mustafa", "Can", "Burak", "Emre", "Hasan", "Hüseyin", "İbrahim", "Murat", "Oğuz", "Osman", "Ömer", "Tarık", "Uğur", "Volkan", "Yasin", "Yusuf", "Ozan", "Koray", "Serkan", "Tolga"];
const FIRST_NAMES_F = ["Ayşe", "Fatma", "Zeynep", "Elif", "Merve", "Aslı", "Aylin", "Büşra", "Cansu", "Ceren", "Deniz", "Ebru", "Gizem", "Selin", "Sibel", "Sinem", "Tuğba", "Yasemin", "Özge", "Esra", "Berna", "Bahar", "Şeyma"];
const LAST_NAMES = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şimşek", "Polat", "Öz", "Korkmaz", "Erdoğan", "Yavuz", "Turan", "Boaz", "Güler", "Aksoy", "Tekin"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomDoctor() {
  const isFemale = Math.random() > 0.5;
  const firstName = isFemale ? getRandomItem(FIRST_NAMES_F) : getRandomItem(FIRST_NAMES_M);
  const lastName = getRandomItem(LAST_NAMES);
  const title = "Uzm. Dr.";
  const name = `${title} ${firstName} ${lastName}`;
  
  // Create an email from name (e.g. Uzm. Dr. Ali Yılmaz -> ali.yilmaz_945@mhrs.gov.tr)
  let emailBase = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`
      .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');
  const email = `${emailBase}_${Math.floor(Math.random() * 10000)}@mhrs.gov.tr`;
  
  return { name, email, branch: getRandomItem(BRANCHES) };
}

function getHospitalName(city, district) {
    const types = ["Devlet Hastanesi", "Eğitim ve Araştırma Hastanesi", "Şehir Hastanesi"];
    
    // Şehir hastaneleri genelde büyük illerde olur
    if (["Ankara", "İstanbul", "İzmir", "Bursa", "Adana", "Gaziantep", "Kayseri"].includes(city) && Math.random() > 0.6) {
        return `${city} ${district === 'Merkez' ? '' : district} Şehir Hastanesi`.replace('  ', ' ');
    }
    
    if (Math.random() > 0.7) {
         return `${city} ${district === 'Merkez' ? '' : district} Eğitim ve Araştırma Hastanesi`.replace('  ', ' ');
    }
    
    return `${district === 'Merkez' ? city : district} Devlet Hastanesi`;
}

async function runSeed() {
  console.log("MHRS Dev Veritabanı Doldurma İşlemi Başlıyor...");
  
  // 1. Şifreyi bir kez hashleyelim (performans için bütün doktorlarda aynı şifre)
  console.log("Güvenlik: Şifreler oluşturuluyor (Geçerli şifre: 12345678)...");
  const defaultPasswordHash = await bcrypt.hash('12345678', 10);

  let totalDoctorsAdded = 0;
  let totalClinicsAdded = 0;

  for (const city of CITIES) {
    // Büyük şehirlerde birden fazla ilçe, küçük şehirlerde merkez ilçe
    const districts = MAJOR_CITIES_DISTRICTS[city] || ["Merkez", "İlçe 1"];
    
    for (const district of districts) {
        const hospitalName = getHospitalName(city, district);
        
        // Poliklinik/Klinik oluştur
        const clinic = await prisma.clinic.create({
            data: {
                name: hospitalName,
                city: city,
                district: district !== 'İlçe 1' ? district : 'Merkez'
            }
        });
        totalClinicsAdded++;
        
        // Bu kliniğe 5 ile 15 arası doktor atayalım
        const numDoctors = Math.floor(Math.random() * 11) + 5; 
        
        const doctorPromises = [];
        
        for (let i = 0; i < numDoctors; i++) {
            const docInfo = generateRandomDoctor();
            
            // Random TC No (11 hane string)
            const tcNo = Math.floor(10000000000 + Math.random() * 90000000000).toString().substring(0, 11);
            
            doctorPromises.push((async () => {
                try {
                    // Kullanıcıyı yarat
                    const user = await prisma.user.create({
                        data: {
                            name: docInfo.name,
                            email: docInfo.email,
                            password: defaultPasswordHash,
                            tcNo: tcNo,
                            role: 'DOCTOR',
                            is2FAEnabled: false
                        }
                    });
                    
                    // Doktor profilini yarat
                    await prisma.doctor.create({
                        data: {
                            name: docInfo.name,
                            branch: docInfo.branch,
                            hospital: hospitalName,
                            userId: user.id,
                            clinicId: clinic.id
                        }
                    });
                    return true;
                } catch(e) { 
                    // TC veya Email çakışmasını göz ardı et
                    return false;
                }
            })());
        }
        
        const results = await Promise.all(doctorPromises);
        totalDoctorsAdded += results.filter(Boolean).length;
    }
    console.log(`[${city}] Şehri tamamlandı. Toplam Doktor: ${totalDoctorsAdded}`);
  }

  console.log("\n=================================");
  console.log("MHRS Dev Seed İşlemi Tamamlandı!");
  console.log(`Oluşturulan Hastane/Poliklinik Sayısı: ${totalClinicsAdded}`);
  console.log(`Eklenen Uzman Doktor Sayısı: ${totalDoctorsAdded}`);
  console.log("Örnek Giriş Bilgileri:");
  console.log("Tüm Doktorlar İçin Şifre: 12345678");
  console.log("E-posta formatı: isim.soyisim_rastgelesayi@mhrs.gov.tr");
  console.log("=================================\n");
  
  await prisma.$disconnect();
}

runSeed().catch(e => {
  console.error(e);
  process.exit(1);
});
