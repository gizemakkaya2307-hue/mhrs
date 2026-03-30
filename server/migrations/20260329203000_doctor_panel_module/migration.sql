-- Doctor panel module: doctor-user binding and clinical visit records.

ALTER TABLE "Doctor" ADD COLUMN "userId" INTEGER;
CREATE UNIQUE INDEX "Doctor_userId_key" ON "Doctor"("userId");
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "VisitRecord" (
    "id" SERIAL NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "examinationNote" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VisitRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VisitRecord_appointmentId_key" ON "VisitRecord"("appointmentId");
ALTER TABLE "VisitRecord" ADD CONSTRAINT "VisitRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VisitRecord" ADD CONSTRAINT "VisitRecord_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
