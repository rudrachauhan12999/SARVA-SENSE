"""
Generates 4 synthetic-but-realistic OEM manual PDFs used to demo SARVA-SENSE:

  1. HP-200 Service Manual                (machine: hp-200x)  -- contains E101/E102/E105
  2. Hydraulic System Guide & Circuitry    (machine: hp-200x)  -- transducer/bleed procedure
  3. MX-40 CNC Operation & Maintenance Manual (machine: mx-40) -- contains E101 (DIFFERENT MEANING - ambiguity case)
  4. AC-90 Rotary Screw Compressor Manual  (machine: ac-90)    -- contains E044

Every manual is padded with short, low-information "filler" pages so that the
important sections land on specific page numbers (this mirrors a real 400-page
manual where the answer is buried on one specific page, and keeps the demo's
OCR/vision workflow pointed at a real, meaningful page). Filler pages are
intentionally short (<20 words) so the ingestion chunker (see rag/chunking.py)
skips them as non-informative -- they exist for pagination realism only, they
are not part of the knowledge base.

Run:
    python backend/scripts/generate_sample_manuals.py
"""
import os
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "manuals")
os.makedirs(OUT_DIR, exist_ok=True)

styles = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=13, spaceAfter=10, alignment=TA_LEFT)
BODY = ParagraphStyle("Body", parent=styles["BodyText"], fontSize=9.5, leading=13.5)
TITLE = ParagraphStyle("Title", parent=styles["Title"], fontSize=22, spaceAfter=20)
SUB = ParagraphStyle("Sub", parent=styles["Normal"], fontSize=11, spaceAfter=6)


class ManualBuilder:
    """Builds a flowable list page-by-page so page numbers are deterministic:
    every unit appended via filler_page()/section_page() ends in a PageBreak,
    so unit index N (1-based) lands on PDF page N."""

    def __init__(self, cover_title, cover_sub):
        self.story = []
        self.story.append(Paragraph(cover_title, TITLE))
        self.story.append(Paragraph(cover_sub, SUB))
        self.story.append(Spacer(1, 0.3 * inch))
        self.story.append(Paragraph(
            "This document is a demonstration OEM-style manual generated for the "
            "SARVA-SENSE RAG troubleshooting assistant prototype.", BODY))
        self.story.append(PageBreak())
        self.page_count = 1  # cover page

    def filler_page(self, heading):
        self.story.append(Paragraph(heading, H1))
        self.story.append(Paragraph(
            "Refer to OEM standard reference material for this subsystem.", BODY))
        self.story.append(PageBreak())
        self.page_count += 1

    def filler_until(self, target_page_minus_one, prefix="1"):
        i = 0
        while self.page_count < target_page_minus_one:
            i += 1
            self.filler_page(f"{prefix}.{i} General Reference Note")

    def section_page(self, heading, paragraphs):
        self.story.append(Paragraph(heading, H1))
        for p in paragraphs:
            self.story.append(Paragraph(p, BODY))
            self.story.append(Spacer(1, 0.08 * inch))
        self.story.append(PageBreak())
        self.page_count += 1
        return self.page_count  # the page this section just occupied

    def save(self, path):
        # drop trailing PageBreak so we don't get a blank last page
        if self.story and isinstance(self.story[-1], PageBreak):
            self.story.pop()
        doc = SimpleDocTemplate(path, pagesize=LETTER,
                                 topMargin=0.7 * inch, bottomMargin=0.7 * inch,
                                 leftMargin=0.8 * inch, rightMargin=0.8 * inch)
        doc.build(self.story)


