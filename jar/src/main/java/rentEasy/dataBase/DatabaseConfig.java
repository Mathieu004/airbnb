package rentEasy.dataBase;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public final class DatabaseConfig {

    private static final Properties PROPERTIES = loadProperties();

    private DatabaseConfig() {
    }

    private static Properties loadProperties() {
        try (InputStream input = DatabaseConfig.class.getClassLoader().getResourceAsStream("application.properties")) {
            if (input == null) {
                throw new IllegalStateException("application.properties not found");
            }

            Properties properties = new Properties();
            properties.load(input);
            return properties;
        } catch (Exception e) {
            throw new RuntimeException("Erreur chargement config DB", e);
        }
    }

    public static String getUrl() {
        return PROPERTIES.getProperty("spring.datasource.url");
    }

    public static String getUser() {
        return PROPERTIES.getProperty("spring.datasource.username");
    }

    public static String getPassword() {
        return PROPERTIES.getProperty("spring.datasource.password");
    }

    public static Map<String, Object> getJpaProperties() {
        Map<String, Object> jpaProperties = new HashMap<>();
        jpaProperties.put("jakarta.persistence.jdbc.driver", "org.postgresql.Driver");
        jpaProperties.put("jakarta.persistence.jdbc.url", getUrl());
        jpaProperties.put("jakarta.persistence.jdbc.user", getUser());
        jpaProperties.put("jakarta.persistence.jdbc.password", getPassword());
        return jpaProperties;
    }
}
