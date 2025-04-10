from bs4 import BeautifulSoup
import os

speaker_indicator = "\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0"
csv_file_path = "./data/demon-slayer-transcript.csv"

# Check if the file exists
if os.path.exists(csv_file_path):
    # Delete the file so new data can be written
    os.remove(csv_file_path)


# Load the HTML file
with open("./data/Demon Slayer (ENG sub).html", "r", encoding="utf-8") as file:
    soup = BeautifulSoup(file, "html.parser")

scene_id = 0;
action_id = 0;

class Scene:
    def __init__(self, description):
        self.scene_id = scene_id + 1
        self.description = description

class Action:
    def __init__(self, description):
        self.action_id = action_id + 1
        self.description = text

# Parse the html file to make an array of dialogues, then export to a CSV file
class Dialogue:
    def __init__(self, text, speaker, scene, episode, season, preface=None, action=None):
        self.text = text
        self.speaker = speaker
        self.scene = scene
        self.episode = episode
        self.season = season
        self.preface = preface
        self.action = action

dialouges = []

#### Extract info for each episode
# Header Format :
# <h1>Demon<span style='letter-spacing:-.15pt'> </span>Slayer<span
# style='letter-spacing:-.3pt'> </span>S.1<span style='letter-spacing:-.4pt'> </span><span
# style='letter-spacing:-.2pt'>E.01</span><span style='text-decoration:none;
# text-underline:none'><o:p></o:p></span></h1>
#### Desired Data from this: S.1, E.01, &
#### all html between the current <h1> and the next <h1> tag (this will be the dialouge for the episode)
#### Should return a two key dict in the format {[Season, Episode]: [html]}


#### Extract description from scenes and dialouge between it and the next scene
# <p class=MsoNormal style='margin-top:.05pt;margin-right:40.95pt;margin-bottom:
# 0in;margin-left:.95pt;margin-bottom:.0001pt;line-height:115%'><i
# style='mso-bidi-font-style:normal'>[Scene:<span style='letter-spacing:-.15pt'> </span>A<span
# style='letter-spacing:-.1pt'> </span>young<span style='letter-spacing:-.2pt'> </span>boy,
# Tanjirou, carries<span style='letter-spacing:-.1pt'> </span>his<span
# style='letter-spacing:-.2pt'> </span>sister,<span style='letter-spacing:-.25pt'>
# </span>Nezuko,<span style='letter-spacing:-.05pt'> </span>on<span
# style='letter-spacing:-.2pt'> </span>his<span style='letter-spacing:-.05pt'> </span>back<span
# style='letter-spacing:-.3pt'> </span>through<span style='letter-spacing:-.1pt'>
# </span>the<span style='letter-spacing:-.2pt'> </span>snow.<span
# style='letter-spacing:-.15pt'> </span>Nezuko<span style='letter-spacing:-.1pt'>
# </span>is bleeding from a wound on her head.]<o:p></o:p></i></p>
#### Desired Data from this: "At a small cabin in the mountains, during the morning. Tanjirou takes up a basket of charcoal on his back and is preparing to leave the hous"
#### & all html between the current <p> with brackets [Scene:...] and the next <p> tag with [Scene:...](this will be the dialouge for the scene)

#### Extract dialouge from scenes and dialouge between it and the next scene
# <p class=MsoNormal style='margin-top:10.7pt;margin-right:0in;margin-bottom:
# 0in;margin-left:.95pt;margin-bottom:.0001pt;tab-stops:76.8pt'><b
# style='mso-bidi-font-weight:normal'><span style='letter-spacing:-.1pt'>Tanjirou</span><span
# style='mso-tab-count:1'>           </span></b>(Thoughts)<span style='letter-spacing:
# -.4pt'> </span><span style='letter-spacing:-.2pt'>How…?</span></p>
#### Desired Data from this: speaker (Tanjirou), text (How...?), & all html between the current <p> with a tab span and the next <p> tag (this will be the dialouge for the speaker)
# Speakers have the following always after they speak:
# <span style='letter-spacing:-.25pt'>Kie</span><span
# style='mso-tab-count:1'>

# Setup csv file
with open(csv_file_path, "w", encoding="utf-8") as csv_file:
    # Write the header row
    csv_file.write("text,speaker,episode,season,preface,scene,scene_id,action,action_id\n")
    # Write the data rows
    h1_tags = soup.find_all("h1")
    for i, episode in enumerate(h1_tags):
        # Get the episode number and season
        episode_number = episode.text.split("E.")[1].split("<")[0]
        season_number = episode.text.split("S.")[1].split("<")[0] #TODO is "1. E.02" instead of just 1
        scene = None
        action = None

        # Get all HTML between the current <h1> and the next <h1>
        html_between = []
        sibling = episode.find_next_sibling()
        while sibling and (i == len(h1_tags) - 1 or sibling != h1_tags[i + 1]):
            html_between.append(sibling)
            sibling = sibling.find_next_sibling()

        # Process the HTML between the <h1> tags
        for line in html_between:
            if line.name == "p":
                # Check if the line is a scene
                if "[Scene:" in line.text:
                    scene_description = line.text.split("[Scene:")[1].split("]")[0]
                    scene = Scene(scene_description)
                # Check if the line is an action
                elif "[Action:" in line.text:
                    action_description = line.text.split("[Action:")[1].split("]")[0]
                    action = Action(action_description)
                # Check if the line contains a speaker and text
                # TODO - not capturing all text
                elif speaker_indicator in line.text:
                    speaker = line.find("b").text.strip()
                    text = line.text.split(speaker)[1].strip()
                    preface = text.split("(")[0].strip() if "(" in text else None
                    dialouge = Dialogue(text, speaker, scene, episode_number, season_number)
                    dialouges.append(dialouge)

# Turn Dialouge array into a CSV file
for dialouge in dialouges:
    # Get the text, speaker, scene, episode, season, preface, and action
    text = dialouge.text
    speaker = dialouge.speaker
    episode = dialouge.episode
    season = dialouge.season
    preface = dialouge.preface
    scene_id = dialouge.scene.scene_id if dialouge.scene else None
    scene = dialouge.scene.description if dialouge.scene else None
    action = dialouge.action.description if dialouge.action else None
    action_id = dialouge.action.action_id if dialouge.action else None

    # Create a new row in the CSV file with the extracted data
    with open(csv_file_path, "a", encoding="utf-8") as csv_file:
        csv_file.write(f"{text},{speaker},{episode},{season},{preface},{scene},{scene_id},{action},{action_id}\n")