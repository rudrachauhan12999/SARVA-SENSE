import os
from . import db
from .config import MANUALS_DIR
from .rag.ingest import ingest_manual

MACHINES = [
    dict(id="hp-200x", name="Hydraulic Press HP-200X", model="HP-200X Heavy Duty",
         serialNumber="HPX-2023-8841", category="Forming & Stamping", status="FAULT_REPORTED",
         location="Bay 3 - Stamping Line A", manualCount=0, caseCount=14,
         lastFault="E101 - Pressure Sensor Fault", iconColor="#22C55E", tabColor="#4ADE80"),
    dict(id="mx-40", name="CNC Milling MX-40", model="MX-40 5-Axis VMC",
         serialNumber="CNC-MX-9902", category="Precision Machining", status="WARNING",
         location="Bay 1 - Precision Cell", manualCount=0, caseCount=9,
         lastFault="E101 - Spindle Temp Warning", iconColor="#A855F7", tabColor="#C084FC"),
    dict(id="ac-90", name="Industrial Compressor AC-90", model="AC-90 Rotary Screw",
         serialNumber="CMP-AC-4410", category="Pneumatics & Air", status="OPERATIONAL",
         location="Utility Room West", manualCount=0, caseCount=5,
         lastFault="E044 - Filter Differential Alert", iconColor="#FB923C", tabColor="#FDBA74"),
    dict(id="pk-12", name="Packaging Machine PK-12", model="PK-12 High-Speed Packer",
         serialNumber="PKG-12-7011", category="Automated Packaging", status="MAINTENANCE",
         location="Packaging Concourse B", manualCount=0, caseCount=7,
         lastFault="E302 - Film Tension Jam", iconColor="#FB7185", tabColor="#FDA4AF"),
]

MANUALS = [
    dict(id="man-hp-1", title="HP-200 Service Manual", machineId="hp-200x",
         machineName="Hydraulic Press HP-200X", model="HP-200X",
         filename="hp200_service_manual.pdf", version="Rev 4.2 (2024)",
         tabColor="#4ADE80", documentType="Service Manual"),
    dict(id="man-hp-2", title="Hydraulic System Guide & Circuitry", machineId="hp-200x",
         machineName="Hydraulic Press HP-200X", model="HP-200X",
         filename="hydraulic_system_guide.pdf", version="Rev 2.1",
         tabColor="#FEF08A", documentType="Hydraulic Guide"),
    dict(id="man-mx-1", title="MX-40 CNC Operation & Maintenance Manual", machineId="mx-40",
         machineName="CNC Milling MX-40", model="MX-40",
         filename="mx40_manual.pdf", version="Rev 5.0",
         tabColor="#C084FC", documentType="Service Manual"),
    dict(id="man-ac-1", title="AC-90 Rotary Screw Compressor Manual", machineId="ac-90",
         machineName="Industrial Compressor AC-90", model="AC-90",
         filename="ac90_manual.pdf", version="Rev 1.8",
         tabColor="#FDBA74", documentType="Service Manual"),
]


def seed_and_ingest(force_reingest: bool = False):
    db.init_db()

    for m in MACHINES:
        db.upsert_machine(m)

    import datetime
    from pypdf import PdfReader

    for manual in MANUALS:
        filepath = os.path.join(MANUALS_DIR, manual["filename"])
        if not os.path.exists(filepath):
            continue
        pages = len(PdfReader(filepath).pages)
        size_mb = os.path.getsize(filepath) / (1024 * 1024)
        row = dict(
            id=manual["id"], title=manual["title"], machineId=manual["machineId"],
            machineName=manual["machineName"], model=manual["model"], pages=pages,
            fileSize=f"{size_mb:.1f} MB", ocrStatus="Completed", status="Indexed",
            uploadedDate=datetime.date.today().isoformat(), version=manual["version"],
            tabColor=manual["tabColor"], filepath=filepath, documentType=manual["documentType"],
        )
        db.upsert_manual(row)

        already_indexed = db.chunk_count_for_manual(manual["id"]) > 0
        if force_reingest or not already_indexed:
            n = ingest_manual(row)
            print(f"Indexed {manual['id']}: {n} chunks")

    # recompute manualCount per machine from what's actually in the DB
    manuals_now = db.list_manuals()
    counts = {}
    for m in manuals_now:
        counts[m["machineId"]] = counts.get(m["machineId"], 0) + 1
    for machine_id, count in counts.items():
        machine = db.get_machine(machine_id)
        if machine:
            machine["manualCount"] = count
            db.upsert_machine(machine)


if __name__ == "__main__":
    seed_and_ingest(force_reingest=True)
