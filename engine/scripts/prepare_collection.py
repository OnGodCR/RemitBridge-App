"""Prepare a reviewed CSV for the manual adapter; never writes to Supabase."""
import argparse
import csv
import hashlib
import json
from pathlib import Path

from remitbridge_engine.collection import prepare_collection

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('csv', type=Path)
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--report', type=Path, required=True)
args = parser.parse_args()
observations, held = prepare_collection(list(csv.DictReader(args.csv.open())))
for obs in observations:
    evidence = obs['collection_evidence']
    paths = [Path(p.strip()) for p in evidence['evidence_file'].split(';')]
    evidence['evidence_file'] = '; '.join(p.name for p in paths)
    evidence['screenshots'] = [{'file': p.name, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
                               for p in paths]
args.output.write_text(json.dumps(observations, indent=2))
args.report.write_text(json.dumps({'eligible': len(observations), 'held': held}, indent=2))
print(f'Prepared {len(observations)} observations; held {len(held)} rows.')
