#!/bin/bash

# Dynu DNS Configuration Script
# Configures DNS records for RGFL domains (Railway deployment only)
#
# Required environment variables:
#   DYNU_API_KEY - Your Dynu API key
#
# Usage:
#   export DYNU_API_KEY="your-api-key"
#   ./scripts/configure-dynu-dns.sh

set -e

# Check for required environment variable
if [ -z "$DYNU_API_KEY" ]; then
  echo "❌ Error: DYNU_API_KEY environment variable is required"
  echo "   Set it with: export DYNU_API_KEY='your-api-key'"
  exit 1
fi

DYNU_BASE_URL="https://api.dynu.com/v2"
PRODUCTION_API_URL="rgfl-api-production.up.railway.app"

# Railway CNAME targets for custom domains
# Note: You must first add custom domains in Railway dashboard to get the correct CNAME targets
# Frontend and API are both on Railway - update these after adding domains in Railway dashboard
RAILWAY_FRONTEND_CNAME="7qo6chb9.up.railway.app"  # Current survivor subdomain target
RAILWAY_ROOT_CNAME="7qo6chb9.up.railway.app"      # For root domain (same as frontend typically)

echo "🔧 Configuring Dynu DNS Records for Railway Deployment..."
echo "⚠️  IMPORTANT: Add custom domains in Railway dashboard first!"
echo "   Railway will provide the exact CNAME target"
echo ""

# Function to get domain ID
get_domain_id() {
  local domain=$1
  curl -s -X GET "${DYNU_BASE_URL}/dns" \
    -H "API-Key: ${DYNU_API_KEY}" | \
    jq -r ".domains[] | select(.name == \"${domain}\") | .id"
}

# Function to get DNS records for a domain
get_dns_records() {
  local domain_id=$1
  curl -s -X GET "${DYNU_BASE_URL}/dns/${domain_id}/record" \
    -H "API-Key: ${DYNU_API_KEY}"
}

# Function to delete a DNS record
delete_dns_record() {
  local domain_id=$1
  local record_id=$2
  curl -s -X DELETE "${DYNU_BASE_URL}/dns/${domain_id}/record/${record_id}" \
    -H "API-Key: ${DYNU_API_KEY}"
}

# Function to create an A record
create_a_record() {
  local domain_id=$1
  local node_name=$2
  local ip_address=$3
  local ttl=${4:-300}
  
  curl -s -X POST "${DYNU_BASE_URL}/dns/${domain_id}/record" \
    -H "API-Key: ${DYNU_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{
      \"nodeName\": \"${node_name}\",
      \"recordType\": \"A\",
      \"ttl\": ${ttl},
      \"state\": true,
      \"group\": \"\",
      \"ipv4Address\": \"${ip_address}\"
    }"
}

# Function to create a CNAME record
create_cname_record() {
  local domain_id=$1
  local node_name=$2
  local host=$3
  local ttl=${4:-300}
  
  curl -s -X POST "${DYNU_BASE_URL}/dns/${domain_id}/record" \
    -H "API-Key: ${DYNU_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{
      \"nodeName\": \"${node_name}\",
      \"recordType\": \"CNAME\",
      \"ttl\": ${ttl},
      \"state\": true,
      \"group\": \"\",
      \"host\": \"${host}\"
    }"
}

# Function to create an HTTP redirect record
create_redirect_record() {
  local domain_id=$1
  local node_name=$2
  local redirect_url=$3
  local redirect_type=${4:-301}
  
  curl -s -X POST "${DYNU_BASE_URL}/dns/${domain_id}/record" \
    -H "API-Key: ${DYNU_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{
      \"nodeName\": \"${node_name}\",
      \"recordType\": \"HTTPREDIRECT\",
      \"ttl\": 300,
      \"state\": true,
      \"group\": \"\",
      \"redirectUrl\": \"${redirect_url}\",
      \"redirectType\": ${redirect_type}
    }"
}

echo "📋 Getting domain information from Dynu..."
echo ""

# Function to list all DNS records for a domain (for debugging)
list_dns_records() {
  local domain_id=$1
  echo "   Current DNS records:"
  get_dns_records "$domain_id" | jq -r '.dnsRecords[]? | "     - \(.nodeName // "@"): \(.recordType) -> \(.host // .ipv4Address // .redirectUrl // "N/A")"'
}

# 1. Configure realitygamesfantasyleague.com (root domain - splash page)
echo "1️⃣  Configuring realitygamesfantasyleague.com (splash page)"
ROOT_DOMAIN_ID=$(get_domain_id "realitygamesfantasyleague.com")
if [ -z "$ROOT_DOMAIN_ID" ] || [ "$ROOT_DOMAIN_ID" = "null" ]; then
  echo "❌ Domain 'realitygamesfantasyleague.com' not found in Dynu"
  echo "   Please add this domain in Dynu dashboard first"
  exit 1
else
  echo "   ✅ Found domain ID: $ROOT_DOMAIN_ID"
  list_dns_records "$ROOT_DOMAIN_ID"
  echo ""
  echo "   ⚠️  Root domains cannot use CNAME records"
  echo "   Current A record points to: 76.76.21.21"
  echo ""
  echo "   For Railway root domain, you have two options:"
  echo "   1. Keep existing A record (if it's working)"
  echo "   2. Replace with Railway-provided IP addresses"
  echo ""
  echo "   📋 To configure root domain properly:"
  echo "      - Add 'realitygamesfantasyleague.com' as custom domain in Railway"
  echo "      - Railway will provide IP addresses for A records"
  echo "      - Update the A record in Dynu with those IPs"
  echo ""
  echo "   For now, leaving existing A record as-is"
fi

