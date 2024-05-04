package pt.unl.novaims.damproject.repository;

import org.springframework.data.repository.CrudRepository;
import pt.unl.novaims.damproject.entity.Conference;

public interface ConferenceRepository  extends CrudRepository<Conference, Long> {
}
