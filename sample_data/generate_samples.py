import os
import json
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak


def ensure_dirs():
    os.makedirs("sample_data/policies", exist_ok=True)
    os.makedirs("sample_data/invoices", exist_ok=True)


def build_standard_policy():
    pdf_path = "sample_data/policies/standard_auto_policy.pdf"
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1E3A8A'),
        alignment=1
    )
    h2_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E40AF'),
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        spaceBefore=3,
        spaceAfter=4
    )

    story = [
        Paragraph("CLAIMFLOW ASSURANCE GROUP", title_style),
        Paragraph("Personal Auto Insurance Policy - Form CF-PA-2026", ParagraphStyle('Sub', parent=body_style, alignment=1, textColor=colors.gray)),
        Spacer(1, 15),
        Paragraph("<b>POLICY DECLARATIONS PAGE</b>", h2_style),
        Paragraph("<b>Policy Number:</b> POL-882910 &nbsp;&nbsp;|&nbsp;&nbsp; <b>Policy Period:</b> 2026-01-01 to 2027-01-01", body_style),
        Paragraph("<b>Named Insured:</b> Alex Mercer &nbsp;&nbsp;|&nbsp;&nbsp; <b>Covered Vehicle:</b> 2023 Honda Civic EX (VIN: 1HGCR2F83HA001234)", body_style),
        Paragraph("<b>Collision Coverage Limit:</b> $50,000 &nbsp;&nbsp;|&nbsp;&nbsp; <b>Deductible:</b> $500.00", body_style),
        Paragraph("<b>Comprehensive Limit:</b> $50,000 &nbsp;&nbsp;|&nbsp;&nbsp; <b>Deductible:</b> $500.00", body_style),
        Spacer(1, 10),
        Paragraph("<b>SECTION 1 — COVERAGE AGREEMENT: COLLISION COVERAGE</b>", h2_style),
        Paragraph("<b>1.A Insuring Agreement:</b> We will pay for direct, sudden, and accidental loss to your covered auto caused by collision with another object, subject to the limit of liability shown in the Declarations, minus the applicable deductible. Coverage applies strictly while operating on lawful public roadways or private thoroughfares within the policy territory.", body_style),
        Paragraph("<b>1.B Deductible:</b> Our obligation to pay for repair or replacement of the covered auto applies only to the amount of loss that exceeds the deductible amount shown in the Declarations ($500.00).", body_style),
        Spacer(1, 10),
        Paragraph("<b>SECTION 2 — COMPREHENSIVE (OTHER THAN COLLISION)</b>", h2_style),
        Paragraph("<b>2.A Insuring Agreement:</b> We will pay for direct and accidental loss to your covered auto caused by theft, vandalism, glass breakage, windstorm, flood, hail, or direct contact with a bird or animal. The comprehensive deductible ($500.00) applies to each incident.", body_style),
        Spacer(1, 10),
        Paragraph("<b>SECTION 3 — GENERAL POLICY EXCLUSIONS</b>", h2_style),
        Paragraph("We do not provide coverage under this policy for any loss or damage arising out of, or resulting from, any of the following:", body_style),
        Paragraph("<b>3.A Wear and Tear:</b> Mechanical breakdown, electrical failure, road wear, freeze, or manufacturer defect.", body_style),
        Paragraph("<b>3.B Street Racing and Speed Contests:</b> This policy explicitly excludes any damage or liability resulting from prearranged, organized, or impromptu street racing, drag racing, speed contests, drifting, or stunting maneuvers, whether on a closed course, racetrack, or public highway.", body_style),
        Paragraph("<b>3.C Commercial Delivery & Rideshare:</b> While the vehicle is being operated for a fee, ride-sharing (Uber/Lyft), courier delivery, or commercial transport, unless an active commercial endorsement has been purchased.", body_style),
        Paragraph("<b>3.D Intentional Damage:</b> Any loss or destruction intentionally caused by or at the direction of the insured.", body_style),
        Spacer(1, 10),
        Paragraph("<b>SECTION 4 — SUBROGATION AND RECOVERY RIGHTS</b>", h2_style),
        Paragraph("<b>4.A Right of Subrogation:</b> If we make any payment under this policy and the person to or for whom payment was made has a right to recover damages from another third party or insurance carrier, we shall be subrogated to that right. The insured person must cooperate fully with us, execute all recovery instruments, and do nothing after loss to prejudice our rights.", body_style),
    ]
    doc.build(story)


