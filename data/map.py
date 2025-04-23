import pandas as pd
from docx import Document

# All known places
points = [
    { "id": "p1", "name": "Mount Kumotori", "x": 30, "y": 100},
    { "id": "p2", "name": "Mt. Sagiri", "x": 240, "y": 125},
    { "id": "p3", "name": "Final Selection forest", "x": 270, "y": 240},
    { "id": "p4", "name": "Northwest Town", "x": 280, "y": 135},
    { "id": "p5", "name": "Asakusa", "x": 415, "y": 305},
    { "id": "p6", "name": "Tsuzumi Mansion", "x": 150, "y": 160},
    { "id": "p7", "name": "Mt. Natagumo", "x": 330, "y": 220},
    { "id": "U", "name": "Demon Slayer Corps headquarters", "x": 410, "y": 250},
    { "id": "B", "name": "Butterfly Mansion", "x": 480, "y": 180},
    { "id": "p8", "name": "Mugen Train", "x": 390, "y": 195},
    { "id": "p9", "name": "entertainment district", "x": 560, "y": 230},
    { "id": "p10", "name": "Swordsmith Village", "x": 610, "y": 300},
    { "id": "p11", "name": "Hashira Training", "x": 460, "y": 232},
    { "id": "I", "name": "Infinity Castle", "x": 600, "y": 470}
]

# Map name to ID
place_name_to_id = {p["name"].lower(): p["id"] for p in points}
place_ids = [p["id"] for p in points]

# Parse the Word document to collect scenes
def get_scene_mentions(docx_path):
    doc = Document(docx_path)
    scenes = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if "[scene:" in text.lower():
            scenes.append(text.lower())
    return scenes

# Check if a speaker appears in a scene mentioning a place
def speaker_visits(speaker, scenes):
    visits = {pid: 0 for pid in place_ids}
    speaker_lower = speaker.lower()
    for scene in scenes:
        if speaker_lower in scene:
            for name, pid in place_name_to_id.items():
                if name in scene:
                    visits[pid] = 1
    return visits

# Main function
def process_visits(docx_path, csv_path, output_csv_path):
    scenes = get_scene_mentions(docx_path)
    df = pd.read_csv(csv_path)

    results = []

    for _, row in df.iterrows():
        speaker = row['speakers']
        visits = speaker_visits(speaker, scenes)
        row_data = {'speakers': speaker}
        row_data.update(visits)
        results.append(row_data)

    out_df = pd.DataFrame(results)
    out_df.to_csv(output_csv_path, index=False)
    print(f"Results written to {output_csv_path}")

# Example usage
process_visits("Demon Slayer (ENG sub).docx", "charcount.csv", "output_visits.csv")