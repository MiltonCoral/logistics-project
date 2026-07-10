#!/bin/bash

# Script de prueba para la API de Logística
# Uso: ./test-api.sh

BASE_URL="http://localhost:8080/api"
TOKEN=""

echo "=== Test API Logística ==="

# 1. Login
echo -e "\n1. Login (Gerente)"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"gerente","password":"logistica2024"}')
echo "Response: ${LOGIN_RESPONSE}"
TOKEN=$(echo "${LOGIN_RESPONSE}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: ${TOKEN}"

# 2. Listar clientes
echo -e "\n2. Listar clientes"
curl -s -X GET "${BASE_URL}/clientes" \
  -H "Authorization: Bearer ${TOKEN}" | head -c 500

# 3. Listar checklists
echo -e "\n\n3. Listar checklists"
curl -s -X GET "${BASE_URL}/checklists" \
  -H "Authorization: Bearer ${TOKEN}" | head -c 500

# 4. Listar guías
echo -e "\n\n4. Listar guías"
curl -s -X GET "${BASE_URL}/guias" \
  -H "Authorization: Bearer ${TOKEN}" | head -c 500

echo -e "\n\n=== Tests completados ==="
