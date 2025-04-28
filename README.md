#Enter all stuff here

Explain the motivation for your application.  What can it allow someone to understand? 
1 section on the data: Describe the data and include a link. 
*** Since you will have done more work for this project to obtain and process the data, describe your methods and include processing scripts. 
1 section on the visualization components: Explain each view of the data, the GUI, etc.  Explain how you can interact with your application, and how the views update in response to these interactions. 
Include design sketches and design justifications 
1 section on what your application enables you to discover: Present some findings you arrive at with your application.  Include screen shots to illustrate.
1 section on your process- what libraries did you use?  How did you structure your code?  How can you access it and run it?  Link to your code (and the live application, if it is deployed online). 

# Data Visualization - Project 3

## Motivation
## <div id="data">Data</div>
All our transcript data was from the Tumblr user [transcribed anime scripts](https://transcribedanimescripts.tumblr.com/), posted here: <br>https://transcribedanimescripts.tumblr.com/post/620874161772953600/demon-slayer-kimetsu-no-yaiba-master-list <br>
They made four transcripts for each episodes, English (sub)  |  English + Romaji  |  English + 日本語  |  日本語. The transcripts themselves are well formatted google docs hosted in their personal google drive.<br>
Samraysh went through each file and combined them into one [super docment](./data/Demon%20Slayer%20(ENG%20sub).docx). 
<br>
Jasmine turned this super document into [html](./data/Demon%20Slayer%20(ENG%20sub).html) and made a [python script](./data/generate-csv.py) to parse out the speakers, scenes, actions, and dialouge itself.<br>
After the data was turned into a .csv, Samraysh went back and made his own [script](./data/map.py). It parses scene information for locations to make a [travel matrix](./data/maptravel.csv) of what characters had moved where for his map visualization.<br>
For the character selection sidebar, Tulasi parsed the incoming csv data into a weighted character array. This array was used to sort by dialouge count and filter out characters that weren't recurring.

## Visualization Components
When the user loads the application, they are met with an intro pop up which gives a brief overview of Demon Slayer. It provides the viewer with a summary of the plot, streaming services that it is on, characters, number of seasons and episodes,  and running time. It also provides an description and visual of the main characters, including the primary protagonist and antagonist of the show. 
<img src="./image/vis2.png" alt="image" width="500"/>
When the user clicks continue, they will be taken into the main data view. It is split into two panes with the right pane containing the visualizations that are accessed by clicking the tabs and the left side contains a list of characters. The character list shows images of the characters that have spoken across all episodes. The user can search for a specific character, or order the list alphabetically and by how much the character speaks through out the show. The user can select multiple characters at the same time in order to filter the other visualizations to only include data for the selected characters. On the right side of the application, the first tab contains the word cloud which displays the most commonly used words based on the size. Hovering over a word will show the number of times it has been said. Clicking on the word will open a word trie that shows sentences that follow that word in the transcript. It essentially autocompletes the word and hovering over the word will show a pie chart of which characters used that word. The phrases tab contains a table with the most common phases said during the show. The map tab displays a fictional map of Japan that is labeled with the main locations in the show. Clicking on a character will trigger an animation that shows the character's movement on the map throughout the show. The more info tab contains two pie charts that compare the time spent in thought vs spoken out loud and the dialogue spoken by the selected character vs spoken by the other characters. It also displays the stats for the selected characters (seasons appeared, episodes appeared, and total dialogue). The timiline allows the user to filter the data according to the season and episode number.

## <div id="sketches">Design Sketches and Justifications</div>

### Initial Sketches for the overall layout
![image](./image/sketches1.png)
by Jasmine
Shows the character selection on the left, visualization tabs on right, and some mockups of individual visualizations.<br>
<br>
![image](./image/sketches3.png)
Info button in the bottom left could bring up overlay explaining details about the <em>Demon Slayer</em> series itself.

### Unimplemented "Compare Mode"
![image](./image/sketches2.png)
by Jasmine
"Group Mode" (what is implemented) has you look at data from characters in the same scenes while "Compare Mode" would generate two of each visualization to compare and contrast the left-hand side grouping against the left-hand side. This can still be done slighty by opening a word trie, changing your selection to another grouping, and opening a second word trie with the newly filtered data.
the <em>Demon Slayer</em> series itself.

### Extra Widgets and visualizations
![image](./image/sketches4.png)
by Samraysh
Initially we wanted to do some analysis on the japanese version of the transcript, but that was found to be out of scope fairly early on. Two of the visualizations in the top right are used in the "More Info" tab in the final visualization.
## Discoveries
## Process
## Demo Video
## Future Improvements
## Team Contributions
### Iswarya Mikkili
- Timeline 
  
### Jasmine Mogadam
- General project management
- [Sketches](#sketches) for some screens
- Some [data](#data) filtering
- Word Cloud
- Word Trie

### Rashi Loni
- thing 1
- thing 2

### Samraysh Pellakur
- thing 1
- thing 2

### Tulasi Rama Raju Chittiraju
- thing 1
- thing 2
