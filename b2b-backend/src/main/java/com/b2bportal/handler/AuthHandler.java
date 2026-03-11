package com.b2bportal.handler;

import com.b2bportal.Database;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class AuthHandler extends BaseHandler {
    private static final Gson gson = new Gson();

    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendResponse(exchange, 405, "{\"message\":\"Method Not Allowed\"}");
            return;
        }

        String body = readRequestBody(exchange);
        JsonObject req = gson.fromJson(body, JsonObject.class);

        if (req == null || !req.has("email") || !req.has("password")) {
            sendResponse(exchange, 400, "{\"message\":\"Email and password are required\"}");
            return;
        }

        String email = req.get("email").getAsString();
        String password = req.get("password").getAsString();

        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(
                     "SELECT id, email FROM admins WHERE email = ? AND password = ?")) {
            
            pstmt.setString(1, email);
            pstmt.setString(2, password);

            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    JsonObject user = new JsonObject();
                    user.addProperty("id", rs.getInt("id"));
                    user.addProperty("email", rs.getString("email"));
                    
                    JsonObject response = new JsonObject();
                    response.add("user", user);
                    
                    sendResponse(exchange, 200, gson.toJson(response));
                } else {
                    sendResponse(exchange, 401, "{\"message\":\"Invalid credentials\"}");
                }
            }
        }
    }
}
