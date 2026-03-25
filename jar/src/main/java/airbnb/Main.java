package airbnb;

import airbnb.config.DataBaseConnection;

import java.sql.Connection;

public class Main {
    public static void main(String[] args) {
        try (Connection conn = DataBaseConnection.getConnection()) {
            System.out.println("Connexion réussie à Supabase !");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}