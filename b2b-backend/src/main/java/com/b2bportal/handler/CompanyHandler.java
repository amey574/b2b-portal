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

public class CompanyHandler extends BaseHandler {
    private static final Gson gson = new Gson();

    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        String method = exchange.getRequestMethod();

        if ("GET".equalsIgnoreCase(method)) {
            handleGet(exchange);
        } else if ("POST".equalsIgnoreCase(method)) {
            handlePost(exchange);
        } else if ("PUT".equalsIgnoreCase(method)) {
            handlePut(exchange);
        } else if ("DELETE".equalsIgnoreCase(method)) {
            handleDelete(exchange);
        } else {
            sendResponse(exchange, 405, "{\"message\":\"Method Not Allowed\"}");
        }
    }

    private void handleGet(HttpExchange exchange) throws Exception {
        try (Connection conn = Database.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery("SELECT * FROM companies ORDER BY name ASC")) {

            JsonArray companies = new JsonArray();
            while (rs.next()) {
                JsonObject company = new JsonObject();
                company.addProperty("id", rs.getInt("id"));
                company.addProperty("name", rs.getString("name"));
                company.addProperty("credit_limit", rs.getDouble("credit_limit"));
                company.addProperty("current_debt", rs.getDouble("current_debt"));
                companies.add(company);
            }

            JsonObject response = new JsonObject();
            response.add("companies", companies);
            sendResponse(exchange, 200, gson.toJson(response));
        }
    }

    private void handlePost(HttpExchange exchange) throws Exception {
        String body = readRequestBody(exchange);
        JsonObject req = gson.fromJson(body, JsonObject.class);

        if (req == null || !req.has("name") || !req.has("credit_limit")) {
            sendResponse(exchange, 400, "{\"message\":\"Invalid company data\"}");
            return;
        }

        String name = req.get("name").getAsString();
        double creditLimit = req.get("credit_limit").getAsDouble();

        try (Connection conn = Database.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(
                        "INSERT INTO companies (name, credit_limit, current_debt) VALUES (?, ?, 0)",
                        Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, name);
            pstmt.setDouble(2, creditLimit);
            pstmt.executeUpdate();

            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) {
                    long id = rs.getLong(1);
                    JsonObject response = new JsonObject();
                    response.addProperty("message", "Company created successfully");
                    response.addProperty("companyId", id);
                    sendResponse(exchange, 200, gson.toJson(response));
                }
            }
        }
    }

    private void handlePut(HttpExchange exchange) throws Exception {
        String body = readRequestBody(exchange);
        JsonObject req = gson.fromJson(body, JsonObject.class);

        if (req == null || !req.has("id") || !req.has("credit_limit")) {
            sendResponse(exchange, 400, "{\"message\":\"Invalid update data\"}");
            return;
        }

        int id = req.get("id").getAsInt();
        double creditLimit = req.get("credit_limit").getAsDouble();

        if (creditLimit < 0) {
            sendResponse(exchange, 400, "{\"message\":\"Credit limit cannot be negative\"}");
            return;
        }

        try (Connection conn = Database.getConnection()) {
            // Check if exists
            try (PreparedStatement checkStmt = conn
                    .prepareStatement("SELECT current_debt FROM companies WHERE id = ?")) {
                checkStmt.setInt(1, id);
                try (ResultSet rs = checkStmt.executeQuery()) {
                    if (!rs.next()) {
                        sendResponse(exchange, 404, "{\"message\":\"Company not found\"}");
                        return;
                    }
                }
            }

            // Update
            try (PreparedStatement updateStmt = conn
                    .prepareStatement("UPDATE companies SET credit_limit = ? WHERE id = ?")) {
                updateStmt.setDouble(1, creditLimit);
                updateStmt.setInt(2, id);
                updateStmt.executeUpdate();

                JsonObject response = new JsonObject();
                response.addProperty("message", "Credit limit updated successfully");
                response.addProperty("newLimit", creditLimit);
                sendResponse(exchange, 200, gson.toJson(response));
            }
        }
    }

    private void handleDelete(HttpExchange exchange) throws Exception {
        // Parse query params for ID
        String query = exchange.getRequestURI().getQuery();
        String idStr = getQueryParam(query, "id");

        if (idStr == null) {
            sendResponse(exchange, 400, "{\"message\":\"Company ID is required\"}");
            return;
        }

        int id = Integer.parseInt(idStr);

        try (Connection conn = Database.getConnection();
                PreparedStatement pstmt = conn.prepareStatement("DELETE FROM companies WHERE id = ?")) {

            pstmt.setInt(1, id);
            pstmt.executeUpdate();

            sendResponse(exchange, 200, "{\"message\":\"Company deleted successfully\"}");
        }
    }

    private String getQueryParam(String query, String param) {
        if (query == null)
            return null;
        for (String pair : query.split("&")) {
            String[] kv = pair.split("=");
            if (kv.length > 1 && kv[0].equals(param)) {
                return kv[1];
            }
        }
        return null;
    }
}
