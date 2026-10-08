#!/usr/bin/env bash
# RLS smoke test, run with the PUBLIC key only. The website's lesson: test policies
# with curl, not with the UI. Every check is something a stranger holding the app's
# publishable key could try.
#
#   SUPABASE_URL=https://<ref>.supabase.co SUPABASE_PUBLISHABLE_KEY=... supabase/tests/rls_smoke.sh
#
# A denial only counts if Postgres says why: 42501 (insufficient privilege / RLS) or
# 23514 (check constraint). A bare 4xx isn't enough. The first version of this script
# passed several checks because bash brace-expanded the JSON bodies into garbage, and
# PostgREST rejected them as invalid JSON before RLS ever ran. Bodies are now built
# with printf and always passed as a quoted variable.
#
# It inserts events with the fixed install_id below. Migration 20260928000100 registers
# that ID in internal_installs so it never counts in metrics, and deletes its events.
set -uo pipefail
shopt -s extglob  # for "@(201|23505)" patterns in check()
: "${SUPABASE_URL:?}" "${SUPABASE_PUBLISHABLE_KEY:?}"
REST="$SUPABASE_URL/rest/v1"
H=(-H "apikey: $SUPABASE_PUBLISHABLE_KEY" -H "Content-Type: application/json")
TEST_INSTALL="00000000-0000-4000-8000-00000000c0de"
FAKE_USER="11111111-1111-4111-8111-111111111111"
pass=0; fail=0

check() { # name, expected (glob), actual
  if [[ "$3" == $2 ]]; then echo "ok    $1"; pass=$((pass+1)); else echo "FAIL  $1 (expected $2, got $3)"; fail=$((fail+1)); fi
}
# The Postgres/PostgREST error code if the response is an error, else the HTTP status.
pg() {
  local out
  out=$(curl -s -m 20 -w $'\n%{http_code}' "$@")
  python3 -c '
import json, sys
body, status = sys.argv[1].rsplit("\n", 1)
try:
    d = json.loads(body)
    print(d.get("code") if isinstance(d, dict) and d.get("code") else status)
except ValueError:
    print(status)' "$out"
}
count() {
  curl -s -m 20 "$@" | python3 -c '
import json, sys
d = json.load(sys.stdin)
print(len(d) if isinstance(d, list) else "error:" + str(d.get("code")))'
}
post() { # table, json body
  pg "${H[@]}" -H "Prefer: return=minimal" -X POST "$REST/$1" -d "$2"
}

echo "--- public reads"
check "routes are readable (4 seeded)"            "4"   "$(count "${H[@]}" "$REST/routes?select=id")"
check "providers are readable (9: 8 seeded + Instarem)" "9"   "$(count "${H[@]}" "$REST/providers?select=id")"
check "latest_quotes view is readable"            "200" "$(pg "${H[@]}" "$REST/latest_quotes?select=id")"
check "compare_quotes view is readable (D144)"   "200" "$(pg "${H[@]}" "$REST/compare_quotes?select=id")"