def build_comprehensive_plus_policy():
    pdf_path = "sample_data/policies/comprehensive_plus_policy.pdf"
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=colors.HexColor('#065F46'), alignment=1)
    h2_style = ParagraphStyle('SectionHeading', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=colors.HexColor('#047857'), spaceBefore=10, spaceAfter=4)
    body_style = ParagraphStyle('DocBody', parent=styles['BodyText'], fontName='Helvetica', fontSize=9.5, leading=13, spaceBefore=3, spaceAfter=4)

    story = [
        Paragraph("CLAIMFLOW ASSURANCE GROUP", title_style),
        Paragraph("Comprehensive Plus Auto Policy - Form CF-CAP-PLUS", ParagraphStyle('Sub', parent=body_style, alignment=1, textColor=colors.gray)),
        Spacer(1, 15),
        Paragraph("<b>POLICY DECLARATIONS PAGE</b>", h2_style),
        Paragraph("<b>Policy Number:</b> POL-994102 &nbsp;&nbsp;|&nbsp;&nbsp; <b>Policy Period:</b> 2026-03-01 to 2027-03-01", body_style),
        Paragraph("<b>Named Insured:</b> Jordan Kelly &nbsp;&nbsp;|&nbsp;&nbsp; <b>Covered Vehicle:</b> 2024 Toyota Camry XSE (VIN: 4T1B11HK5JU543210)", body_style),
        Paragraph("<b>Collision Coverage Limit:</b> $100,000 &nbsp;&nbsp;|&nbsp;&nbsp; <b>Deductible:</b> $250.00", body_style),
        Paragraph("<b>Comprehensive Limit:</b> $100,000 &nbsp;&nbsp;|&nbsp;&nbsp; <b>Deductible:</b> $250.00", body_style),
        Paragraph("<b>OEM Replacement Endorsement:</b> ACTIVE &nbsp;&nbsp;|&nbsp;&nbsp; <b>Roadside Concierge:</b> INCLUDED", body_style),
        Spacer(1, 10),
        Paragraph("<b>SECTION 1 — PREMIUM PHYSICAL DAMAGE COVERAGE</b>", h2_style),
        Paragraph("<b>1.A Collision & Comprehensive:</b> We will cover direct physical damage with Original Equipment Manufacturer (OEM) parts authorization when certified. Deductible is $250.00.", body_style),
        Spacer(1, 10),
        Paragraph("<b>SECTION 2 — EXCLUSIONS</b>", h2_style),
        Paragraph("<b>2.A Speed Contests:</b> Prearranged or impromptu speed trials or drag racing are strictly excluded from coverage.", body_style),
        Paragraph("<b>2.B Fraudulent or Exaggerated Claims:</b> Any deliberate inflation of repair estimates or misrepresentation of impact cause voids coverage.", body_style),
        Spacer(1, 10),
        Paragraph("<b>SECTION 3 — THIRD-PARTY SUBROGATION ASSIGNMENT</b>", h2_style),
        Paragraph("ClaimFlow Insurance reserves all legal rights to demand indemnification from at-fault third parties and their carriers.", body_style),
    ]
    doc.build(story)


def generate_invoice_pdf(filename: str, shop_name: str, invoice_no: str, date: str, vehicle_info: str, line_items: list, notes: str):
    pdf_path = os.path.join("sample_data/invoices", filename)
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()

    header_style = ParagraphStyle('ShopHeader', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=14, leading=18, textColor=colors.HexColor('#1E293B'))
    meta_style = ParagraphStyle('Meta', parent=styles['BodyText'], fontName='Helvetica', fontSize=9, leading=12)

    total_amount = sum(item[3] for item in line_items)

    table_data = [["Line Item Description", "Category", "Hours / Units", "Amount ($)"]]
    for item in line_items:
        table_data.append([item[0], item[1], str(item[2]), f"${item[3]:.2f}"])
    table_data.append(["TOTAL INVOICE AMOUNT", "", "", f"${total_amount:.2f}"])

    t = Table(table_data, colWidths=[240, 100, 90, 90])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -2), 0.5, colors.HexColor('#CBD5E1')),
        ('LINEABOVE', (0, -1), (-1, -1), 1.5, colors.HexColor('#0F172A')),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ]))

    story = [
        Paragraph(f"<b>{shop_name}</b>", header_style),
        Paragraph("ASE Certified Auto Collision & Structural Repair Facility", meta_style),
        Spacer(1, 10),
        Paragraph(f"<b>Invoice #:</b> {invoice_no} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Date:</b> {date}", meta_style),
        Paragraph(f"<b>Vehicle:</b> {vehicle_info}", meta_style),
        Spacer(1, 12),
        t,
        Spacer(1, 15),
        Paragraph("<b>Repair Technician Incident Notes:</b>", ParagraphStyle('NotesHead', parent=meta_style, fontName='Helvetica-Bold')),
        Paragraph(notes, meta_style),
    ]
    doc.build(story)


