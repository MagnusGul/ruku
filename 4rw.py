import os


for i in range(42, 559):
    os.mkdir(f"C:\\Users\\Musa\\pycharmProjects\\ruku\\data\\{i}")
    with open(f"C:\\Users\\Musa\\pycharmProjects\\ruku\\data\\{i}\\tafsir.html", "w") as f:
        f.write("""<article class="tafsir-content">

    </article>
    """
                )
    with open(f"C:\\Users\\Musa\\pycharmProjects\\ruku\\data\\{i}\\timings.json", "w") as f:
        pass

    with open(f"C:\\Users\\Musa\\pycharmProjects\\ruku\\data\\{i}\\audio.mp3", "w") as f:
        pass