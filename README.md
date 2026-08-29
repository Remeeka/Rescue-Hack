# RescueLink

### AI-Powered Missing Person Rescue Coordinator

> Turning scattered missing-person reports into coordinated rescue action.

## Overview

RescueLink is an AI-powered community rescue coordination platform designed to help organize missing-person cases and make scattered sighting information easier to understand and act upon.

When someone goes missing, information can come from family members, friends, witnesses, and volunteers through different channels. RescueLink brings this information together and uses AI to structure reports, prioritize them for human review, visualize sightings, and generate concise rescue briefings.

## Problem

Missing-person cases can generate a large amount of unstructured information:

- Witness reports may contain incomplete details.
- Sightings can come from different locations and times.
- Important information can be difficult to organize quickly.
- Volunteers may not know which reports require attention first.
- Reports may be submitted in different languages.

RescueLink aims to reduce this information overload by organizing reports into a single coordination platform.

## Key Features

### Missing Person Case Management

Create and manage missing-person cases with information such as:

- Name
- Age
- Physical description
- Clothing
- Last known location
- Last known date and time
- Photo
- Additional information

### AI-Powered Sighting Analysis

Users can submit sightings using natural language.

The Gemini API extracts relevant information such as:

- Location
- Date and time
- Clothing
- Objects
- Observed characteristics
- Direction of movement when explicitly provided
- Important clues
- Concise summary

### AI Relevance Prioritization

Sighting reports are categorized as:

- High
- Medium
- Low
- Insufficient Information

The prioritization is intended only to assist human review. It does not confirm the identity of a person.

### Interactive Map

RescueLink uses Leaflet and OpenStreetMap to visualize:

- Last known location
- Reported sightings
- Potentially relevant reports

### Sighting Timeline

Reports are automatically organized chronologically to make it easier to understand how information developed over time.

### AI Rescue Briefing

Gemini analyzes the available case information and generates a concise briefing containing:

- Last confirmed location
- Latest reported sightings
- Important clues
- Chronological information
- Information gaps
- Areas requiring human review

### Volunteer Coordination

Volunteers can view available search tasks and update task status.

### Multilingual Reports

RescueLink supports reports in:

- English
- Tamil
- Hindi

The original report is preserved while AI helps structure the information.

## How It Works

```text
User / Witness
      |
      v
Sighting Report
      |
      v
Flask Backend
      |
      v
Gemini AI
      |
      +--> Information Extraction
      |
      +--> Relevance Prioritization
      |
      +--> Summary Generation
      |
      v
SQLite Database
      |
      +--> Interactive Map
      |
      +--> Sighting Timeline
      |
      +--> AI Rescue Briefing
      |
      v
Human Review / Volunteer Coordination
<img width="1498" height="728" alt="image" src="https://github.com/user-attachments/assets/1665abc9-219c-45d8-bf79-c50885d9c40e" />
<img width="1161" height="712" alt="image" src="https://github.com/user-attachments/assets/4d016550-2d52-4171-b8e3-f1a599377ac0" />
<img width="1044" height="729" alt="image" src="https://github.com/user-attachments/assets/8c0fa611-bb4e-4328-b4c6-bd21962fde1e" />
<img width="1152" height="711" alt="image" src="https://github.com/user-attachments/assets/16a64f02-98c7-425d-89bf-6a8e48c431d6" />
<img width="1041" height="473" alt="image" src="https://github.com/user-attachments/assets/8fe45ec3-36ca-42fe-9913-a48eb8bff7ff" />
<img width="1018" height="499" alt="image" src="https://github.com/user-attachments/assets/9533c603-e2a2-4663-92c1-fa163b2d5663" />
<img width="1070" height="611" alt="image" src="https://github.com/user-attachments/assets/51a036d8-9be9-4d4c-b374-f829d4855bd7" />
<img width="1040" height="656" alt="image" src="https://github.com/user-attachments/assets/31975b70-ddc5-48f0-a539-f50e05afa6d2" />
<img width="1532" height="690" alt="image" src="https://github.com/user-attachments/assets/defe8aa7-8261-4b39-a679-61218e3bb8ec" />
![Uploading image.png…]()
