import os
import uuid
import json

try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection, init_db, seed_demo_data
from services.ai_service import analyze_sighting, generate_rescue_briefing

app = Flask(__name__)
CORS(app)

# ----------------- CASES ENDPOINTS -----------------

@app.route('/api/cases', methods=['POST'])
def create_case():
    data = request.get_json() or {}
    case_id = f"RL-{uuid.uuid4().hex[:4].upper()}"
    
    full_name = data.get('full_name', '').strip()
    if not full_name:
        return jsonify({"error": "Full name is required"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO missing_person (
        id, full_name, age, gender, physical_description, clothing, 
        last_known_location, last_known_date, last_known_time, additional_info, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    ''', (
        case_id, full_name, data.get('age'), data.get('gender'),
        data.get('physical_description'), data.get('clothing'), data.get('last_known_location'),
        data.get('last_known_date'), data.get('last_known_time'), data.get('additional_info')
    ))
    conn.commit()
    conn.close()
    
    return jsonify({"id": case_id, "status": "ACTIVE", "message": "Case created successfully"}), 201

@app.route('/api/cases', methods=['GET'])
def get_cases():
    conn = get_db_connection()
    cases = conn.execute("SELECT * FROM missing_person ORDER BY created_at DESC").fetchall()
    conn.close()
    return jsonify([dict(row) for row in cases])

@app.route('/api/cases/<case_id>', methods=['GET'])
def get_case(case_id):
    conn = get_db_connection()
    case = conn.execute("SELECT * FROM missing_person WHERE id = ?", (case_id,)).fetchone()
    if not case:
        conn.close()
        return jsonify({"error": "Case not found"}), 404
        
    sightings = conn.execute("SELECT * FROM sightings WHERE case_id = ? ORDER BY created_at ASC", (case_id,)).fetchall()
    conn.close()
    
    case_dict = dict(case)
    sightings_list = [dict(s) for s in sightings]
    
    # Calculate relevance breakdown
    high_count = sum(1 for s in sightings_list if s.get('relevance_level') == 'HIGH')
    medium_count = sum(1 for s in sightings_list if s.get('relevance_level') == 'MEDIUM')
    low_count = sum(1 for s in sightings_list if s.get('relevance_level') == 'LOW')
    insufficient_count = sum(1 for s in sightings_list if s.get('relevance_level') in ['INSUFFICIENT INFORMATION', None])
    
    case_dict['total_sightings'] = len(sightings_list)
    case_dict['relevance_breakdown'] = {
        "HIGH": high_count,
        "MEDIUM": medium_count,
        "LOW": low_count,
        "INSUFFICIENT": insufficient_count
    }
    case_dict['sightings'] = sightings_list
    
    return jsonify(case_dict)

# ----------------- SIGHTINGS ENDPOINTS -----------------

@app.route('/api/cases/<case_id>/sightings', methods=['POST'])
def report_sighting(case_id):
    data = request.get_json() or {}
    original_report = data.get('report', '').strip()
    
    if not original_report:
        return jsonify({"error": "Sighting description is required"}), 400
        
    conn = get_db_connection()
    case = conn.execute("SELECT * FROM missing_person WHERE id = ?", (case_id,)).fetchone()
    
    if not case:
        conn.close()
        return jsonify({"error": "Case not found"}), 404
        
    reporter_name = data.get('reporter_name', 'Anonymous Witness')
    
    # Process structured extraction & relevance analysis with Gemini AI
    ai_result = analyze_sighting(original_report, dict(case))
    
    extracted = ai_result.get('extracted_data', {})
    relevance = ai_result.get('relevance_level', 'INSUFFICIENT INFORMATION')
    reasoning = ai_result.get('relevance_reasoning', '')
    
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO sightings (
        case_id, reporter_name, original_report, location, time, date, additional_info,
        extracted_location, extracted_time, extracted_date, extracted_clothing,
        extracted_visible_characteristics, extracted_objects, extracted_direction,
        extracted_important_clues, extracted_language, extracted_summary,
        relevance_level, relevance_reasoning
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        case_id, reporter_name, original_report, 
        data.get('location') or extracted.get('location') or 'unknown', 
        data.get('time') or extracted.get('time') or 'unknown', 
        data.get('date') or extracted.get('date') or 'unknown',
        data.get('additional_info', ''),
        extracted.get('location', 'unknown'), 
        extracted.get('time', 'unknown'), 
        extracted.get('date', 'unknown'),
        extracted.get('clothing', 'unknown'), 
        extracted.get('visible_characteristics', 'unknown'),
        extracted.get('objects', 'unknown'), 
        extracted.get('direction', 'unknown'),
        extracted.get('important_clues', 'unknown'), 
        extracted.get('language', 'English'),
        extracted.get('summary', original_report[:120]), 
        relevance, 
        reasoning
    ))
    
    conn.commit()
    sighting_id = cursor.lastrowid
    conn.close()
    
    return jsonify({
        "message": "Sighting recorded successfully",
        "id": sighting_id,
        "ai_analysis": ai_result
    }), 201

@app.route('/api/cases/<case_id>/sightings', methods=['GET'])
def get_sightings(case_id):
    conn = get_db_connection()
    sightings = conn.execute("SELECT * FROM sightings WHERE case_id = ? ORDER BY created_at ASC", (case_id,)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in sightings])

# ----------------- RESCUE BRIEFING & TIMELINE -----------------

@app.route('/api/cases/<case_id>/briefing', methods=['POST'])
def get_briefing(case_id):
    conn = get_db_connection()
    case = conn.execute("SELECT * FROM missing_person WHERE id = ?", (case_id,)).fetchone()
    sightings = conn.execute("SELECT * FROM sightings WHERE case_id = ? ORDER BY created_at ASC", (case_id,)).fetchall()
    conn.close()
    
    if not case:
        return jsonify({"error": "Case not found"}), 404
        
    briefing = generate_rescue_briefing(dict(case), [dict(s) for s in sightings])
    
    return jsonify({"briefing": briefing})

@app.route('/api/cases/<case_id>/timeline', methods=['GET'])
def get_timeline(case_id):
    conn = get_db_connection()
    case = conn.execute("SELECT * FROM missing_person WHERE id = ?", (case_id,)).fetchone()
    if not case:
        conn.close()
        return jsonify({"error": "Case not found"}), 404
        
    sightings = conn.execute("SELECT * FROM sightings WHERE case_id = ? ORDER BY created_at ASC", (case_id,)).fetchall()
    conn.close()
    
    timeline = []
    # Add last confirmed case info
    timeline.append({
        "type": "CONFIRMED_ORIGIN",
        "time": case["last_known_time"] or "Initial",
        "date": case["last_known_date"] or "",
        "location": case["last_known_location"] or "Unknown Location",
        "title": "Last Confirmed Location",
        "description": f"Last seen wearing {case['clothing'] or 'unspecified clothing'}.",
        "priority": "ORIGIN"
    })
    
    # Add sightings in order
    for s in sightings:
        timeline.append({
            "type": "SIGHTING",
            "id": s["id"],
            "time": s["extracted_time"] if s["extracted_time"] != "unknown" else s["time"] or "Time Unspecified",
            "date": s["extracted_date"] if s["extracted_date"] != "unknown" else s["date"] or "",
            "location": s["extracted_location"] if s["extracted_location"] != "unknown" else s["location"] or "Location Unspecified",
            "title": f"Reported Sighting ({s['relevance_level'] or 'UNREVIEWED'})",
            "description": s["extracted_summary"] or s["original_report"],
            "priority": s["relevance_level"] or "INSUFFICIENT INFORMATION",
            "language": s["extracted_language"]
        })
        
    return jsonify(timeline)

# ----------------- VOLUNTEER & TASK COORDINATION -----------------

@app.route('/api/volunteers', methods=['GET'])
def get_volunteers():
    conn = get_db_connection()
    volunteers = conn.execute("SELECT * FROM volunteers ORDER BY created_at DESC").fetchall()
    conn.close()
    return jsonify([dict(v) for v in volunteers])

@app.route('/api/volunteers', methods=['POST'])
def register_volunteer():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    if not name:
        return jsonify({"error": "Volunteer name is required"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO volunteers (name, contact_info, availability)
    VALUES (?, ?, ?)
    ''', (name, data.get('contact_info', ''), data.get('availability', 'Immediate')))
    conn.commit()
    vol_id = cursor.lastrowid
    conn.close()
    
    return jsonify({"id": vol_id, "message": "Volunteer registered successfully"}), 201

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    case_id = request.args.get('case_id')
    conn = get_db_connection()
    if case_id:
        tasks = conn.execute('''
        SELECT t.*, v.name as volunteer_name 
        FROM search_tasks t 
        LEFT JOIN volunteers v ON t.assigned_to = v.id 
        WHERE t.case_id = ? 
        ORDER BY t.created_at DESC
        ''', (case_id,)).fetchall()
    else:
        tasks = conn.execute('''
        SELECT t.*, v.name as volunteer_name 
        FROM search_tasks t 
        LEFT JOIN volunteers v ON t.assigned_to = v.id 
        ORDER BY t.created_at DESC
        ''').fetchall()
    conn.close()
    return jsonify([dict(t) for t in tasks])

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json() or {}
    case_id = data.get('case_id')
    description = data.get('description', '').strip()
    
    if not case_id or not description:
        return jsonify({"error": "case_id and description are required"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO search_tasks (case_id, description, search_area, status)
    VALUES (?, ?, ?, 'PENDING')
    ''', (case_id, description, data.get('search_area', 'General Perimeter')))
    conn.commit()
    task_id = cursor.lastrowid
    conn.close()
    
    return jsonify({"id": task_id, "message": "Task created successfully"}), 201

@app.route('/api/tasks/<int:task_id>', methods=['PATCH'])
def update_task(task_id):
    data = request.get_json() or {}
    status = data.get('status')
    assigned_to = data.get('assigned_to')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if status and assigned_to is not None:
        cursor.execute("UPDATE search_tasks SET status = ?, assigned_to = ? WHERE id = ?", (status, assigned_to, task_id))
    elif status:
        cursor.execute("UPDATE search_tasks SET status = ? WHERE id = ?", (status, task_id))
    elif assigned_to is not None:
        cursor.execute("UPDATE search_tasks SET assigned_to = ?, status = 'IN_PROGRESS' WHERE id = ?", (assigned_to, task_id))
        
    conn.commit()
    conn.close()
    return jsonify({"message": f"Task {task_id} updated successfully"})

if __name__ == '__main__':
    init_db()
    seed_demo_data()
    app.run(debug=True, host='0.0.0.0', port=5000)