def build_hp200_service_manual():
    mb = ManualBuilder("HP-200 Service Manual", "Hydraulic Press HP-200X Heavy Duty &mdash; Rev 4.2 (2024)")
    mb.filler_until(167, prefix="1-5")
    mb.section_page(
        "SECTION 6.1 - THERMAL MANAGEMENT & HEAT EXCHANGERS",
        [
            "Hydraulic Thermal Limits: normal operating zone is 38&deg;C to 55&deg;C measured at reservoir "
            "sight glass LG-01. A warning alarm triggers at 60&deg;C. Continuous fluid temperatures exceeding "
            "60&deg;C rapidly degrade seals and accelerate oil oxidation. A critical automatic machine "
            "shut-off trips at 68&deg;C.",
            "Probable causes of hydraulic over-temperature: (1) oil-to-air heat exchanger HE-01 fins clogged "
            "with airborne particulate and coolant mist, (2) hydraulic reservoir oil level dropped below the "
            "minimum indicator, reducing thermal dissipation mass, (3) system pressure relief valve RV-01 "
            "stuck partially unseated, generating continuous parasitic bypass friction and heat, "
            "(4) circulation pump cooling fan motor relay failure.",
            "Corrective Action Procedure: Step 1 - stop the press stroke cycle immediately and leave "
            "circulation fans running for 10 minutes if operational (THERMAL BURN HAZARD: hydraulic fluid "
            "and manifold surfaces may exceed 75&deg;C, wear heat-resistant nitrile gloves and eye protection). "
            "Step 2 - inspect oil sight glass and level gauge LG-01; fluid must sit between the upper and "
            "lower index marks at 40&deg;C. Step 3 - blow compressed air (below 2 bar) from inside outward "
            "through heat exchanger HE-01 fins to clear debris. Step 4 - use an infrared thermal gun on "
            "relief valve RV-01 body; if its temperature exceeds reservoir temperature by more than 15&deg;C, "
            "the valve is leaking internally to tank and must be rebuilt or replaced.",
        ],
    )
    mb.filler_until(213, prefix="6-7")
    mb.section_page(
        "SECTION 8.3 - HYDRAULIC DIAGNOSTIC & ALARM MATRIX",
        [
            "ALARM CODE E101: Hydraulic Pressure Sensor Fault, sub-circuit Primary Manifold Block A. "
            "Trigger condition: PLC analog input 04 loop current under 3.6 mA or over 21.5 mA for more "
            "than 450 ms. Severity: Critical, automatic protective stop and emergency ramp-down.",
            "Probable root causes of E101: (1) pressure transducer PX-102 M12 connector unplugged, bent "
            "pins, corroded or damaged by fluid ingress, (2) signal wiring 31/32 open circuit between "
            "junction box JB-2 and PLC analog module 04, (3) transducer diaphragm mechanical blowout, "
            "(4) hydraulic system pressure genuinely dropped below the 140 bar minimum threshold.",
            "Corrective Action Procedure for E101: Step 1 - engage Lock-Out/Tag-Out (LOTO) on main isolator "
            "SW-1 and depressurize the accumulator via manual bleed valve BV-01 (HIGH PRESSURE HAZARD: fluid "
            "injection injury can be fatal, never loosen manifold fittings while the accumulator is charged). "
            "Step 2 - remove the M12 connector on manifold block A and inspect pins for bending, moisture, "
            "or thermal degradation; clean with electrical contact cleaner. Step 3 - connect a digital "
            "multimeter in series across terminals 31 (+) and 32 (-); expected nominal loop current in "
            "standby is 4.02 mA +/- 0.05 mA. Step 4 - cross-check analog dial gauge G-101 against the "
            "digital display; if the manual gauge reads normal pressure above 160 bar, replace transducer "
            "PX-102 (part no. HYD-TR-8821).",
            "ALARM CODE E102: Hydraulic Return Line Filter Clogged. Trigger: differential pressure switch "
            "DPS-2 held closed for over 30 seconds. Corrective action: replace return filter element "
            "RF-220 and reset the differential switch.",
            "ALARM CODE E105: Accumulator Pre-charge Low. Trigger: nitrogen pre-charge pressure sensor "
            "reads below 55 bar during idle cycle. Corrective action: schedule accumulator nitrogen "
            "recharge per Section 8.5, do not operate press until pre-charge is restored.",
        ],
    )
    mb.filler_until(219, prefix="8")
    return mb


def build_hydraulic_system_guide():
    mb = ManualBuilder("Hydraulic System Guide & Circuitry", "Hydraulic Press HP-200X &mdash; Rev 2.1")
    mb.filler_until(87, prefix="1-3")
    mb.section_page(
        "SECTION 4.2 - TRANSDUCERS & ACCUMULATOR BLEED PROCEDURE",
        [
            "Pressure Transducer PX-102 Specification: calibration range 0-250 bar, 4-20 mA two-wire loop "
            "output, mounted on Primary Manifold Block A. Always depressurize the circuit via manual bleed "
            "valve BV-01 before disconnecting transducer PX-102 or loosening any manifold fitting.",
            "Accumulator Bleed Procedure: open manual valve BV-01 slowly and hold until the analog gauge "
            "G-101 reads 0 bar before beginning any transducer removal, pin testing, or manifold service. "
            "Re-torque the transducer to 18 Nm on reinstall and confirm the 4-20 mA loop reads within "
            "calibration before returning the press to service.",
        ],
    )
    mb.filler_until(95, prefix="4-5")
    return mb


