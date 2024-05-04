package pt.unl.novaims.damproject.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import pt.unl.novaims.damproject.entity.Conference;
import pt.unl.novaims.damproject.repository.ConferenceRepository;

@RestController
public class ConferenceController {

    private final ConferenceRepository conferenceRepository;

    public ConferenceController(ConferenceRepository conferenceRepository) {
        this.conferenceRepository = conferenceRepository;
    }

    @GetMapping("/conference")
    public Iterable<Conference> findAll() {
        return this.conferenceRepository.findAll();
    }

    @PostMapping("/conference")
    public Conference save(@RequestBody Conference conference) {
        return this.conferenceRepository.save(conference);
    }
}