# 2. Configure survivor.realitygamesfantasyleague.com (app subdomain)
echo ""
echo "2️⃣  Configuring survivor.realitygamesfantasyleague.com (app)"
if [ -z "$ROOT_DOMAIN_ID" ] || [ "$ROOT_DOMAIN_ID" = "null" ]; then
  echo "❌ Cannot configure subdomain - parent domain not found"
else
  # Check if survivor CNAME already exists
  EXISTING_SURVIVOR=$(get_dns_records "$ROOT_DOMAIN_ID" | jq -r '.dnsRecords[]? | select(.nodeName == "survivor" and .recordType == "CNAME") | .id')
  
  if [ -n "$EXISTING_SURVIVOR" ] && [ "$EXISTING_SURVIVOR" != "null" ]; then
    echo "   ℹ️  Survivor CNAME already exists (ID: $EXISTING_SURVIVOR)"
    CURRENT_TARGET=$(get_dns_records "$ROOT_DOMAIN_ID" | jq -r '.dnsRecords[]? | select(.nodeName == "survivor" and .recordType == "CNAME") | .host')
    echo "   Current target: $CURRENT_TARGET"
    
    if [ "$CURRENT_TARGET" != "$RAILWAY_FRONTEND_CNAME" ]; then
      echo "   Updating CNAME to point to Railway frontend: $RAILWAY_FRONTEND_CNAME"
      echo "   ⚠️  Note: This requires deleting and recreating the record"
      echo "   To update:"
      echo "   1. Delete record ID $EXISTING_SURVIVOR via Dynu API or dashboard"
      echo "   2. Re-run this script"
      echo ""
      echo "   Or manually update in Dynu dashboard to: $RAILWAY_FRONTEND_CNAME"
    else
      echo "   ✅ Already pointing to correct Railway frontend target"
    fi
  else
    echo "   Creating CNAME record: survivor -> $RAILWAY_FRONTEND_CNAME"
    RESPONSE=$(create_cname_record "$ROOT_DOMAIN_ID" "survivor" "$RAILWAY_FRONTEND_CNAME" 300)
    if echo "$RESPONSE" | jq -e '.statusCode == 200 or .id' > /dev/null 2>&1; then
      echo "   ✅ CNAME record created successfully"
    else
      echo "   ⚠️  Response: $RESPONSE"
    fi
  fi
fi

# 3. Configure rgfl.app (redirect to survivor)
echo ""
echo "3️⃣  Configuring rgfl.app (redirect to survivor.realitygamesfantasyleague.com)"
DOMAIN_ID=$(get_domain_id "rgfl.app")
if [ -z "$DOMAIN_ID" ] || [ "$DOMAIN_ID" = "null" ]; then
  echo "❌ Domain 'rgfl.app' not found in Dynu"
else
  echo "   Found domain ID: $DOMAIN_ID"
  echo "   Creating HTTP redirect: rgfl.app -> https://survivor.realitygamesfantasyleague.com"
  RESPONSE=$(create_redirect_record "$DOMAIN_ID" "" "https://survivor.realitygamesfantasyleague.com" 301)
  echo "   Response: $RESPONSE"
fi

# 4. Configure rgflapp.com (redirect to survivor)
echo ""
echo "4️⃣  Configuring rgflapp.com (redirect to survivor.realitygamesfantasyleague.com)"
DOMAIN_ID=$(get_domain_id "rgflapp.com")
if [ -z "$DOMAIN_ID" ] || [ "$DOMAIN_ID" = "null" ]; then
  echo "❌ Domain 'rgflapp.com' not found in Dynu"
else
  echo "   Found domain ID: $DOMAIN_ID"
  echo "   Creating HTTP redirect: rgflapp.com -> https://survivor.realitygamesfantasyleague.com"
  RESPONSE=$(create_redirect_record "$DOMAIN_ID" "" "https://survivor.realitygamesfantasyleague.com" 301)
  echo "   Response: $RESPONSE"
fi

echo ""
echo "✅ DNS configuration script complete!"
echo ""
echo "📝 SUMMARY:"
echo ""
echo "✅ survivor.realitygamesfantasyleague.com - CNAME configured"
echo "⚠️  realitygamesfantasyleague.com - A record exists (may need Railway IPs)"
echo "❌ rgfl.app - Domain not found in Dynu (add domain first)"
echo "❌ rgflapp.com - Domain not found in Dynu (add domain first)"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Add Custom Domains in Railway Dashboard:"
echo "   - Go to Railway project dashboard"
echo "   - Find your FRONTEND service (not API service)"
echo "   - Settings → Networking → Custom Domains"
echo "   - Add: survivor.realitygamesfantasyleague.com"
echo "   - Add: realitygamesfantasyleague.com (if supported)"
echo "   - Railway will verify DNS and provide IPs if needed"
echo ""
echo "2. For rgfl.app and rgflapp.com:"
echo "   - Add these domains to your Dynu account first"
echo "   - Then re-run this script to configure redirects"
echo ""
echo "3. Update Railway CNAME target if different:"
echo "   - Check Railway dashboard for exact CNAME target"
echo "   - Edit RAILWAY_FRONTEND_CNAME in this script"
echo "   - Re-run this script to update DNS records"
echo ""
echo "3. Verify DNS Records:"
echo "   - Check Dynu dashboard: https://www.dynu.com/en-US/ControlPanel"
echo "   - Verify CNAME records point to Railway"
echo ""
echo "4. Wait for DNS Propagation:"
echo "   - Usually 5-30 minutes, can take up to 48 hours"
echo "   - Check with: dig realitygamesfantasyleague.com"
echo ""
echo "5. Test Domains:"
echo "   - https://survivor.realitygamesfantasyleague.com"
echo "   - https://realitygamesfantasyleague.com"
echo "   - https://rgfl.app (should redirect)"
echo "   - https://rgflapp.com (should redirect)"

