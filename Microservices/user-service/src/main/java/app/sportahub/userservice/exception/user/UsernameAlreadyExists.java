package app.sportahub.userservice.exception.user;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

@ResponseStatus(code = HttpStatus.CONFLICT, reason = "User with this username already exists.")
public class UsernameAlreadyExists extends ResponseStatusException {

    public UsernameAlreadyExists(String username) {
        super(HttpStatus.CONFLICT, "User with this username:" + username + " already exists.");
    }
}
