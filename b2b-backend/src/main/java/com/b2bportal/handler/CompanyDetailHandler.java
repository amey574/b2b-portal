package com.b2bportal.handler;

import com.b2bportal.Database;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class CompanyDetailHandler extends BaseHandler {
    private static final Gson gson = new Gson();

    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"message\":\"Method Not Allowed\"}");
            return;
        }

        String query = exchange.getRequestURI().getQuery();
        String idStr = getQueryParam(query, "companyId");

        if (idStr == null) {
            sendResponse(exchange, 400, "{\"message\":\"companyId is required\"}");
            return;
        }

        int companyId = Integer.parseInt(idStr);

        try (Connection conn = Database.getConnection();
                PreparedStatement pstmt = conn.prepareStatement(
                        "SELECT id, name AS company_name, credit_limit, current_debt FROM companies WHERE id = ?")) {

            pstmt.setInt(1, companyId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    JsonObject company = new JsonObject();
                    company.addProperty("id", rs.getInt("id"));
                    company.addProperty("company_name", rs.getString("company_name"));
                    double creditLimit = rs.getDouble("credit_limit");
                    double currentDebt = rs.getDouble("current_debt");

                    company.addProperty("credit_limit", creditLimit);
                    company.addProperty("current_debt", currentDebt);
                    company.addProperty("available_credit", creditLimit - currentDebt);

                    sendResponse(exchange, 200, gson.toJson(company));
                } else {
                    sendResponse(exchange, 404, "{\"message\":\"Company not found\"}");
                }
            }
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
