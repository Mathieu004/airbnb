package rentEasy;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;
import rentEasy.controller.*;
import rentEasy.controller.dto.PropertyDto;
import rentEasy.dataBase.DataBaseConnection;
import rentEasy.model.User;

import java.sql.Connection;

public class Main {

    public static void main(String[] args) {
        try (Connection connection = DataBaseConnection.getConnection()) {
            System.out.println("Connexion reussie a la base de donnees.");

            try (ConfigurableApplicationContext context = new SpringApplicationBuilder(ApplicationStarter.class).run()) {
                PropertyController propertyController = context.getBean(PropertyController.class);
                UserController userController = context.getBean(UserController.class);

                PropertyDto property = propertyController.getById(1L);
                User user = userController.getById(1L);

                System.out.println("Property ID 1 : " + property);
                System.out.println("User ID 1 : " + user);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
