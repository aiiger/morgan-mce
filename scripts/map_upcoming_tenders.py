
import csv
import json
import uuid
from datetime import datetime

csv_path = r"c:\Users\t1glish\Downloads\nexus-construct-erp (2)\Ongoing, Completed & Upcoming Projects FV(20-11-2025)(JMUPD) - - Sheet1.csv"

tenders = []

with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.reader(f)
    rows = list(reader)

# Upcoming projects start from index 32 (line 33) to 47 (line 48)
upcoming_rows = rows[32:48]

for row in upcoming_rows:
    if not row[0]: continue
    
    # Mapping based on observation
    # 0: Project Name
    # 1: Client Name
    # 4: Project Location
    # 5: Scope of Work
    # 6: Project Type
    # 7: Contract Value (AED)
    # 8: Contract Duration
    # 9: Project Status
    # 10: Commencement Date
    # 11: Estimated Completion Date
    
    value_str = row[7].replace(',', '').strip()
    try:
        value = float(value_str)
    except:
        value = 0
        
    status_raw = row[9].strip()
    # Mapping to VeroPM stages
    # PRE_QUAL, TECHNICAL_PREP, COMMERCIAL_PREP, QUALITY_GATE, SUBMITTED
    status = 'PRE_QUAL' 
    if 'Tender Stage' in status_raw or 'Tender' in status_raw:
        status = 'TECHNICAL_PREP'
    elif 'Pre-Award' in status_raw:
        status = 'QUALITY_GATE'
        
    tender = {
        "id": str(uuid.uuid4()),
        "title": row[0].strip(),
        "client": row[1].strip(),
        "status": status,
        "value": value,
        "probability": "Medium", # Defaulting to Medium
        "created_at": datetime.now().isoformat(),
        "expected_close_date": row[10].strip() if row[10].strip() and row[10].strip() != 'TBD' else None,
        "priority": "Medium",
        "lead_source": "MCE Legacy CSV",
        "location": row[4].strip(),
        "project_type": row[6].strip()
    }
    tenders.append(tender)

print(json.dumps(tenders, indent=2))