echo "--- private reads return nothing"
check "no quarantined or rejected quotes visible" "0" "$(count "${H[@]}" "$REST/quotes?select=id&validation_status=neq.published")"
check "events are not readable"                   "0" "$(count "${H[@]}" "$REST/events?select=id")"
check "scrape runs are not readable"              "0" "$(count "${H[@]}" "$REST/scrape_runs?select=id")"
check "adapter state is not readable"             "0" "$(count "${H[@]}" "$REST/adapter_state?select=adapter_id")"
check "profiles are not readable"                 "0" "$(count "${H[@]}" "$REST/profiles?select=user_id")"
check "saved transfers are not readable"          "0" "$(count "${H[@]}" "$REST/saved_transfers?select=id")"
check "rate alerts are not readable"              "0" "$(count "${H[@]}" "$REST/rate_alerts?select=id")"
check "saved comparisons are not readable"        "0" "$(count "${H[@]}" "$REST/saved_comparisons?select=id")"
check "internal installs are not readable"        "0" "$(count "${H[@]}" "$REST/internal_installs?select=install_id")"
check "entered prices are not readable"           "0" "$(count "${H[@]}" "$REST/manual_observations?select=id")"
check "route requests are not readable"           "0" "$(count "${H[@]}" "$REST/route_requests?select=id")"
check "WhatsApp users are not readable"           "0" "$(count "${H[@]}" "$REST/whatsapp_users?select=phone_hash")"
check "receipts are not readable"                 "0" "$(count "${H[@]}" "$REST/receipts?select=id")"
check "receipt fields are not readable"           "0" "$(count "${H[@]}" "$REST/receipt_fields?select=receipt_id")"
check "receipt comparisons are not readable"      "0" "$(count "${H[@]}" "$REST/receipt_comparisons?select=receipt_id")"
check "model call counts are not readable"        "0" "$(count "${H[@]}" "$REST/receipt_model_calls?select=month")"
check "the WhatsApp photo queue is not readable"  "0" "$(count "${H[@]}" "$REST/receipt_intake?select=id")"

