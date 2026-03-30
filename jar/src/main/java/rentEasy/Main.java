package rentEasy;

import rentEasy.dataBase.DataBaseConnection;
import rentEasy.dataBase.JpaUtil;
import rentEasy.repository.PropertyRepository;
import rentEasy.service.PropertyDetails;
import rentEasy.service.PropertyService;
import jakarta.persistence.EntityManager;

import java.sql.Connection;

public class Main {
    public static void main(String[] args) {
        try (Connection conn = DataBaseConnection.getConnection()) {
            System.out.println("Connexion reussie a Supabase !");

            EntityManager em = JpaUtil.getEntityManager();

            try {
                Long propertyId = 1L;
                PropertyService propertyService = new PropertyService(new PropertyRepository(em));
                PropertyDetails property = propertyService.getPropertyDetails(propertyId);

                System.out.println("====== PROPERTY ======");
                System.out.println("Name: " + property.name());
                System.out.println("City: " + property.city());
                System.out.println("Country: " + property.country());
                System.out.println("Address: " + property.address());
                System.out.println("Price per night: " + property.pricePerNight());
                System.out.println("Max guests: " + property.maxGuests());
                System.out.println("Bedrooms: " + property.bedrooms());
                System.out.println("Bathrooms: " + property.bathrooms());
                System.out.println("Description: " + property.description());
                System.out.println("Features: " + property.includedFeatures());

                System.out.println("\n====== HOST ======");
                System.out.println("Username: " + property.host().username());
                System.out.println("Email: " + property.host().email());

                System.out.println("\n====== IMAGES ======");
                for (PropertyDetails.ImageDetails image : property.images()) {
                    System.out.println("- " + image.imageUrl()
                            + (Boolean.TRUE.equals(image.isMain()) ? " (MAIN)" : ""));
                }

                System.out.println("\n====== REVIEWS ======");
                for (PropertyDetails.ReviewDetails review : property.reviews()) {
                    System.out.println(review.username()
                            + " | Rating: " + review.rating()
                            + " | Comment: " + review.comment());
                }
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                em.close();
                JpaUtil.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
