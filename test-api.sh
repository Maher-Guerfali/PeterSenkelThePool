#!/bin/bash

# Replace with your actual Render URL
API_URL="https://your-app-name.onrender.com/api"

echo "🧪 Testing Products API"
echo "======================="
echo ""

# 1. Health Check
echo "1️⃣  Health Check:"
curl -s "$API_URL/../health" | jq .
echo -e "\n"

# 2. Create Product
echo "2️⃣  Creating a product..."
PRODUCT_ID=$(curl -s -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop",
    "price": 1299.99,
    "category": "Electronics"
  }' | jq -r '._id')

echo "Created product with ID: $PRODUCT_ID"
echo ""

# 3. Get All Products
echo "3️⃣  Getting all products:"
curl -s "$API_URL/products" | jq '.data | length'
echo -e "\n"

# 4. Get Single Product
echo "4️⃣  Getting product by ID:"
curl -s "$API_URL/products/$PRODUCT_ID" | jq .
echo -e "\n"

# 5. Update Product
echo "5️⃣  Updating product price:"
curl -s -X PATCH "$API_URL/products/$PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -d '{"price": 1499.99}' | jq .
echo -e "\n"

# 6. Filter Products
echo "6️⃣  Filtering by category (Electronics):"
curl -s "$API_URL/products?category=Electronics" | jq '.total'
echo -e "\n"

# 7. Filter by Price Range
echo "7️⃣  Filtering by price range (1000-2000):"
curl -s "$API_URL/products?minPrice=1000&maxPrice=2000" | jq '.data | length'
echo -e "\n"

# 8. Pagination
echo "8️⃣  Testing pagination (page 1, limit 5):"
curl -s "$API_URL/products?page=1&limit=5" | jq '{page: .page, total: .total, pages: .pages}'
echo -e "\n"

# 9. Delete Product
echo "9️⃣  Deleting product:"
curl -s -X DELETE "$API_URL/products/$PRODUCT_ID" -w "\nStatus: %{http_code}\n"
echo ""

echo "✅ All tests completed!"
