import os
from PIL import Image, ImageDraw, ImageFont

DIR = "apps/web/public/templates"
os.makedirs(f"{DIR}/jpg", exist_ok=True)
os.makedirs(f"{DIR}/thumb", exist_ok=True)
os.makedirs(f"{DIR}/pdf", exist_ok=True)

# Target sizes
JPG_SIZE = (600, 848)
THUMB_SIZE = (596, 843)
SMALL_SIZE = (300, 424)

# Canvas at 2x for crisp antialiased rendering
W, H = 1200, 1696
MARGIN_X = 80
MARGIN_Y = 70
CONTENT_W = W - 2 * MARGIN_X

# Load system fonts if possible, or fallback to default
def get_font(size, bold=False, serif=False):
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf" if (bold and serif) else "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf" if serif else None,
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf" if (bold and serif) else "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf" if serif else None,
    ]
    for p in font_paths:
        if p and os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def draw_bullet(draw, x, y, radius=3, color=(51, 65, 85)):
    r = int(radius)
    draw.ellipse([x - r, y - r, x + r, y + r], fill=color)

# 1. HARVARD CLASSIC
def render_harvard():
    im = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)
    
    primary = (15, 23, 42)
    ink = (30, 41, 59)
    ink_muted = (71, 85, 105)
    border_color = (15, 23, 42)
    
    font_title = get_font(36, bold=True, serif=True)
    font_contact = get_font(15, bold=False, serif=True)
    font_heading = get_font(20, bold=True, serif=True)
    font_item_title = get_font(17, bold=True, serif=True)
    font_item_sub = get_font(15, bold=False, serif=True)
    font_body = get_font(15, bold=False, serif=True)
    
    y = MARGIN_Y + 10
    
    name = "VICTORIA STERLING"
    bbox = draw.textbbox((0, 0), name, font=font_title)
    draw.text(((W - (bbox[2] - bbox[0])) // 2, y), name, fill=primary, font=font_title)
    y += 44
    
    contact = "Cambridge, MA  |  v.sterling@post.harvard.edu  |  (555) 839-2041  |  linkedin.com/in/victoriasterling"
    bbox = draw.textbbox((0, 0), contact, font=font_contact)
    draw.text(((W - (bbox[2] - bbox[0])) // 2, y), contact, fill=ink_muted, font=font_contact)
    y += 36
    
    def section(title_text):
        nonlocal y
        draw.text((MARGIN_X, y), title_text, fill=primary, font=font_heading)
        y += 26
        draw.line([(MARGIN_X, y), (W - MARGIN_X, y)], fill=border_color, width=1)
        y += 16
        
    section("EDUCATION")
    draw.text((MARGIN_X, y), "Harvard Law School", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2020 – 2023", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "Juris Doctor (J.D.) — Magna Cum Laude; Editor, Harvard Law Review", fill=ink_muted, font=font_item_sub)
    draw.text((W - MARGIN_X - 160, y), "Cambridge, MA", fill=ink_muted, font=font_item_sub)
    y += 32
    
    draw.text((MARGIN_X, y), "Harvard College", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2016 – 2020", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "Bachelor of Arts in Economics & Philosophy — Summa Cum Laude, Phi Beta Kappa", fill=ink_muted, font=font_item_sub)
    draw.text((W - MARGIN_X - 160, y), "Cambridge, MA", fill=ink_muted, font=font_item_sub)
    y += 36
    
    section("EXPERIENCE")
    draw.text((MARGIN_X, y), "Sullivan & Cromwell LLP", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2023 – Present", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "Corporate Associate — Mergers & Acquisitions", fill=ink, font=font_item_sub)
    draw.text((W - MARGIN_X - 160, y), "New York, NY", fill=ink_muted, font=font_item_sub)
    y += 26
    b1 = [
        "Advised Fortune 100 enterprise clients on cross-border public acquisitions and divestitures totaling over $14.2B in aggregate transaction value.",
        "Conducted regulatory due diligence and drafted definitive merger agreements, disclosure schedules, and Hart-Scott-Rodino antitrust filings.",
        "Coordinated multi-disciplinary legal teams across debt financing, tax structuring, intellectual property, and executive compensation workstreams."
    ]
    for b in b1:
        draw_bullet(draw, MARGIN_X + 10, y + 10, radius=3, color=primary)
        draw.text((MARGIN_X + 24, y), b, fill=ink, font=font_body)
        y += 24
    y += 18
    
    draw.text((MARGIN_X, y), "U.S. Court of Appeals for the Second Circuit", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2022 – 2023", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "Judicial Law Clerk to Chief Judge", fill=ink, font=font_item_sub)
    draw.text((W - MARGIN_X - 160, y), "New York, NY", fill=ink_muted, font=font_item_sub)
    y += 26
    b2 = [
        "Researched complex questions of statutory interpretation, administrative law, securities regulation, and constitutional jurisprudence.",
        "Prepared comprehensive bench memoranda and drafted published appellate opinions across commercial litigation and civil appeals."
    ]
    for b in b2:
        draw_bullet(draw, MARGIN_X + 10, y + 10, radius=3, color=primary)
        draw.text((MARGIN_X + 24, y), b, fill=ink, font=font_body)
        y += 24
    y += 18
    
    section("PUBLICATIONS & CREDENTIALS")
    draw.text((MARGIN_X, y), "Admitted to the Bar: New York State Appellate Division (First Department, 2023)", fill=ink, font=font_body)
    y += 24
    draw.text((MARGIN_X, y), "Publication: \"Cross-Border Antitrust Remedies in Digital Platform Mergers\" — Harvard Law Review (136 Harv. L. Rev. 412)", fill=ink, font=font_body)
    
    return im

# 2. SILICON TECH LEAD
def render_silicon():
    im = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)
    
    accent = (37, 99, 235)
    ink = (15, 23, 42)
    ink_muted = (71, 85, 105)
    border_subtle = (226, 232, 240)
    
    font_name = get_font(36, bold=True)
    font_title = get_font(19, bold=False)
    font_contact = get_font(15, bold=False)
    font_heading = get_font(20, bold=True)
    font_item_title = get_font(17, bold=True)
    font_item_sub = get_font(15, bold=False)
    font_body = get_font(15, bold=False)
    
    y = MARGIN_Y + 10
    
    draw.text((MARGIN_X, y), "Jordan Chen", fill=ink, font=font_name)
    y += 44
    draw.text((MARGIN_X, y), "Staff Software Engineer — Distributed Systems & Cloud Platforms", fill=accent, font=font_title)
    y += 30
    
    contact = "Seattle, WA  •  (555) 781-9234  •  jordan.chen@dev.io  •  github.com/jordanchen  •  linkedin.com/in/jordanchen"
    draw.text((MARGIN_X, y), contact, fill=ink_muted, font=font_contact)
    y += 32
    draw.line([(MARGIN_X, y), (W - MARGIN_X, y)], fill=border_subtle, width=2)
    y += 24
    
    def section(title_text):
        nonlocal y
        draw.rectangle([MARGIN_X, y - 2, MARGIN_X + 6, y + 26], fill=accent)
        draw.text((MARGIN_X + 16, y), title_text, fill=ink, font=font_heading)
        draw.line([(MARGIN_X, y + 32), (W - MARGIN_X, y + 32)], fill=border_subtle, width=1)
        y += 46
        
    section("TECHNICAL SKILLS")
    skills_map = [
        ("Languages:", "TypeScript, Go, Python, Rust, SQL, Bash, C++"),
        ("Frontend & UI:", "React, Next.js, Vite, Tailwind CSS, TanStack Router/Query, WebGL"),
        ("Backend & Cloud:", "Node.js, Hono, PostgreSQL, Redis, Kafka, Docker, Kubernetes, AWS (ECS, S3, RDS, Lambda)"),
        ("Architecture:", "Distributed Consensus (Raft), Microservices, High-Throughput Ingestion, Event Sourcing")
    ]
    for label, val in skills_map:
        draw.text((MARGIN_X, y), label, fill=accent, font=font_item_title)
        draw.text((MARGIN_X + 180, y), val, fill=ink, font=font_body)
        y += 26
    y += 14
    
    section("EXPERIENCE")
    draw.text((MARGIN_X, y), "Staff Software Engineer", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2022 – Present", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "CloudScale Distributed Systems", fill=accent, font=font_item_sub)
    draw.text((W - MARGIN_X - 160, y), "Seattle, WA", fill=ink_muted, font=font_item_sub)
    y += 26
    b1 = [
        "Architected and deployed high-throughput event ingestion pipeline in Go and Kafka handling 85M+ events/day with 99.99% uptime.",
        "Refactored legacy monolith service into modular TypeScript microservices, reducing p99 API response latencies from 420ms to 65ms.",
        "Spearheaded multi-tenant Redis caching layer cutting relational DB query volume by 62% during peak seasonal traffic spikes.",
        "Automated end-to-end containerized CI/CD testing suites in GitHub Actions, slashing release deployment cycles from 4 days to 45 mins."
    ]
    for b in b1:
        draw_bullet(draw, MARGIN_X + 10, y + 10, radius=3, color=accent)
        draw.text((MARGIN_X + 24, y), b, fill=ink, font=font_body)
        y += 24
    y += 14
    
    draw.text((MARGIN_X, y), "Senior Full Stack Software Engineer", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2019 – 2022", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "Nexus DataStream Platforms", fill=accent, font=font_item_sub)
    draw.text((W - MARGIN_X - 160, y), "San Francisco, CA", fill=ink_muted, font=font_item_sub)
    y += 26
    b2 = [
        "Engineered real-time analytics dashboards in React and TypeScript serving 140,000+ monthly active enterprise business users.",
        "Designed REST and WebSocket data feeds supporting collaborative document editing with conflict-free replicated data types.",
        "Integrated secure SSO authentication (OAuth 2.0 / SAML) reducing user onboarding friction and support ticket volume by 44%."
    ]
    for b in b2:
        draw_bullet(draw, MARGIN_X + 10, y + 10, radius=3, color=accent)
        draw.text((MARGIN_X + 24, y), b, fill=ink, font=font_body)
        y += 24
    y += 14
    
    section("EDUCATION")
    draw.text((MARGIN_X, y), "University of Washington", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2015 – 2019", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "B.S. in Computer Science & Engineering — Dean's Honors List", fill=ink_muted, font=font_item_sub)
    
    return im

# 3. MCKINSEY CONSULTANT
def render_mckinsey():
    im = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)
    
    primary = (15, 23, 42)
    accent = (14, 116, 144)
    ink = (30, 41, 59)
    ink_muted = (71, 85, 105)
    
    font_name = get_font(34, bold=True)
    font_title = get_font(18, bold=False)
    font_contact = get_font(15, bold=False)
    font_heading = get_font(20, bold=True)
    font_item_title = get_font(17, bold=True)
    font_item_sub = get_font(15, bold=False)
    font_body = get_font(15, bold=False)
    
    y = MARGIN_Y + 12
    
    name = "MARCUS VANDENBERG"
    draw.text((MARGIN_X, y), name, fill=primary, font=font_name)
    y += 44
    draw.text((MARGIN_X, y), "Engagement Manager — Strategy, Operations & Private Equity Due Diligence", fill=accent, font=font_title)
    y += 28
    draw.text((MARGIN_X, y), "Chicago, IL  |  marcus.vandenberg@alumni.kellogg.edu  |  (555) 492-1830  |  linkedin.com/in/marcusvandenberg", fill=ink_muted, font=font_contact)
    y += 32
    draw.line([(MARGIN_X, y), (W - MARGIN_X, y)], fill=primary, width=3)
    y += 20
    
    def section(title_text):
        nonlocal y
        draw.text((MARGIN_X, y), title_text, fill=primary, font=font_heading)
        y += 28
        draw.line([(MARGIN_X, y), (W - MARGIN_X, y)], fill=(203, 213, 225), width=1)
        y += 18
        
    section("EXPERIENCE")
    draw.text((MARGIN_X, y), "McKinsey & Company", fill=primary, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2021 – Present", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "Engagement Manager — Private Equity & Corporate Strategy", fill=accent, font=font_item_sub)
    draw.text((W - MARGIN_X - 160, y), "Chicago, IL", fill=ink_muted, font=font_item_sub)
    y += 26
    b1 = [
        "Led 8 commercial due diligence engagements for top-tier buyout PE sponsors across $4.8B in targeted enterprise SaaS and industrial assets.",
        "Formulated zero-based budgeting transformation for a $3.2B multinational retailer, unlocking $210M in run-rate EBITDA savings over 18 months.",
        "Managed cross-functional client teams of 25+ across North America and Europe, presenting strategic roadmaps directly to C-suite and Board members."
    ]
    for b in b1:
        draw_bullet(draw, MARGIN_X + 10, y + 10, radius=3, color=primary)
        draw.text((MARGIN_X + 24, y), b, fill=ink, font=font_body)
        y += 24
    y += 16
    
    draw.text((MARGIN_X, y), "Boston Consulting Group (BCG)", fill=primary, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2018 – 2021", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "Senior Consultant — Operations & Supply Chain", fill=accent, font=font_item_sub)
    draw.text((W - MARGIN_X - 160, y), "Boston, MA", fill=ink_muted, font=font_item_sub)
    y += 26
    b2 = [
        "Optimized global distribution network across 14 fulfilment hubs, improving order fulfillment velocity by 34% and cutting transport costs by $28M.",
        "Developed pricing elasticity algorithms for medtech equipment manufacturer, driving 420 bps expansion in gross margin within 2 quarters."
    ]
    for b in b2:
        draw_bullet(draw, MARGIN_X + 10, y + 10, radius=3, color=primary)
        draw.text((MARGIN_X + 24, y), b, fill=ink, font=font_body)
        y += 24
    y += 18
    
    section("EDUCATION")
    draw.text((MARGIN_X, y), "Kellogg School of Management, Northwestern University", fill=primary, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2016 – 2018", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "Master of Business Administration (MBA) — Dean's Distinguished Scholar", fill=ink_muted, font=font_item_sub)
    y += 32
    
    draw.text((MARGIN_X, y), "University of Notre Dame", fill=primary, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2010 – 2014", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "B.S. in Finance & Economics — Summa Cum Laude", fill=ink_muted, font=font_item_sub)
    
    return im

# 4. STANFORD EXECUTIVE
def render_stanford():
    im = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)
    
    primary = (140, 29, 64) # Stanford cardinal burgundy
    ink = (30, 41, 59)
    ink_muted = (71, 85, 105)
    border_color = (203, 213, 225)
    
    font_title = get_font(38, bold=True)
    font_sub = get_font(20, bold=False)
    font_contact = get_font(15, bold=False)
    font_heading = get_font(22, bold=True)
    font_item_title = get_font(18, bold=True)
    font_item_sub = get_font(16, bold=False)
    font_body = get_font(15, bold=False)
    
    draw.rectangle([MARGIN_X, MARGIN_Y, W - MARGIN_X, MARGIN_Y + 8], fill=primary)
    y = MARGIN_Y + 32
    
    name = "ALEXANDER WRIGHT"
    bbox = draw.textbbox((0, 0), name, font=font_title)
    draw.text(((W - (bbox[2] - bbox[0])) // 2, y), name, fill=ink, font=font_title)
    y += 46
    
    title = "Chief Operating Officer • VP of Global Enterprise Strategy"
    bbox = draw.textbbox((0, 0), title, font=font_sub)
    draw.text(((W - (bbox[2] - bbox[0])) // 2, y), title, fill=primary, font=font_sub)
    y += 32
    
    contact = "Palo Alto, CA  |  alex.wright@executive-tech.io  |  (555) 392-1048  |  linkedin.com/in/alexwright"
    bbox = draw.textbbox((0, 0), contact, font=font_contact)
    draw.text(((W - (bbox[2] - bbox[0])) // 2, y), contact, fill=ink_muted, font=font_contact)
    y += 40
    
    def section(title_text):
        nonlocal y
        draw.text((MARGIN_X, y), title_text, fill=primary, font=font_heading)
        y += 30
        draw.line([(MARGIN_X, y), (W - MARGIN_X, y)], fill=primary, width=3)
        y += 16
        
    section("EXECUTIVE PROFILE")
    summary = (
        "Accomplished executive leader with 15+ years scaling enterprise operations from $20M to $250M+ ARR. Proven track record\n"
        "aligning global cross-functional teams, executing M&A integrations, and optimizing operational efficiency across multi-region\n"
        "business units while maintaining 98%+ customer retention and disciplined capital allocation."
    )
    for line in summary.split("\n"):
        draw.text((MARGIN_X, y), line, fill=ink, font=font_body)
        y += 22
    y += 18
    
    section("PROFESSIONAL EXPERIENCE")
    draw.text((MARGIN_X, y), "TechCorp International", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 180, y), "2021 – Present", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "Chief Operating Officer", fill=primary, font=font_item_sub)
    draw.text((W - MARGIN_X - 180, y), "San Francisco, CA", fill=ink_muted, font=font_item_sub)
    y += 26
    bullets1 = [
        "Directed global operations and 320+ personnel across North America, EMEA, and APAC divisions with full P&L accountability.",
        "Engineered restructuring plan reducing operating expenditure by $18.4M annually without impacting headcount or SLA delivery.",
        "Spearheaded acquisition and post-merger integration of two SaaS startups within 9 months, accelerating pipeline growth by 38%."
    ]
    for b in bullets1:
        draw_bullet(draw, MARGIN_X + 12, y + 10, radius=3, color=primary)
        draw.text((MARGIN_X + 28, y), b, fill=ink, font=font_body)
        y += 24
    y += 16
    
    section("EDUCATION")
    draw.text((MARGIN_X, y), "Stanford University Graduate School of Business", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 180, y), "2014 – 2016", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "Master of Business Administration (MBA) — Strategy & Operations", fill=ink_muted, font=font_item_sub)
    
    return im

# 5. WALL STREET FINANCE
def render_wall_street():
    im = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)
    
    primary = (15, 23, 42)
    ink = (30, 41, 59)
    ink_muted = (71, 85, 105)
    border_color = (15, 23, 42)
    
    font_title = get_font(34, bold=True, serif=True)
    font_contact = get_font(15, bold=False, serif=True)
    font_heading = get_font(19, bold=True, serif=True)
    font_item_title = get_font(16, bold=True, serif=True)
    font_item_sub = get_font(15, bold=False, serif=True)
    font_body = get_font(14, bold=False, serif=True)
    
    y = MARGIN_Y + 8
    name = "CHRISTOPHER J. MORGAN"
    bbox = draw.textbbox((0, 0), name, font=font_title)
    draw.text(((W - (bbox[2] - bbox[0])) // 2, y), name, fill=primary, font=font_title)
    y += 40
    
    contact = "New York, NY  •  (212) 555-0192  •  c.morgan@wharton.upenn.edu  •  linkedin.com/in/chrisk-morgan"
    bbox = draw.textbbox((0, 0), contact, font=font_contact)
    draw.text(((W - (bbox[2] - bbox[0])) // 2, y), contact, fill=ink_muted, font=font_contact)
    y += 32
    
    def section(title_text):
        nonlocal y
        draw.text((MARGIN_X, y), title_text, fill=primary, font=font_heading)
        y += 24
        draw.line([(MARGIN_X, y), (W - MARGIN_X, y)], fill=border_color, width=1)
        y += 14
        
    section("EXPERIENCE")
    draw.text((MARGIN_X, y), "Goldman Sachs & Co.", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2021 – Present", fill=ink_muted, font=font_item_title)
    y += 22
    draw.text((MARGIN_X, y), "Investment Banking Associate — Technology, Media & Telecom (TMT)", fill=ink, font=font_item_sub)
    draw.text((W - MARGIN_X - 160, y), "New York, NY", fill=ink_muted, font=font_item_sub)
    y += 24
    b1 = [
        "Executed 7 closed transactions including M&A buy-side, IPO advisory, and convertible debt financing totaling $11.8B.",
        "Constructed complex discounted cash flow (DCF), leveraged buyout (LBO), and accretion/dilution financial models.",
        "Authored comprehensive board pitch materials and fairness opinions delivered to executive leadership of Fortune 500 tech clients."
    ]
    for b in b1:
        draw_bullet(draw, MARGIN_X + 10, y + 8, radius=2.5, color=primary)
        draw.text((MARGIN_X + 22, y), b, fill=ink, font=font_body)
        y += 22
    y += 14
    
    draw.text((MARGIN_X, y), "Morgan Stanley", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2018 – 2021", fill=ink_muted, font=font_item_title)
    y += 22
    draw.text((MARGIN_X, y), "Investment Banking Analyst — Mergers & Acquisitions Group", fill=ink, font=font_item_sub)
    draw.text((W - MARGIN_X - 160, y), "New York, NY", fill=ink_muted, font=font_item_sub)
    y += 24
    b2 = [
        "Conducted granular valuation analyses utilizing precedent transactions, public comparables, and sum-of-the-parts methodologies.",
        "Managed virtual data rooms (VDR) and coordinated bidder due diligence inquiries across 3 sell-side auctions."
    ]
    for b in b2:
        draw_bullet(draw, MARGIN_X + 10, y + 8, radius=2.5, color=primary)
        draw.text((MARGIN_X + 22, y), b, fill=ink, font=font_body)
        y += 22
    y += 16
    
    section("EDUCATION")
    draw.text((MARGIN_X, y), "The Wharton School, University of Pennsylvania", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2014 – 2018", fill=ink_muted, font=font_item_title)
    y += 22
    draw.text((MARGIN_X, y), "B.S. in Economics, Concentrations in Finance & Statistics — Summa Cum Laude (GPA: 3.94)", fill=ink_muted, font=font_item_sub)
    
    return im

# 6. JAKE'S ATS STANDARD (r/resumes standard)
def render_jake_ats():
    im = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)
    
    primary = (0, 0, 0)
    ink = (15, 23, 42)
    ink_muted = (71, 85, 105)
    
    font_name = get_font(38, bold=True)
    font_contact = get_font(15, bold=False)
    font_heading = get_font(20, bold=True)
    font_item_title = get_font(17, bold=True)
    font_item_sub = get_font(15, bold=False)
    font_body = get_font(15, bold=False)
    
    y = MARGIN_Y + 6
    name = "JAKE MCDANIEL"
    bbox = draw.textbbox((0, 0), name, font=font_name)
    draw.text(((W - (bbox[2] - bbox[0])) // 2, y), name, fill=primary, font=font_name)
    y += 46
    
    contact = "(555) 123-4567  |  jake@mcdaniel.io  |  linkedin.com/in/jakemcdaniel  |  github.com/jakemcdaniel"
    bbox = draw.textbbox((0, 0), contact, font=font_contact)
    draw.text(((W - (bbox[2] - bbox[0])) // 2, y), contact, fill=ink_muted, font=font_contact)
    y += 34
    
    def section(title_text):
        nonlocal y
        draw.text((MARGIN_X, y), title_text, fill=primary, font=font_heading)
        y += 26
        draw.line([(MARGIN_X, y), (W - MARGIN_X, y)], fill=primary, width=1)
        y += 16
        
    section("EDUCATION")
    draw.text((MARGIN_X, y), "Southwestern University", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "Georgetown, TX", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "Bachelor of Science in Computer Science, Minor in Business", fill=ink, font=font_item_sub)
    draw.text((W - MARGIN_X - 160, y), "Aug. 2018 – May 2022", fill=ink_muted, font=font_item_sub)
    y += 34
    
    section("EXPERIENCE")
    draw.text((MARGIN_X, y), "Software Engineer", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "June 2022 – Present", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "Enterprise Solutions Inc.", fill=ink_muted, font=font_item_sub)
    draw.text((W - MARGIN_X - 160, y), "Austin, TX", fill=ink_muted, font=font_item_sub)
    y += 26
    b1 = [
        "Developed a RESTful API using Java and Spring Boot that handles over 50,000 daily active users with sub-50ms latency.",
        "Implemented automated unit tests and integration tests with JUnit and Mockito, increasing test coverage from 64% to 92%.",
        "Collaborated with UI/UX designers and product managers in an Agile Scrum environment to deliver feature releases bi-weekly."
    ]
    for b in b1:
        draw_bullet(draw, MARGIN_X + 10, y + 10, radius=3, color=primary)
        draw.text((MARGIN_X + 24, y), b, fill=ink, font=font_body)
        y += 24
    y += 16
    
    section("PROJECTS")
    draw.text((MARGIN_X, y), "Git Analytics Visualizer  |  React, TypeScript, Node.js, GitHub GraphQL API", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "Jan. 2023", fill=ink_muted, font=font_item_title)
    y += 26
    draw_bullet(draw, MARGIN_X + 10, y + 10, radius=3, color=primary)
    draw.text((MARGIN_X + 24, y), "Built open-source web application analyzing developer commit patterns, PR review turnaround, and repository health metrics.", fill=ink, font=font_body)
    y += 36
    
    section("TECHNICAL SKILLS")
    draw.text((MARGIN_X, y), "Languages: Java, Python, C/C++, SQL (PostgreSQL, MySQL), JavaScript, TypeScript, HTML/CSS", fill=ink, font=font_body)
    y += 26
    draw.text((MARGIN_X, y), "Frameworks: React, Node.js, Spring Boot, Flask, JUnit, Express, Tailwind CSS", fill=ink, font=font_body)
    y += 26
    draw.text((MARGIN_X, y), "Developer Tools: Git, Docker, AWS (S3, EC2), TravisCI, Postman, Linux/Unix", fill=ink, font=font_body)
    
    return im

# 7. LINEAR MONO
def render_linear_mono():
    im = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)
    
    accent = (37, 99, 235)
    ink = (15, 23, 42)
    ink_muted = (71, 85, 105)
    border_color = (203, 213, 225)
    
    font_name = get_font(36, bold=True)
    font_title = get_font(18, bold=False)
    font_contact = get_font(14, bold=False)
    font_heading = get_font(19, bold=True)
    font_item_title = get_font(17, bold=True)
    font_item_sub = get_font(15, bold=False)
    font_body = get_font(14, bold=False)
    
    y = MARGIN_Y + 10
    draw.text((MARGIN_X, y), "DEVIN KAUFMAN", fill=ink, font=font_name)
    y += 44
    draw.text((MARGIN_X, y), "Principal Systems Architect — Infrastructure, Kubernetes & Core Protocols", fill=accent, font=font_title)
    y += 28
    draw.text((MARGIN_X, y), "San Francisco, CA  •  devin@kaufman.tech  •  (555) 902-3814  •  github.com/dkaufman", fill=ink_muted, font=font_contact)
    y += 32
    draw.line([(MARGIN_X, y), (W - MARGIN_X, y)], fill=accent, width=2)
    y += 24
    
    def section(title_text):
        nonlocal y
        draw.text((MARGIN_X, y), title_text, fill=ink, font=font_heading)
        y += 28
        draw.line([(MARGIN_X, y), (W - MARGIN_X, y)], fill=border_color, width=1)
        y += 16
        
    section("EXPERIENCE")
    draw.text((MARGIN_X, y), "Principal Infrastructure Architect", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2021 – Present", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "Stripe / Core Infrastructure", fill=accent, font=font_item_sub)
    draw.text((W - MARGIN_X - 160, y), "San Francisco, CA", fill=ink_muted, font=font_item_sub)
    y += 26
    b1 = [
        "Architected multi-region Kubernetes control plane managing 12,000+ microservice pods across AWS and GCP environments.",
        "Cut monthly cloud compute costs by $1.4M through dynamic pod autoscaling, ARM-based spot instance fleets, and bin-packing.",
        "Implemented zero-trust mutual TLS service mesh with Envoy and SPIFFE/SPIRE for 350+ distributed internal services."
    ]
    for b in b1:
        draw_bullet(draw, MARGIN_X + 10, y + 10, radius=3, color=accent)
        draw.text((MARGIN_X + 24, y), b, fill=ink, font=font_body)
        y += 24
    y += 16
    
    section("TECHNICAL SKILLS")
    draw.text((MARGIN_X, y), "Systems & Cloud: Kubernetes, Docker, Terraform, Envoy, Cilium, AWS, GCP, Linux eBPF", fill=ink, font=font_body)
    y += 24
    draw.text((MARGIN_X, y), "Languages: Rust, Go, Python, C++, TypeScript, SQL, Bash", fill=ink, font=font_body)
    
    return im

# 8. MODERN SPLIT (2-column layout, left sidebar)
def render_modern_split():
    im = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)
    
    sidebar_w = 380
    draw.rectangle([0, 0, sidebar_w, H], fill=(241, 245, 249))
    draw.line([(sidebar_w, 0), (sidebar_w, H)], fill=(226, 232, 240), width=1)
    
    primary = (37, 99, 235)
    ink = (15, 23, 42)
    ink_muted = (71, 85, 105)
    
    font_name = get_font(32, bold=True)
    font_title = get_font(18, bold=False)
    font_heading = get_font(19, bold=True)
    font_sub = get_font(16, bold=True)
    font_body = get_font(14, bold=False)
    
    # Left sidebar content
    sx = 40
    sy = MARGIN_Y + 10
    draw.text((sx, sy), "CONTACT", fill=primary, font=font_heading)
    sy += 30
    draw.text((sx, sy), "Austin, TX\n(555) 234-8901\nsarah.jenkins@ux.io\nsarahjenkins.design", fill=ink, font=font_body)
    sy += 90
    
    draw.text((sx, sy), "SKILLS", fill=primary, font=font_heading)
    sy += 30
    skills = ["Figma & FigJam", "Design Systems", "User Research", "Wireframing", "Prototyping", "Design Ops", "HTML/CSS/JS", "Usability Testing"]
    for s in skills:
        draw_bullet(draw, sx + 6, sy + 8, radius=2.5, color=primary)
        draw.text((sx + 16, sy), s, fill=ink, font=font_body)
        sy += 24
    sy += 20
    
    draw.text((sx, sy), "EDUCATION", fill=primary, font=font_heading)
    sy += 30
    draw.text((sx, sy), "B.S. in Design", fill=ink, font=font_sub)
    sy += 20
    draw.text((sx, sy), "University of Texas, Austin\n2016 – 2020", fill=ink_muted, font=font_body)
    
    # Right main column
    mx = sidebar_w + 40
    my = MARGIN_Y + 10
    draw.text((mx, my), "SARAH JENKINS", fill=ink, font=font_name)
    my += 42
    draw.text((mx, my), "Lead Product Designer — Enterprise SaaS & Design Systems", fill=primary, font=font_title)
    my += 36
    draw.line([(mx, my), (W - 50, my)], fill=primary, width=2)
    my += 24
    
    draw.text((mx, my), "WORK EXPERIENCE", fill=ink, font=font_heading)
    my += 32
    draw.text((mx, my), "Lead Product Designer  |  CloudWave SaaS", fill=ink, font=font_sub)
    draw.text((W - 190, my), "2021 – Present", fill=ink_muted, font=font_body)
    my += 26
    b1 = [
        "Spearheaded multi-brand design system used by 60+ engineers and 12 designers across 4 product suites.",
        "Conducted 80+ customer discovery interviews, reducing onboarding churn by 28% through redesigned UX flows.",
        "Collaborated with product leadership on roadmaps, driving 4.8/5 CSAT rating on redesigned billing dashboard."
    ]
    for b in b1:
        draw_bullet(draw, mx + 8, my + 8, radius=2.5, color=primary)
        draw.text((mx + 20, my), b, fill=ink, font=font_body)
        my += 24
    my += 20
    
    draw.text((mx, my), "Senior UX/UI Designer  |  Atelier Digital", fill=ink, font=font_sub)
    draw.text((W - 190, my), "2018 – 2021", fill=ink_muted, font=font_body)
    my += 26
    b2 = [
        "Delivered end-to-end design solutions for 15+ high-growth client web applications and mobile apps.",
        "Mentored junior designers and established standard accessibility (WCAG 2.1 AA) evaluation protocols."
    ]
    for b in b2:
        draw_bullet(draw, mx + 8, my + 8, radius=2.5, color=primary)
        draw.text((mx + 20, my), b, fill=ink, font=font_body)
        my += 24
        
    return im

# 9. TOKYO COMPACT
def render_tokyo_compact():
    im = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)
    
    primary = (15, 23, 42)
    ink = (30, 41, 59)
    ink_muted = (71, 85, 105)
    
    font_name = get_font(32, bold=True)
    font_contact = get_font(14, bold=False)
    font_heading = get_font(18, bold=True)
    font_item_title = get_font(16, bold=True)
    font_item_sub = get_font(14, bold=False)
    font_body = get_font(14, bold=False)
    
    y = MARGIN_Y + 4
    draw.text((MARGIN_X, y), "KENJI TAKAHASHI", fill=primary, font=font_name)
    draw.text((W - MARGIN_X - 340, y + 10), "Tokyo, Japan  |  kenji.takahashi@tokyo.io", fill=ink_muted, font=font_contact)
    y += 42
    draw.line([(MARGIN_X, y), (W - MARGIN_X, y)], fill=primary, width=2)
    y += 18
    
    def section(title_text):
        nonlocal y
        draw.text((MARGIN_X, y), title_text, fill=primary, font=font_heading)
        y += 24
        draw.line([(MARGIN_X, y), (W - MARGIN_X, y)], fill=(203, 213, 225), width=1)
        y += 14
        
    section("EXPERIENCE")
    draw.text((MARGIN_X, y), "Senior Engineering Manager  —  Sony Interactive Entertainment", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2020 – Present", fill=ink_muted, font=font_item_title)
    y += 22
    b1 = [
        "Manage 3 engineering squads (24 software engineers) building low-latency PlayStation network cloud streaming services.",
        "Reduced p99 streaming video decode frame latency by 18% across 12M global gaming sessions."
    ]
    for b in b1:
        draw_bullet(draw, MARGIN_X + 10, y + 8, radius=2.5, color=primary)
        draw.text((MARGIN_X + 22, y), b, fill=ink, font=font_body)
        y += 22
    y += 12
    
    draw.text((MARGIN_X, y), "Staff Software Architect  —  Rakuten Group", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2016 – 2020", fill=ink_muted, font=font_item_title)
    y += 22
    b2 = [
        "Architected global multi-currency checkout pipeline processing $4B+ annual gross merchandise volume.",
        "Scaled distributed caching layer reducing primary database read locks by 78% during Super Sale campaigns."
    ]
    for b in b2:
        draw_bullet(draw, MARGIN_X + 10, y + 8, radius=2.5, color=primary)
        draw.text((MARGIN_X + 22, y), b, fill=ink, font=font_body)
        y += 22
    y += 16
    
    section("EDUCATION")
    draw.text((MARGIN_X, y), "The University of Tokyo  —  B.S. in Information Science & Electrical Engineering", fill=ink, font=font_body)
    
    return im

# 10. CORPORATE SPLIT (2-column layout, right sidebar)
def render_corporate_split():
    im = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)
    
    sidebar_w = 380
    sidebar_x = W - sidebar_w
    draw.rectangle([sidebar_x, 0, W, H], fill=(248, 250, 252))
    draw.line([(sidebar_x, 0), (sidebar_x, H)], fill=(226, 232, 240), width=1)
    
    primary = (15, 23, 42)
    accent = (30, 58, 138)
    ink = (30, 41, 59)
    ink_muted = (71, 85, 105)
    
    font_name = get_font(34, bold=True)
    font_title = get_font(18, bold=False)
    font_heading = get_font(19, bold=True)
    font_sub = get_font(16, bold=True)
    font_body = get_font(14, bold=False)
    
    # Left main column
    mx = MARGIN_X
    my = MARGIN_Y + 10
    draw.text((mx, my), "ROBERT STERLING", fill=primary, font=font_name)
    my += 44
    draw.text((mx, my), "Vice President of Global Supply Chain & Logistics", fill=accent, font=font_title)
    my += 36
    draw.line([(mx, my), (sidebar_x - 40, my)], fill=primary, width=2)
    my += 24
    
    draw.text((mx, my), "EXECUTIVE EXPERIENCE", fill=primary, font=font_heading)
    my += 32
    draw.text((mx, my), "VP of Supply Chain Operations  |  Maersk Logistics", fill=ink, font=font_sub)
    my += 24
    b1 = [
        "Oversaw $450M global freight and intermodal transport budget with 99.2% on-time vessel dispatch reliability.",
        "Negotiated multi-year carrier agreements generating $32M in cost savings across transatlantic routes.",
        "Deployed IoT asset tracking telematics improving container utilization rates by 22%."
    ]
    for b in b1:
        draw_bullet(draw, mx + 8, my + 8, radius=2.5, color=primary)
        draw.text((mx + 20, my), b, fill=ink, font=font_body)
        my += 24
    my += 20
    
    draw.text((mx, my), "Director of Logistics Planning  |  DHL Global Forwarding", fill=ink, font=font_sub)
    my += 24
    b2 = [
        "Directed 14 distribution center managers and 480 logistics associates across Midwest region.",
        "Automated customs compliance documentation workflows, cutting import clearance delays from 48h to 4h."
    ]
    for b in b2:
        draw_bullet(draw, mx + 8, my + 8, radius=2.5, color=primary)
        draw.text((mx + 20, my), b, fill=ink, font=font_body)
        my += 24
        
    # Right sidebar content
    sx = sidebar_x + 36
    sy = MARGIN_Y + 10
    draw.text((sx, sy), "CONTACT", fill=primary, font=font_heading)
    sy += 30
    draw.text((sx, sy), "Chicago, IL\n(555) 789-0123\nr.sterling@corporate.com\nlinkedin.com/in/rsterling", fill=ink, font=font_body)
    sy += 90
    
    draw.text((sx, sy), "CORE EXPERTISE", fill=primary, font=font_heading)
    sy += 30
    skills = ["Global Logistics", "Fleet Management", "Carrier Negotiations", "Lean Six Sigma Black Belt", "ERP / SAP S/4HANA", "Inventory Optimization"]
    for s in skills:
        draw_bullet(draw, sx + 6, sy + 8, radius=2.5, color=primary)
        draw.text((sx + 16, sy), s, fill=ink, font=font_body)
        sy += 24
    sy += 20
    
    draw.text((sx, sy), "EDUCATION", fill=primary, font=font_heading)
    sy += 30
    draw.text((sx, sy), "M.S. Supply Chain", fill=ink, font=font_sub)
    sy += 20
    draw.text((sx, sy), "Northwestern University\n2014 – 2016", fill=ink_muted, font=font_body)
    
    return im

# 11. CAMBRIDGE ACADEMIC CV
def render_cambridge():
    im = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)
    
    primary = (15, 23, 42)
    ink = (30, 41, 59)
    ink_muted = (71, 85, 105)
    border_color = (148, 163, 184)
    
    font_name = get_font(34, bold=True, serif=True)
    font_title = get_font(18, bold=False, serif=True)
    font_contact = get_font(15, bold=False)
    font_heading = get_font(19, bold=True, serif=True)
    font_item_title = get_font(17, bold=True)
    font_item_sub = get_font(15, bold=False)
    font_body = get_font(14, bold=False)
    
    y = MARGIN_Y + 16
    
    name = "DR. ELEANOR VANCE, MD, PhD"
    bbox = draw.textbbox((0, 0), name, font=font_name)
    draw.text(((W - (bbox[2] - bbox[0])) // 2, y), name, fill=primary, font=font_name)
    y += 42
    
    title = "Director of Clinical Research & Associate Professor of Medicine"
    bbox = draw.textbbox((0, 0), title, font=font_title)
    draw.text(((W - (bbox[2] - bbox[0])) // 2, y), title, fill=ink, font=font_title)
    y += 30
    
    contact = "Johns Hopkins Medicine  •  Baltimore, MD  •  e.vance@jhmi.edu  •  (555) 246-8109  •  orcid.org/0000-0002-1829-3712"
    bbox = draw.textbbox((0, 0), contact, font=font_contact)
    draw.text(((W - (bbox[2] - bbox[0])) // 2, y), contact, fill=ink_muted, font=font_contact)
    y += 34
    
    draw.line([(MARGIN_X, y), (W - MARGIN_X, y)], fill=primary, width=2)
    y += 4
    draw.line([(MARGIN_X, y), (W - MARGIN_X, y)], fill=border_color, width=1)
    y += 28
    
    def section(title_text):
        nonlocal y
        draw.text((MARGIN_X, y), title_text, fill=primary, font=font_heading)
        y += 28
        draw.line([(MARGIN_X, y), (W - MARGIN_X, y)], fill=border_color, width=1)
        y += 18
        
    section("EDUCATION & POSTDOCTORAL TRAINING")
    draw.text((MARGIN_X, y), "Johns Hopkins University School of Medicine", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2015 – 2018", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "Postdoctoral Clinical Fellowship in Oncology & Molecular Therapeutics", fill=ink_muted, font=font_item_sub)
    y += 30
    
    draw.text((MARGIN_X, y), "Harvard Medical School", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2007 – 2015", fill=ink_muted, font=font_item_title)
    y += 24
    draw.text((MARGIN_X, y), "Doctor of Medicine (M.D.) & Doctor of Philosophy (Ph.D.) in Biomedical Science", fill=ink_muted, font=font_item_sub)
    y += 36
    
    section("APPOINTMENTS & PUBLICATIONS")
    draw.text((MARGIN_X, y), "Associate Professor & Clinical Research Director  —  Johns Hopkins Medicine", fill=ink, font=font_item_title)
    draw.text((W - MARGIN_X - 160, y), "2020 – Present", fill=ink_muted, font=font_item_title)
    y += 26
    b1 = [
        "Principal Investigator overseeing NIH-funded Phase II clinical trials investigating targeted immunotherapies.",
        "Authored 24 peer-reviewed manuscripts published in The New England Journal of Medicine, Lancet, and Cell."
    ]
    for b in b1:
        draw_bullet(draw, MARGIN_X + 10, y + 8, radius=3, color=primary)
        draw.text((MARGIN_X + 22, y), b, fill=ink, font=font_body)
        y += 22
        
    return im

# 12. CREATIVE STUDIO
def render_creative():
    im = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)
    
    sidebar_w = 400
    draw.rectangle([0, 0, sidebar_w, H], fill=(245, 243, 255))
    draw.line([(sidebar_w, 0), (sidebar_w, H)], fill=(221, 214, 254), width=1)
    
    primary = (109, 40, 217)
    ink = (30, 27, 75)
    ink_muted = (79, 70, 229)
    
    font_name = get_font(34, bold=True)
    font_title = get_font(18, bold=False)
    font_heading = get_font(19, bold=True)
    font_sub = get_font(16, bold=True)
    font_body = get_font(14, bold=False)
    
    # Left sidebar
    sx = 40
    sy = MARGIN_Y + 10
    draw.text((sx, sy), "CONNECT", fill=primary, font=font_heading)
    sy += 30
    draw.text((sx, sy), "Brooklyn, NY\nhello@maya-art.studio\n(555) 345-6789\nbehance.net/mayalewis\ninstagram.com/maya_studio", fill=ink, font=font_body)
    sy += 110
    
    draw.text((sx, sy), "TOOLKIT", fill=primary, font=font_heading)
    sy += 30
    skills = ["Art Direction", "Brand Identity", "Editorial Design", "Typography", "Adobe Creative Cloud", "Cinema 4D / 3D Render", "Packaging Design", "Creative Strategy"]
    for s in skills:
        draw_bullet(draw, sx + 6, sy + 8, radius=2.5, color=primary)
        draw.text((sx + 16, sy), s, fill=ink, font=font_body)
        sy += 24
    sy += 20
    
    draw.text((sx, sy), "AWARDS", fill=primary, font=font_heading)
    sy += 30
    draw.text((sx, sy), "D&AD Yellow Pencil (2023)\nCannes Lions Bronze (2021)\nAIGA Design Winner (2020)", fill=ink, font=font_body)
    
    # Right column
    mx = sidebar_w + 40
    my = MARGIN_Y + 10
    draw.text((mx, my), "MAYA LEWIS", fill=ink, font=font_name)
    my += 44
    draw.text((mx, my), "Creative Director & Brand Strategist", fill=primary, font=font_title)
    my += 36
    draw.line([(mx, my), (W - 50, my)], fill=primary, width=2)
    my += 24
    
    draw.text((mx, my), "SELECTED WORK", fill=ink, font=font_heading)
    my += 32
    draw.text((mx, my), "Creative Director  |  Pentagram Design", fill=ink, font=font_sub)
    draw.text((W - 190, my), "2021 – Present", fill=ink_muted, font=font_body)
    my += 26
    b1 = [
        "Directed brand identity system rebrands for 8 global luxury and cultural clients across digital, print, and physical spaces.",
        "Led team of 14 multidisciplinary designers, animators, and copywriters delivering campaigns reaching 40M+ impressions."
    ]
    for b in b1:
        draw_bullet(draw, mx + 8, my + 8, radius=2.5, color=primary)
        draw.text((mx + 20, my), b, fill=ink, font=font_body)
        my += 24
    my += 20
    
    draw.text((mx, my), "Senior Art Director  |  Wieden+Kennedy", fill=ink, font=font_sub)
    draw.text((W - 190, my), "2017 – 2021", fill=ink_muted, font=font_body)
    my += 26
    b2 = [
        "Developed concept visuals and experiential installations for international athletic apparel brands.",
        "Awarded ADC Gold Cube for interactive digital storytelling campaign."
    ]
    for b in b2:
        draw_bullet(draw, mx + 8, my + 8, radius=2.5, color=primary)
        draw.text((mx + 20, my), b, fill=ink, font=font_body)
        my += 24
        
    return im

generators = {
    "harvard": render_harvard,
    "silicon": render_silicon,
    "mckinsey": render_mckinsey,
    "stanford": render_stanford,
    "wall-street": render_wall_street,
    "jake-ats": render_jake_ats,
    "linear-mono": render_linear_mono,
    "modern-split": render_modern_split,
    "tokyo-compact": render_tokyo_compact,
    "corporate-split": render_corporate_split,
    "cambridge-cv": render_cambridge,
    "creative-studio": render_creative,
}

for name, gen in generators.items():
    print(f"Generating preview images and sample PDF for {name}...")
    canvas = gen()
    
    # JPG: 600x848
    jpg_img = canvas.resize(JPG_SIZE, Image.Resampling.LANCZOS)
    jpg_img.save(f"{DIR}/jpg/{name}.jpg", quality=85, optimize=True)
    
    # Thumb: 596x843
    thumb_img = canvas.resize(THUMB_SIZE, Image.Resampling.LANCZOS)
    thumb_img.save(f"{DIR}/thumb/{name}.webp", quality=80, method=6)
    
    # Small: 300x424
    small_img = canvas.resize(SMALL_SIZE, Image.Resampling.LANCZOS)
    small_img.save(f"{DIR}/thumb/{name}-small.webp", quality=80, method=6)
    
    # PDF: sample printable PDF
    canvas.save(f"{DIR}/pdf/{name}.pdf", "PDF", resolution=150)
    
print("All 12 curated template previews and PDFs generated successfully.")
