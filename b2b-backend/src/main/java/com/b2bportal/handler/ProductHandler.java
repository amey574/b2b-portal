package com.b2bportal.handler;

import com.b2bportal.Database;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class ProductHandler extends BaseHandler {
    private static final Gson gson = new Gson();

    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"message\":\"Method Not Allowed\"}");
            return;
        }

        // Determine if this is /api/products or /api/products/{id}
        String path = exchange.getRequestURI().getPath();
        String[] parts = path.split("/");

        if (parts.length > 3) {
            // e.g., /api/products/1
            try {
                int productId = Integer.parseInt(parts[3]);
                handleGetOne(exchange, productId);
            } catch (NumberFormatException e) {
                sendResponse(exchange, 400, "{\"message\":\"Invalid product ID format\"}");
            }
        } else {
            // /api/products
            handleGetAll(exchange);
        }
    }

    private void handleGetAll(HttpExchange exchange) throws Exception {
        try (Connection conn = Database.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery("SELECT * FROM products")) {

            JsonArray products = new JsonArray();
            while (rs.next()) {
                JsonObject product = new JsonObject();
                product.addProperty("id", rs.getInt("id"));
                product.addProperty("name", rs.getString("name"));
                product.addProperty("base_price", rs.getDouble("base_price"));
                products.add(product);
            }

            JsonObject response = new JsonObject();
            response.add("products", products);
            sendResponse(exchange, 200, gson.toJson(response));
        }
    }

    private void handleGetOne(HttpExchange exchange, int productId) throws Exception {
        try (Connection conn = Database.getConnection()) {
            JsonObject product = new JsonObject();

            // Fetch Product
            try (PreparedStatement pstmt = conn.prepareStatement("SELECT * FROM products WHERE id = ?")) {
                pstmt.setInt(1, productId);
                try (ResultSet rs = pstmt.executeQuery()) {
                    if (rs.next()) {
                        product.addProperty("id", rs.getInt("id"));
                        product.addProperty("name", rs.getString("name"));
                        product.addProperty("base_price", rs.getDouble("base_price"));
                    } else {
                        sendResponse(exchange, 404, "{\"message\":\"Product not found\"}");
                        return;
                    }
                }
            }

            // Fetch Tiers
            JsonArray tiers = new JsonArray();
            try (PreparedStatement pstmt = conn.prepareStatement(
                    "SELECT min_quantity, max_quantity, unit_price FROM pricing_tiers WHERE product_id = ? ORDER BY min_quantity ASC")) {
                pstmt.setInt(1, productId);
                try (ResultSet rs = pstmt.executeQuery()) {
                    while (rs.next()) {
                        JsonObject tier = new JsonObject();
                        tier.addProperty("min_quantity", rs.getInt("min_quantity"));

                        int maxQty = rs.getInt("max_quantity");
                        if (rs.wasNull()) {
                            tier.add("max_quantity", null);
                        } else {
                            tier.addProperty("max_quantity", maxQty);
                        }

                        tier.addProperty("unit_price", rs.getDouble("unit_price"));
                        tiers.add(tier);
                    }
                }
            }

            product.add("tiers", tiers);
            sendResponse(exchange, 200, gson.toJson(product));
        }
    }
}
