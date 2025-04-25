from stop_words import get_stop_words

stop_words = get_stop_words('en')
stop_words = get_stop_words('english')

from stop_words import safe_get_stop_words

stop_words = safe_get_stop_words('english')

# text file
with open("./data/stop-words.txt", "w") as file:
    for word in stop_words:
        file.write(word + "\n")

# javascript file
with open("./js/stop-words.js", "w") as file:
    file.write("const stopWords = [\n")
    for word in stop_words:
        file.write(f"    \"{word}\",\n")
    file.write("];\n")
    file.write("export default stopWords;\n")