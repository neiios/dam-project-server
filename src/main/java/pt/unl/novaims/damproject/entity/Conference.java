package pt.unl.novaims.damproject.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Conference {

    @Id
    private Long id;

    private String title;

    private String description;

    private Double latitude;

    private Double longitude;

}
