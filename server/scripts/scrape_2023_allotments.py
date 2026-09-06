import json
import time
import os
import sys
from bs4 import BeautifulSoup
from curl_cffi import requests

sys.stdout.reconfigure(line_buffering=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
}

api_headers = dict(headers)
api_headers.update({
    'Accept': '*/*',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': 'https://eduvale.in/tg-eapcet/college-wise-cutoff-allotment/',
})

session = requests.Session(impersonate="chrome124")
base_url = "https://eduvale.in/tg-eapcet/college-wise-cutoff-allotment/"

def fetch_with_retry(url, headers_to_use, max_retries=3, is_json=False):
    for attempt in range(1, max_retries + 1):
        try:
            r = session.get(url, headers=headers_to_use, timeout=15)
            if r.status_code == 200:
                if is_json:
                    return r.json()
                return r.text
        except Exception as e:
            if attempt == max_retries:
                print(f"    [Fetch Error after {max_retries} attempts for {url}]: {e}", flush=True)
            time.sleep(0.5 * attempt)
    return None

print("=== Starting TG EAPCET 2023 Data Scraper ===", flush=True)

# 1. Warm up session
print("Fetching main page...", flush=True)
try:
    session.get(base_url, headers=headers, timeout=10)
except Exception as e:
    print(f"Warm up notice: {e}", flush=True)

# 2. Fetch colleges
print("Fetching 2023 College Directory...", flush=True)
col_html = fetch_with_retry(base_url + "fetch_colleges.php?year=2023", api_headers)
if not col_html:
    print("Error fetching 2023 colleges!", flush=True)
    exit(1)

soup = BeautifulSoup(col_html, 'html.parser')
colleges = []
for opt in soup.find_all('option'):
    val = opt.get('value', '').strip()
    text = opt.text.strip()
    if val:
        colleges.append({'code': val, 'name': text})

print(f"Found {len(colleges)} colleges for TG EAPCET 2023.", flush=True)

output_file = os.path.join(os.path.dirname(__file__), "../src/data/tg_eapcet_2023_allotments.json")

# Load existing progress if available
all_allotments_by_college = {}
college_branches_map = {}
if os.path.exists(output_file):
    try:
        with open(output_file, 'r', encoding='utf-8') as f:
            existing = json.load(f)
            all_allotments_by_college = existing.get('data', {})
            college_branches_map = existing.get('collegeBranchesMap', {})
            print(f"Loaded existing progress: {len(all_allotments_by_college)} colleges already scraped.", flush=True)
    except Exception as e:
        print(f"Notice reading existing file: {e}", flush=True)

total_candidate_records = 0

for idx, col in enumerate(colleges, 1):
    c_code = col['code']
    c_name = col['name']

    # Skip if college already has branches scraped
    if c_code in all_allotments_by_college and len(all_allotments_by_college[c_code].get('branches', [])) > 0:
        c_recs = sum(len(b.get('candidates', [])) for b in all_allotments_by_college[c_code]['branches'])
        total_candidate_records += c_recs
        print(f"[{idx}/{len(colleges)}] Skipping {c_code} (Already Scraped: {len(all_allotments_by_college[c_code]['branches'])} branches, {c_recs} candidates)", flush=True)
        continue

    print(f"[{idx}/{len(colleges)}] Fetching branches for {c_code} ({c_name})...", flush=True)
    
    time.sleep(0.05)
    b_html = fetch_with_retry(f"{base_url}fetch_branches.php?year=2023&college={c_code}", api_headers)
    if not b_html:
        print(f"  Warning: failed to fetch branches for {c_code}", flush=True)
        continue
    
    b_soup = BeautifulSoup(b_html, 'html.parser')
    branches = []
    for b_opt in b_soup.find_all('option'):
        b_val = b_opt.get('value', '').strip()
        b_text = b_opt.text.strip()
        if b_val:
            branches.append({'code': b_val, 'name': b_text})
            
    college_branches_map[c_code] = [b['code'] for b in branches]
    all_allotments_by_college[c_code] = {
        'code': c_code,
        'name': c_name,
        'branches': []
    }

    for b in branches:
        b_code = b['code']
        b_name = b['name']
        time.sleep(0.02)
        res_json = fetch_with_retry(f"{base_url}fetch_results.php?year=2023&college={c_code}&branch={b_code}", api_headers, is_json=True)
        if res_json:
            try:
                records = res_json.get('data', [])
                total_candidate_records += len(records)
                print(f"   -> {b_code}: {len(records)} candidates", flush=True)
                
                candidates = []
                for r in records:
                    candidates.append({
                        'rollNo': r.get('rollno', ''),
                        'rank': int(r.get('rank', 0)),
                        'candidateName': r.get('cand_name', ''),
                        'gender': r.get('gender', 'M'),
                        'region': r.get('region', 'OU'),
                        'caste': r.get('category', 'OC'),
                        'seatCategory': r.get('seat_category', ''),
                    })

                all_allotments_by_college[c_code]['branches'].append({
                    'branchCode': b_code,
                    'branchName': b_name,
                    'totalAllotted': len(candidates),
                    'candidates': candidates
                })
            except Exception as e:
                print(f"   -> Error parsing JSON for {c_code} {b_code}: {e}", flush=True)

    # Save incremental checkpoint after each college
    if idx % 5 == 0 or idx == len(colleges):
        output_data = {
            'examId': 'tg-eapcet',
            'admissionYear': 2023,
            'phase': 'final',
            'colleges': colleges,
            'collegeBranchesMap': college_branches_map,
            'data': all_allotments_by_college
        }
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2)

print("==================================================", flush=True)
print(f"Scrape Complete! Total 2023 Colleges: {len(all_allotments_by_college)}, Total Candidate Records: {total_candidate_records}", flush=True)

output_data = {
    'examId': 'tg-eapcet',
    'admissionYear': 2023,
    'phase': 'final',
    'colleges': colleges,
    'collegeBranchesMap': college_branches_map,
    'data': all_allotments_by_college
}

os.makedirs(os.path.dirname(output_file), exist_ok=True)
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=2)

print(f"Saved complete 2023 dataset to {output_file}", flush=True)
