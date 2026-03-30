import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const generateAppointmentReport = (appointment) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(43, 75, 126);
    doc.text("HASTANE RANDEVU SISTEMI - TIBBI RAPOR", 105, 20, { align: "center" });

    // Rapor Bilgileri
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 20, 35);
    doc.text(`Rapor No: #REP-${appointment.id}-${Date.now().toString().slice(-4)}`, 20, 42);

    doc.line(20, 48, 190, 48);

    // Hasta ve Doktor Bilgileri
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Randevu Detayları", 20, 60);

    const data = [
        ["Doktor", appointment.doctor.name],
        ["Branş", appointment.doctor.branch],
        ["Hastane / Klinik", appointment.doctor.hospital || appointment.doctor.clinic?.name],
        ["Randevu Tarihi", new Date(appointment.date).toLocaleString('tr-TR')],
        ["Durum", appointment.status === "COMPLETED" ? "Tamamlandı" : "Aktif"]
    ];

    doc.autoTable({
        startY: 65,
        head: [['Detay', 'Bilgi']],
        body: data,
        theme: 'striped',
        headStyles: { fillColor: [63, 81, 181] }
    });

    // Notlar ve Tıbbi Tavsiye (Örnek)
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.text("Hekim Notları & Tavsiyeler", 20, finalY);
    doc.setFontSize(10);
    doc.text(appointment.notes || "Bu randevu için eklenmiş tıbbi bir not bulunmamaktadır.", 20, finalY + 10, { maxWidth: 170 });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Bu belge bilgisayar tarafından otomatik oluşturulmuştur. Geçerliliği için ıslak imza gerekebilir.", 105, 285, { align: "center" });

    doc.save(`Randevu_Raporu_${appointment.id}.pdf`);
};
