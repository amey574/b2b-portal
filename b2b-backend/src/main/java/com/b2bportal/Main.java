package com.b2bportal;

import com.b2bportal.handler.*;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

public class Main {
    public static void main(String[] args) throws Exception {
        int port = 8080;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        
        // Initialize database connection early to test it
        Database.getConnection();

        // Register handlers
        server.createContext("/api/auth/login", new AuthHandler());
        server.createContext("/api/companies", new CompanyHandler());
        server.createContext("/api/company", new CompanyDetailHandler());
        server.createContext("/api/company/repay", new RepayHandler());
        server.createContext("/api/products", new ProductHandler());
        server.createContext("/api/orders", new OrderHandler());

        // Use a standard executor
        server.setExecutor(Executors.newCachedThreadPool()); 
        
        server.start();
        System.out.println("B2B Backend Server started on port " + port);
    }
}
