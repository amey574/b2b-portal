package com.b2bportal;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.io.File;

public class Database {
    private static final String DEFAULT_DB_URL = "jdbc:mysql://localhost:3306/b2b_portal";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "Singhamey@574";
    private static Connection connection = null;

    public static synchronized Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {

            // Try to load driver just in case
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
            } catch (ClassNotFoundException e) {
                System.err.println("MySQL JDBC Driver not found");
                e.printStackTrace();
            }

            connection = DriverManager.getConnection(DEFAULT_DB_URL, DB_USER, DB_PASSWORD);

            System.out.println("Connected to MySQL database.");
        }
        return connection;
    }
}
