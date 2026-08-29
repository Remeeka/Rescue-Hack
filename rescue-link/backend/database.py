import sqlite3
import os
from datetime import datetime

DATABASE_FILE = "database.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS missing_person (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        physical_description TEXT,
        clothing TEXT,
        last_known_location TEXT,
        last_known_date TEXT,
        last_known_time TEXT,
        additional_info TEXT,
        status TEXT DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS sightings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id TEXT NOT NULL,
        reporter_name TEXT,
        original_report TEXT NOT NULL,
        location TEXT,
        date TEXT,
        time TEXT,
        additional_info TEXT,
        extracted_location TEXT,
        extracted_time TEXT,
        extracted_date TEXT,
        extracted_clothing TEXT,
        extracted_visible_characteristics TEXT,
        extracted_objects TEXT,
        extracted_direction TEXT,
        extracted_important_clues TEXT,
        extracted_language TEXT,
        extracted_summary TEXT,
        relevance_level TEXT,
        relevance_reasoning TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES missing_person (id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS volunteers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact_info TEXT,
        availability TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS search_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id TEXT NOT NULL,
        description TEXT NOT NULL,
        search_area TEXT,
        status TEXT DEFAULT 'PENDING',
        assigned_to INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES missing_person (id),
        FOREIGN KEY (assigned_to) REFERENCES volunteers (id)
    )
    ''')

    conn.commit()
    conn.close()

def seed_demo_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if demo data exists
    cursor.execute("SELECT id FROM missing_person WHERE id = 'RL-DEMO'")
    if cursor.fetchone() is None:
        cursor.execute('''
        INSERT INTO missing_person (id, full_name, age, physical_description, clothing, last_known_location, last_known_time)
        VALUES ('RL-DEMO', 'Arun Kumar', 21, 'Male, dark hair, average height', 'Blue shirt and dark pants', 'Central Bus Station', '5:10 PM')
        ''')
        
        cursor.execute('''
        INSERT INTO sightings (case_id, original_report, location, time, relevance_level, extracted_summary)
        VALUES 
        ('RL-DEMO', 'Saw someone matching the description near Market Road.', 'Market Road', '5:48 PM', 'MEDIUM', 'Sighting near Market Road.'),
        ('RL-DEMO', 'A young man in a blue shirt was sitting at the Railway Station.', 'Railway Station', '6:20 PM', 'HIGH', 'Possible match at Railway Station wearing blue shirt.'),
        ('RL-DEMO', 'Thought I saw him walking fast towards East Market.', 'East Market', '6:45 PM', 'LOW', 'Possible sighting heading to East Market.')
        ''')

        conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    seed_demo_data()
    print("Database initialized and demo data seeded.")
