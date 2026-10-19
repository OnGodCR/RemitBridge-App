"""Pair a reviewed weekly-rate CSV with the monthly fees already on file (D193); never writes to Supabase."""
import argparse
import csv
import hashlib
import json
from pathlib import Path

from remitbridge_engine.collection import combine_weekly_rates

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('csv', type=Path, help='reviewed weekly rates')
parser.add_argument('--fees', type=Path, nargs='+', required=True, help='earlier reviewed quote JSON files')
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--report', type=Path, required=True)
args = parser.parse_args()
fee_quotes = [q for f in args.fees for q in json.loads(f.read_text())]
observations, held = combine_weekly_rates(list(csv.DictReader(args.csv.open())), fee_quotes)
for obs in observations:
    evidence = obs['collection_evidence']
    paths = [Path(p.strip()) for p in evidence['evidence_file'].split(';')]
    evidence['evidence_file'] = '; '.join(p.name for p in paths)
    evidence['screenshots'] = [{'file': p.name, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
                               for p in paths]
args.output.write_text(json.dumps(observations, indent=2))
args.report.write_text(json.dumps({'eligible': len(observations), 'held': held}, indent=2))
print(f'Combined {len(observations)} rates with monthly fees; held {len(held)} rows.')
