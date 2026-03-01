import csv

inp = "training/dataset.csv"
out = "training/dataset_clean.csv"

rows = []
with open(inp, "r", encoding="utf-8", newline="") as f:
    reader = csv.reader(f)
    header = next(reader)
    for r in reader:
        if len(r) < 2:
            continue
        label = r[-1].strip()
        text = ",".join(r[:-1]).strip()  # join anything extra back into text
        if label not in ("safe", "phishing"):
            continue
        rows.append((text, label))

with open(out, "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f, quoting=csv.QUOTE_ALL)
    w.writerow(["text", "label"])
    w.writerows(rows)

print(f"✅ Wrote {len(rows)} rows to {out}")