echo "--- writes a stranger must not make (each must fail with 42501)"
check "can't insert a published quote" "42501" "$(post quotes "$(printf '{"dedupe_key":"rls","provider_id":"wise","route_id":"us-in","send_currency":"USD","receive_currency":"INR","send_amount":500,"delivery_method":"bank_deposit","payment_method":"bank_account","fee":0,"offered_rate":99,"mid_market_rate":95,"mid_market_source":"x","amount_received":49500,"computed_amount_received":49500,"markup_pct":-4,"total_cost":0,"total_cost_pct":0,"source":"scraper","strategy":"x","captured_at":"2026-09-28T00:00:00Z","validation_status":"published"}')")"
check "can't insert a provider" "42501" "$(post providers '{"id":"evil","name":"Evil","type":"mto","website":"x"}')"
check "can't make a profile (or an admin)" "42501" "$(post profiles "$(printf '{"user_id":"%s","is_admin":true}' "$FAKE_USER")")"
check "can't save a transfer" "42501" "$(post saved_transfers "$(printf '{"user_id":"%s","provider_name":"x","send_currency":"USD","receive_currency":"INR","sent":1,"quoted_rate":1,"sent_on":"2026-01-01"}' "$FAKE_USER")")"
check "can't save a comparison" "42501" "$(post saved_comparisons "$(printf '{"user_id":"%s","route_id":"us-in","send_amount":500,"delivery_method":"upi"}' "$FAKE_USER")")"
check "can't register an internal install" "42501" "$(post internal_installs "$(printf '{"install_id":"%s","label":"x"}' "$FAKE_USER")")"
# Security hardening (D135): functions a stranger must not call.
check "can't call the sign-in hook" "42501" "$(pg "${H[@]}" -X POST "$REST/rpc/custom_access_token_hook" -d '{"event":{}}')"
check "can't touch the rate limits" "42501" "$(pg "${H[@]}" -X POST "$REST/rpc/take_hit_for_ip" -d '{"p_bucket":"scan","p_ip":"1.2.3.4","p_max":1,"p_window_seconds":60}')"
check "can't touch the daily counters (D140)" "42501" "$(pg "${H[@]}" -X POST "$REST/rpc/count_hit" -d '{"p_bucket":"scan_day_phone","p_key":"x","p_window_seconds":60}')"
check "can't spend daily model calls (D140)" "42501" "$(pg "${H[@]}" -X POST "$REST/rpc/take_receipt_model_call" -d '{"p_cap":1,"p_daily_cap":1}')"
check "can't read the daily model count (D140)" "42501" "$(pg "${H[@]}" "$REST/receipt_model_calls_daily?select=day")"
check "can't list receipt images to delete (D141)" "42501" "$(pg "${H[@]}" -X POST "$REST/rpc/expired_receipt_images" -d '{"p_limit":1}')"
check "can't call a trigger function (refused, or not offered at all)" "@(42501|PGRST202)" "$(pg "${H[@]}" -X POST "$REST/rpc/handle_new_user" -d '{}')"
# Linking WhatsApp (D138): only a signed-in person gets a code, only the bot links.
check "can't get a WhatsApp link code" "42501" "$(pg "${H[@]}" -X POST "$REST/rpc/whatsapp_link_code" -d '{}')"
check "can't link a WhatsApp chat" "42501" "$(pg "${H[@]}" -X POST "$REST/rpc/link_whatsapp" -d '{"p_code":"ABCDEF","p_phone_hash":"x"}')"
check "link codes are not readable" "0" "$(count "${H[@]}" "$REST/whatsapp_link_codes?select=code")"
check "app settings are readable (2)" "2" "$(count "${H[@]}" "$REST/app_settings?select=key")"
check "can't change app settings" "42501" "$(post app_settings '{"key":"whatsapp_live","value":"true"}')"
check "can't log an event as someone else" "42501" "$(post events "$(printf '{"install_id":"%s","user_id":"%s","name":"rls_test"}' "$TEST_INSTALL" "$FAKE_USER")")"
check "can't queue a WhatsApp photo" "42501" "$(post receipt_intake "$(printf '{"phone_hash":"%s","phone_sealed":"xxxxxxxxxxxxxxxxxxxx","media_id":"rls"}' "$(printf 'a%.0s' {1..64})")")"
check "can't take photos off the queue" "42501" "$(pg "${H[@]}" -X POST "$REST/rpc/claim_receipt_intake" -d '{"p_limit":1}')"
check "can't make a rate alert" "42501" "$(post rate_alerts "$(printf '{"user_id":"%s","route_id":"us-in","send_amount":500,"delivery_method":"bank_deposit","target_received":47000,"push_token":"ExponentPushToken[abcdefghijklmnop]"}' "$FAKE_USER")")"
check "can't read the due rate alerts (push tokens)" "42501" "$(pg "${H[@]}" -X POST "$REST/rpc/due_rate_alerts" -d '{}')"
check "can't enter a price" "42501" "$(post manual_observations "$(printf '{"provider_id":"wise","route_id":"us-in","send_amount":500,"delivery_method":"bank_deposit","fee":0,"offered_rate":99,"amount_received":49500,"source_url":"x","observed_by":"%s"}' "$FAKE_USER")")"
check "can't ask for a route as someone else" "42501" "$(post route_requests "$(printf '{"send_country":"US","receive_country":"NP","install_id":"%s","user_id":"%s"}' "$TEST_INSTALL" "$FAKE_USER")")"
check "can't file a request as WhatsApp" "42501" "$(post route_requests "$(printf '{"send_country":"US","receive_country":"NP","install_id":"%s","source":"whatsapp"}' "$TEST_INSTALL")")"
check "request countries are validated (23514)" "23514" "$(post route_requests "$(printf '{"send_country":"USA","receive_country":"NP","install_id":"%s"}' "$TEST_INSTALL")")"
check "request addresses are validated (23514)" "23514" "$(post route_requests "$(printf '{"send_country":"US","receive_country":"NP","install_id":"%s","notify_email":"not an address"}' "$TEST_INSTALL")")"
check "can't write a WhatsApp user" "42501" "$(post whatsapp_users "$(printf '{"phone_hash":"%s"}' "$(printf 'a%.0s' {1..64})")")"
check "can't write a receipt" "42501" "$(post receipts '{"channel":"app","redaction_status":"device","expires_at":"2030-01-01T00:00:00Z"}')"
check "can't write a receipt field" "42501" "$(post receipt_fields '{"receipt_id":"00000000-0000-4000-8000-000000000000","field_name":"fee","value":"1","extraction_path":"parser","confidence":1}')"
check "can't spend model calls" "42501" "$(pg "${H[@]}" -X POST "$REST/rpc/take_receipt_model_call" -d '{"p_cap":1000}')"
check "can't delete receipts" "42501" "$(pg "${H[@]}" -X POST "$REST/rpc/forget_expired_receipts" -d '{}')"
check "metrics refuse anyone but admins" "42501" "$(pg "${H[@]}" -X POST "$REST/rpc/admin_metrics" -d '{"p_days":30}')"
check "event names are validated (23514)" "23514" "$(post events "$(printf '{"install_id":"%s","name":"DROP TABLE"}' "$TEST_INSTALL")")"
curl -s -m 20 -o /dev/null "${H[@]}" -X PATCH "$REST/routes?id=eq.us-in" -d '{"status":"not_feasible"}'
check "can't change a route (still 'building')" "building" "$(curl -s -m 20 "${H[@]}" "$REST/routes?id=eq.us-in&select=status" | python3 -c 'import sys,json; print(json.load(sys.stdin)[0]["status"])')"
curl -s -m 20 -o /dev/null "${H[@]}" -X DELETE "$REST/providers?id=eq.wise"
check "can't delete a provider (still 9)" "9" "$(count "${H[@]}" "$REST/providers?select=id")"
# A private bucket answers a list with [] rather than an error, so check both sides.
check "raw archive lists as empty" "[]" "$(curl -s -m 20 -H "apikey: $SUPABASE_PUBLISHABLE_KEY" -H "Content-Type: application/json" -X POST "$SUPABASE_URL/storage/v1/object/list/raw-archive" -d '{"prefix":""}')"
check "can't upload to the raw archive" "AccessDenied" "$(pg -H "apikey: $SUPABASE_PUBLISHABLE_KEY" -H "Authorization: Bearer $SUPABASE_PUBLISHABLE_KEY" -H "Content-Type: text/plain" -X POST "$SUPABASE_URL/storage/v1/object/raw-archive/rls-test.txt" --data-binary "x")"
check "receipt images list as empty" "[]" "$(curl -s -m 20 -H "apikey: $SUPABASE_PUBLISHABLE_KEY" -H "Content-Type: application/json" -X POST "$SUPABASE_URL/storage/v1/object/list/receipt-images" -d '{"prefix":""}')"
check "can't upload a receipt image" "AccessDenied" "$(pg -H "apikey: $SUPABASE_PUBLISHABLE_KEY" -H "Authorization: Bearer $SUPABASE_PUBLISHABLE_KEY" -H "Content-Type: image/jpeg" -X POST "$SUPABASE_URL/storage/v1/object/receipt-images/rls-test.jpg" --data-binary "x")"

