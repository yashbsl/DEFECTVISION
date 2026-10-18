
from pathlib import Path
import xml.etree.ElementTree as ET
import shutil

ROOT = Path("dataset/raw/archive/NEU-DET")
OUTPUT = Path("dataset/processed/neu_det")

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp"}

CLASSES = [
    "crazing",
    "inclusion",
    "patches",
    "pitted_surface",
    "rolled-in_scale",
    "scratches",
]


def find_images(images_dir):
    images = {}
    for path in images_dir.rglob("*"):
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
            images[path.stem] = path
    return images


def convert_split(split):
    images_dir = ROOT / split / "images"
    annotations_dir = ROOT / split / "annotations"

    output_images = OUTPUT / "images" / split
    output_labels = OUTPUT / "labels" / split

    output_images.mkdir(parents=True, exist_ok=True)
    output_labels.mkdir(parents=True, exist_ok=True)

    images = find_images(images_dir)
    xml_files = list(annotations_dir.rglob("*.xml"))

    converted = 0
    skipped = 0

    for xml_path in xml_files:
        image_path = images.get(xml_path.stem)

        if image_path is None:
            print(f"Missing image: {xml_path.name}")
            skipped += 1
            continue

        try:
            tree = ET.parse(xml_path)
            root = tree.getroot()

            size = root.find("size")
            if size is None:
                print(f"Missing image size: {xml_path.name}")
                skipped += 1
                continue

            width = float(size.findtext("width", "0"))
            height = float(size.findtext("height", "0"))

            if width <= 0 or height <= 0:
                print(f"Invalid image dimensions: {xml_path.name}")
                skipped += 1
                continue

            yolo_lines = []

            for obj in root.findall("object"):
                class_name = obj.findtext("name", "").strip()

                if class_name not in CLASSES:
                    print(f"Unknown class '{class_name}' in {xml_path.name}")
                    continue

                bbox = obj.find("bndbox")
                if bbox is None:
                    continue

                xmin = float(bbox.findtext("xmin", "0"))
                ymin = float(bbox.findtext("ymin", "0"))
                xmax = float(bbox.findtext("xmax", "0"))
                ymax = float(bbox.findtext("ymax", "0"))

                xmin = max(0, min(xmin, width))
                xmax = max(0, min(xmax, width))
                ymin = max(0, min(ymin, height))
                ymax = max(0, min(ymax, height))

                if xmax <= xmin or ymax <= ymin:
                    continue

                x_center = ((xmin + xmax) / 2) / width
                y_center = ((ymin + ymax) / 2) / height
                box_width = (xmax - xmin) / width
                box_height = (ymax - ymin) / height

                class_id = CLASSES.index(class_name)

                yolo_lines.append(
                    f"{class_id} {x_center:.6f} {y_center:.6f} "
                    f"{box_width:.6f} {box_height:.6f}"
                )

            # Keep images only when the annotation has valid boxes.
            if not yolo_lines:
                print(f"No valid boxes: {xml_path.name}")
                skipped += 1
                continue

            shutil.copy2(
                image_path,
                output_images / f"{xml_path.stem}{image_path.suffix.lower()}",
            )

            (output_labels / f"{xml_path.stem}.txt").write_text(
                "\n".join(yolo_lines) + "\n",
                encoding="utf-8",
            )

            converted += 1

        except (ET.ParseError, ValueError, AttributeError) as error:
            print(f"Could not process {xml_path.name}: {error}")
            skipped += 1

    print(f"\n{split.upper()}: converted={converted}, skipped={skipped}")


if __name__ == "__main__":
    for split_name in ("train", "validation"):
        convert_split(split_name)

    print(f"\nProcessed dataset location: {OUTPUT.resolve()}")