def build_mx40_manual():
    mb = ManualBuilder("MX-40 CNC Operation & Maintenance Manual", "CNC Milling MX-40 5-Axis VMC &mdash; Rev 5.0")
    mb.filler_until(95, prefix="1-4")
    mb.section_page(
        "SECTION 5.4 - SPINDLE DIAGNOSTICS & ALARM CODES",
        [
            "ALARM CODE E101 (MX-40): Spindle Bearing Thermal Excursion / Temperature Warning. This code is "
            "specific to the MX-40 spindle cartridge and is NOT related to hydraulic pressure. Trigger: "
            "front spindle bearing thermocouple TC-SP1 reads above 78 degrees C for more than 60 seconds "
            "during continuous 5-axis cutting cycles.",
            "Probable root causes of E101 on MX-40: (1) spindle coolant-through-tool flow restricted or "
            "coolant pump CP-3 underperforming, (2) front bearing grease depleted or contaminated with "
            "coolant, requiring bearing repack per the 2000-hour maintenance interval, (3) spindle running "
            "at sustained RPM above the duty-cycle rating for the current tool load, (4) thermocouple TC-SP1 "
            "sensor drift or wiring fault giving a false high reading.",
            "Corrective Action Procedure for E101 (MX-40): Step 1 - reduce spindle RPM and pause the "
            "cutting cycle; allow the spindle to idle-cool for 5 minutes with coolant flow active. "
            "Step 2 - verify coolant-through-spindle flow rate at nozzle CT-1 meets the 4.5 L/min minimum "
            "specification; clean or replace the inline filter if flow is low. Step 3 - inspect and, if "
            "due, repack the front spindle bearing cartridge with OEM grease per the lubrication schedule. "
            "Step 4 - if TC-SP1 readings remain inconsistent with an infrared thermal check of the spindle "
            "nose, replace the thermocouple assembly TC-SP1.",
            "ALARM CODE E205: Servo Drive Following Error on the X-axis ball screw. Corrective action: "
            "check ball screw preload and servo tuning parameters per Section 5.6.",
        ],
    )
    mb.filler_until(119, prefix="5-7")
    return mb


def build_ac90_manual():
    mb = ManualBuilder("AC-90 Rotary Screw Compressor Manual", "Industrial Compressor AC-90 &mdash; Rev 1.8")
    mb.filler_until(51, prefix="1-2")
    mb.section_page(
        "SECTION 3.2 - FILTER & DIFFERENTIAL PRESSURE ALARMS",
        [
            "ALARM CODE E044: Filter Differential Alert. Trigger: intake air filter differential pressure "
            "switch DPS-AIR reads above 0.35 bar, indicating a clogged intake filter element restricting "
            "compressor inlet airflow.",
            "Probable root causes of E044: (1) intake filter element AF-90 saturated with dust and overdue "
            "for replacement, (2) differential pressure switch DPS-AIR miscalibrated or its sensing line "
            "pinched, (3) intake housing gasket failure allowing unfiltered bypass air, which can trigger "
            "the alarm intermittently.",
            "Corrective Action Procedure for E044: Step 1 - shut down the compressor and lock out the main "
            "disconnect. Step 2 - remove the intake filter housing cover and replace filter element AF-90; "
            "inspect the housing gasket for cracking and replace if damaged. Step 3 - reset the differential "
            "pressure switch DPS-AIR and verify it reads near 0 bar with a clean element installed. Step 4 - "
            "restart the compressor and confirm the alarm clears within the first loaded cycle.",
        ],
    )
    mb.filler_until(79, prefix="3-6")
    return mb


def main():
    jobs = [
        (build_hp200_service_manual, "hp200_service_manual.pdf"),
        (build_hydraulic_system_guide, "hydraulic_system_guide.pdf"),
        (build_mx40_manual, "mx40_manual.pdf"),
        (build_ac90_manual, "ac90_manual.pdf"),
    ]
    for builder_fn, filename in jobs:
        mb = builder_fn()
        out_path = os.path.join(OUT_DIR, filename)
        mb.save(out_path)
        print(f"Wrote {out_path} ({mb.page_count} pages)")


if __name__ == "__main__":
    main()
