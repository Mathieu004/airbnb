package airbnb;

import airbnb.dataBase.*;
import jakarta.persistence.EntityManager;

import java.sql.Connection;

public class Main {
    public static void main(String[] args) {
        try (Connection conn = DataBaseConnection.getConnection()) {
            System.out.println("Connexion réussie à Supabase !");

            EntityManager em = JpaUtil.getEntityManager();

            try {
                Long propertyId = 1L;

                Property property = em.createQuery("""
                    SELECT p FROM Property p
                    LEFT JOIN FETCH p.host
                    LEFT JOIN FETCH p.images
                    LEFT JOIN FETCH p.reviews r
                    LEFT JOIN FETCH r.user
                    WHERE p.id = :id
                    """, Property.class)
                        .setParameter("id", propertyId)
                        .getSingleResult();

                System.out.println("====== PROPERTY ======");
                System.out.println("Name: " + property.getName());
                System.out.println("City: " + property.getCity());
                System.out.println("Country: " + property.getCountry());
                System.out.println("Address: " + property.getAddress());
                System.out.println("Price per night: " + property.getPricePerNight());
                System.out.println("Max guests: " + property.getMaxGuests());
                System.out.println("Bedrooms: " + property.getBedrooms());
                System.out.println("Bathrooms: " + property.getBathrooms());
                System.out.println("Description: " + property.getDescription());
                System.out.println("Features: " + property.getIncludedFeatures());

                System.out.println("\n====== HOST ======");
                System.out.println("Username: " + property.getHost().getUsername());
                System.out.println("Email: " + property.getHost().getEmail());

                System.out.println("\n====== IMAGES ======");
                for (PropertyImage img : property.getImages()) {
                    System.out.println("- " + img.getImageUrl() +
                            (Boolean.TRUE.equals(img.getIsMain()) ? " (MAIN)" : ""));
                }

                System.out.println("\n====== REVIEWS ======");
                for (Review review : property.getReviews()) {
                    System.out.println(
                            review.getUser().getUsername() +
                                    " | Rating: " + review.getRating() +
                                    " | Comment: " + review.getComment()
                    );
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