echo "--- writes a stranger may make"
check "anonymous event insert works" "201" "$(post events "$(printf '{"install_id":"%s","name":"rls_test","created_at":"2001-01-01T00:00:00Z"}' "$TEST_INSTALL")")"
# The test install is internal, so its request never shows on the board. It can only ask
# once: the first run gets 201 and every later run the unique-index refusal, 23505.
check "anonymous route request works" "@(201|23505)" "$(post route_requests "$(printf '{"send_country":"us","receive_country":"np","install_id":"%s","delivery_method":"bank_deposit"}' "$TEST_INSTALL")")"
check "the same install can't ask twice (23505)" "23505" "$(post route_requests "$(printf '{"send_country":"US","receive_country":"NP","install_id":"%s"}' "$TEST_INSTALL")")"
check "request counts are public" "200" "$(pg "${H[@]}" -X POST "$REST/rpc/route_request_counts" -d '{}')"
check "the receipt observatory is public" "200" "$(pg "${H[@]}" -X POST "$REST/rpc/receipt_observatory" -d '{}')"
check "a receipt result is read by its ID (none here)" "null" "$(curl -s -m 20 "${H[@]}" -X POST "$REST/rpc/receipt_result" -d '{"p_id":"00000000-0000-4000-8000-000000000000"}')"

echo; echo "$pass passed, $fail failed"
[[ $fail -eq 0 ]]
