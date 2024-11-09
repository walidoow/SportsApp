package app.sportahub.userservice.dto.request.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotEmpty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record RefreshTokenRequest(@NotEmpty String refreshToken) {
}
