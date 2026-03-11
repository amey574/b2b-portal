package com.b2bportal.handler;

import com.b2bportal.Database;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class RepayHandler extends BaseHandler {
    private static final Gson gson = new Gson();

    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"message\":\"Method Not Allowed\"}");
            return;
        }

        String body = readRequestBody(exchange);
        JsonObject req = gson.fromJson(body, JsonObject.class);

        if (req == null || !req.has("companyId") || !req.has("amount")) {
            sendResponse(exchange, 400, "{\"message\":\"Invalid repayment amount\"}");
            return;
        }

        int companyId = req.get("companyId").getAsInt();
        double amount = req.get("amount").getAsDouble();

        if (amount <= 0) {
            sendResponse(exchange, 400, "{\"message\":\"Invalid repayment amount\"}");
            return;
        }

        try (Connection conn = Database.getConnection()) {
            conn.setAutoCommit(false); // Begin Transaction

            try {
                // 1. Fetch Company Info
                double currentDebt = 0;
                double creditLimit = 0;

                try (PreparedStatement checkStmt = conn.prepareStatement(
                        "SELECT credit_limit, current_debt FROM companies WHERE id = ?")) {
                    checkStmt.setInt(1, companyId);
                    try (ResultSet rs = checkStmt.executeQuery()) {
                        if (rs.next()) {
                            creditLimit = rs.getDouble("credit_limit");
                            currentDebt = rs.getDouble("current_debt");
                        } else {
                            conn.rollback();
                            sendResponse(exchange, 404, "{\"message\":\"Company not found\"}");
                            return;
                        }
                    }
                }

                if (amount > currentDebt) {
                    conn.rollback();
                    sendResponse(exchange, 400, "{\"message\":\"Repayment amount exceeds current debt.\"}");
                    return;
                }

                // 2. Perform Transaction
                double newDebt = currentDebt - amount;
                try (PreparedStatement updateStmt = conn.prepareStatement(
                        "UPDATE companies SET current_debt = ? WHERE id = ?")) {
                    updateStmt.setDouble(1, newDebt);
                    updateStmt.setInt(2, companyId);
                    updateStmt.executeUpdate();
                }

                conn.commit();

                JsonObject response = new JsonObject();
                response.addProperty("message", "Debt repaid successfully");
                response.addProperty("amountRepaid", amount);
                response.addProperty("newCurrentDebt", newDebt);
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
