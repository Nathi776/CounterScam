import csv
import re

INPUT = "training/dataset.csv"
URL_OUT = "training/url_dataset.csv"
MSG_OUT = "training/message_dataset.csv"

url_pattern = re.compile(
    r"(https?://|www\.|[a-zA-Z0-9\-]+\.(com|net|org|co|xyz|info|biz|click|site|online))"
)

urls = []
messages = []

with open(INPUT, "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)

    for row in reader:
        if len(row) < 2:
            continue

        text = row[0].strip()
        label = row[-1].strip().lower()

        if label not in ("safe", "phishing"):
            continue

        # classify as URL or message
        text_stripped = text.strip()

        # URL-only row: the entire text is just one URL (or domain)
        is_url_only = bool(re.match(r"^(https?://|www\.)\S+$", text_stripped))

        if is_url_only:
            urls.append((text, label))
        else:
            messages.append((text, label))

# save urls
with open(URL_OUT, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["text", "label"])
    writer.writerows(urls)

# save messages
with open(MSG_OUT, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["text", "label"])
    writer.writerows(messages)

print("Done.")
print(f"URLs: {len(urls)}")
print(f"Messages: {len(messages)}")