def generate_all_samples():
    ensure_dirs()
    print("Generating Specimen Policies...")
    build_standard_policy()
    build_comprehensive_plus_policy()

    print("Generating Invoice PDFs for 4 Scenarios...")
    # Scenario 1: Clean STP Auto-Approve ($1,350)
    generate_invoice_pdf(
        filename="scenario_1_clean_bumper.pdf",
        shop_name="Reliable Collision Center",
        invoice_no="INV-2026-101",
        date="2026-11-08",
        vehicle_info="2024 Toyota Camry XSE (VIN: 4T1B11HK5JU543210)",
        line_items=[
            ["Front Bumper Cover", "parts", 1, 650.00],
            ["Lower Grille Assembly", "parts", 1, 250.00],
            ["Body Labor", "labor", 3.75, 300.00],
            ["Paint Labor", "paint", 2.0, 150.00]
        ],
        notes="Low-speed bumper tap against a parking post. No mechanical or chassis damage detected."
    )

    # Scenario 2: Policy Exclusion - Street Racing ($3,200)
    generate_invoice_pdf(
        filename="scenario_2_racing_engine.pdf",
        shop_name="Apex Performance & Tuning Bodyworks",
        invoice_no="INV-2026-202",
        date="2026-11-10",
        vehicle_info="2023 Honda Civic EX (VIN: 1HGCR2F83HA001234)",
        line_items=[
            ["Front Bumper Cover", "parts", 1, 650.00],
            ["Engine Intercooler", "parts", 1, 1200.00],
            ["Body Labor", "labor", 10.0, 850.00],
            ["Paint Labor", "paint", 6.25, 500.00]
        ],
        notes="Heavy front-end collision damage sustained during an impromptu street racing contest along Industrial Parkway."
    )

    # Scenario 3: Suspicious Fraud - Roof/Frame Discrepancy ($6,800)
    generate_invoice_pdf(
        filename="scenario_3_inflated_roof.pdf",
        shop_name="Premier Prestige Restorations",
        invoice_no="INV-2026-303",
        date="2026-11-12",
        vehicle_info="2022 Ford Fusion (VIN: 3FA6P0H78HR109876)",
        line_items=[
            ["Side Mirror Assembly", "parts", 1, 350.00],
            ["Roof Panel Assembly", "parts", 1, 2800.00],
            ["Frame Alignment Labor", "labor", 16.0, 2400.00],
            ["Paint Labor", "paint", 12.5, 1250.00]
        ],
        notes="Invoice submitted for total roof replacement, full unibody frame realignment, and complete respray following side mirror brush."
    )

    # Scenario 4: Subrogation - Commercial Truck ($2,400)
    generate_invoice_pdf(
        filename="scenario_4_truck_rear_end.pdf",
        shop_name="Metro Fleet & Collision Specialists",
        invoice_no="INV-2026-404",
        date="2026-11-05",
        vehicle_info="2023 Chevrolet Malibu (VIN: 1G1BE5SM7H7123987)",
        line_items=[
            ["Rear Bumper Cover", "parts", 1, 600.00],
            ["Trunk Lid Assembly", "parts", 1, 900.00],
            ["Body Labor", "labor", 7.5, 600.00],
            ["Paint Labor", "paint", 4.0, 300.00]
        ],
        notes="Rear impact damage caused when policyholder vehicle was struck at stationary red light by an Apex Freight Logistics commercial truck."
    )

    # Generate demo_scenarios.json
    scenarios_data = [
        {
            "scenario_id": "scenario_1",
            "name": "Scenario 1: Clean STP Auto-Approve",
            "tag": "STP Auto-Approved",
            "badge_color": "emerald",
            "policy_number": "POL-882910",
            "claimant_name": "Jordan Kelly",
            "vehicle_vin": "4T1B11HK5JU543210",
            "incident_date": "2026-11-08",
            "policy_bound_date": "2026-01-01",
            "invoice_file": "sample_data/invoices/scenario_1_clean_bumper.pdf",
            "claimed_amount": 1350.00,
            "deductible": 500.00,
            "narrative": "I was pulling into my parking spot at the grocery store and bumped into a concrete bollard at 5 mph. Damaged the front bumper cover and plastic lower grille.",
            "expected_outcome": "APPROVED_STP",
            "expected_payout": 850.00,
            "expected_reason": "Active policy, valid loss type, low fraud risk (12), payout under $2,000 threshold ($850 net), no subrogation opportunity."
        },
        {
            "scenario_id": "scenario_2",
            "name": "Scenario 2: Policy Exclusion (Street Racing)",
            "tag": "Policy Exclusion / Deny",
            "badge_color": "amber",
            "policy_number": "POL-882910",
            "claimant_name": "Alex Mercer",
            "vehicle_vin": "1HGCR2F83HA001234",
            "incident_date": "2026-11-10",
            "policy_bound_date": "2026-01-01",
            "invoice_file": "sample_data/invoices/scenario_2_racing_engine.pdf",
            "claimed_amount": 3200.00,
            "deductible": 500.00,
            "narrative": "I was participating in an impromptu street racing drag pull on Industrial Boulevard when my vehicle collided with a barrier wall. Damaged bumper and intercooler.",
            "expected_outcome": "PENDING_HITL",
            "expected_payout": 0.00,
            "expected_reason": "Section 3.B explicitly excludes street racing, speed contests, and drag pulls. Pauses for adjuster review (never auto-denies without human sign-off)."
        },
        {
            "scenario_id": "scenario_3",
            "name": "Scenario 3: Suspicious Fraud (Inflated Repair)",
            "tag": "SIU Fraud Alert",
            "badge_color": "rose",
            "policy_number": "POL-771920",
            "claimant_name": "Tyler Henderson",
            "vehicle_vin": "3FA6P0H78HR109876",
            "incident_date": "2026-11-12",
            "policy_bound_date": "2026-11-08",
            "invoice_file": "sample_data/invoices/scenario_3_inflated_roof.pdf",
            "claimed_amount": 6800.00,
            "deductible": 500.00,
            "narrative": "I brushed against a neighborhood mailbox which snapped off the passenger side mirror.",
            "expected_outcome": "PENDING_HITL",
            "expected_payout": 0.00,
            "expected_reason": "Policy bound 4 days prior to crash; severe narrative mismatch (mailbox brush vs. $5,200 billed for roof panel and frame alignment). Fraud score > 70. Recommends SIU referral."
        },
        {
            "scenario_id": "scenario_4",
            "name": "Scenario 4: Third-Party Subrogation",
            "tag": "Subrogation Recovery",
            "badge_color": "indigo",
            "policy_number": "POL-882910",
            "claimant_name": "Morgan Riley",
            "vehicle_vin": "1G1BE5SM7H7123987",
            "incident_date": "2026-11-05",
            "policy_bound_date": "2026-01-01",
            "invoice_file": "sample_data/invoices/scenario_4_truck_rear_end.pdf",
            "claimed_amount": 2400.00,
            "deductible": 500.00,
            "narrative": "I was stopped at a red light at 5th & Elm. An Apex Freight Logistics commercial truck failed to stop in time and rear-ended my car. Police Officer Davis cited the commercial truck driver for failure to stop (Citation TR-88192).",
            "expected_outcome": "PENDING_HITL",
            "expected_payout": 1900.00,
            "expected_reason": "High subrogation recovery opportunity against commercial freight carrier. Net payout >= $2,000 threshold or high subro flags HITL pause for adjuster subro referral packet."
        }
    ]

    with open("sample_data/demo_scenarios.json", "w") as f:
        json.dump(scenarios_data, f, indent=2)

    print("All sample policies, invoices, and scenarios generated successfully!")


if __name__ == "__main__":
    generate_all_samples()
