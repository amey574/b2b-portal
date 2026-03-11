package com.b2bportal.handler;

import com.b2bportal.Database;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class OrderHandler extends BaseHandler {
    private static final Gson gson = new Gson();

    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"message\":\"Method Not Allowed\"}");
            return;
        }

        String body = readRequestBody(exchange);
        JsonObject req = gson.fromJson(body, JsonObject.class);

        if (req == null || !req.has("companyId") || !req.has("productId") || !req.has("quantity")) {
            sendResponse(exchange, 400, "{\"message\":\"Invalid request data\"}");
            return;
        }

        int companyId = req.get("companyId").getAsInt();
        int productId = req.get("productId").getAsInt();
        int quantity = req.get("quantity").getAsInt();

        if (quantity <= 0) {
            sendResponse(exchange, 400, "{\"message\":\"Invalid request data\"}");
            return;
        }

        try (Connection conn = Database.getConnection()) {

            // 1. Fetch Company Info & Credit Limit
            double creditLimit = 0;
            double currentDebt = 0;
            boolean companyFound = false;

            try (PreparedStatement pstmt = conn.prepareStatement(
                    "SELECT credit_limit, current_debt FROM companies WHERE id = ?")) {
                pstmt.setInt(1, companyId);
                try (ResultSet rs = pstmt.executeQuery()) {
                    if (rs.next()) {
                        creditLimit = rs.getDouble("credit_limit");
                        currentDebt = rs.getDouble("current_debt");
                        companyFound = true;
                    }
                }
            }

            if (!companyFound) {
                sendResponse(exchange, 404, "{\"message\":\"Company not found\"}");
                return;
            }

            // 2. Fetch Pricing Tiers & determine price
            Double unitPrice = null;
            boolean productExists = false;

            try (PreparedStatement pstmt = conn.prepareStatement(
                    "SELECT min_quantity, max_quantity, unit_price FROM pricing_tiers WHERE product_id = ? ORDER BY min_quantity ASC")) {
                pstmt.setInt(1, productId);
                try (ResultSet rs = pstmt.executeQuery()) {
                    while (rs.next()) {
                        productExists = true;
                        int min = rs.getInt("min_quantity");
                        int max = rs.getInt("max_quantity");
                        boolean isMaxNull = rs.wasNull();

                        if (quantity >= min && (isMaxNull || quantity <= max)) {
                            unitPrice = rs.getDouble("unit_price");
                            break;
                        }
                    }
                }
            }

            if (!productExists || unitPrice == null) {
                // Determine if it was just no tiers or invalid quantity
                if (!productExists) {
                    sendResponse(exchange, 404, "{\"message\":\"Product or pricing not found\"}");
                } else {
                    sendResponse(exchange, 400, "{\"message\":\"Invalid quantity for pricing tiers\"}");
                }
                return;
            }

            double totalAmount = unitPrice * quantity;
            double availableCredit = creditLimit - currentDebt;

            // 3. Credit Check
            if (totalAmount > availableCredit) {
                sendResponse(exchange, 403, "{\"message\":\"Order exceeds your credit limit.\"}");
                return;
            }

            // 4. Place Order Transaction
            conn.setAutoCommit(false);

            try {
                long orderId = -1;
                // Create Order
                try (PreparedStatement insertOrder = conn.prepareStatement(
                        "INSERT INTO orders (company_id, product_id, quantity, unit_price, total_amount) VALUES (?, ?, ?, ?, ?)",
                        Statement.RETURN_GENERATED_KEYS)) {
                    insertOrder.setInt(1, companyId);
                    insertOrder.setInt(2, productId);
                    insertOrder.setInt(3, quantity);
                    insertOrder.setDouble(4, unitPrice);
                    insertOrder.setDouble(5, totalAmount);
                    insertOrder.executeUpdate();

                    try (ResultSet rs = insertOrder.getGeneratedKeys()) {
                        if (rs.next()) {
                            orderId = rs.getLong(1);
                        }
                    }
                }

                // Update Company Debt
                double newDebt = currentDebt + totalAmount;
                try (PreparedStatement updateCompany = conn.prepareStatement(
                        "UPDATE companies SET current_debt = ? WHERE id = ?")) {
                    updateCompany.setDouble(1, newDebt);
                    updateCompany.setInt(2, companyId);
                    updateCompany.executeUpdate();
                }

                conn.commit();

                JsonObject response = new JsonObject();
                response.addProperty("message", "Order placed successfully");
                response.addProperty("orderId", orderId);
                response.addProperty("quantity", quantity);
                response.addProperty("unitPrice", unitPrice);
                response.addProperty("totalAmount", totalAmount);
                response.addProperty("newAvailableCredit", creditLimit - newDebt);

                sendResponse(exchange, 200, gson.toJson(response));

            } catch (Exception txError) {
                conn.rollback();
                throw txError;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }
}
