package signal

import (
	"os"
	"strings"
)

var allowedOrigins = loadAllowedOrigins()

func loadAllowedOrigins() map[string]struct{} {
	raw := os.Getenv("ALLOWED_ORIGINS")
	items := strings.Split(raw, ",")
	set := make(map[string]struct{}, len(items))
	for _, item := range items {
		origin := strings.TrimSpace(item)
		if origin == "" {
			continue
		}
		set[origin] = struct{}{}
	}
	return set
}

func isProduction() bool {
	appEnv := strings.ToLower(strings.TrimSpace(os.Getenv("APP_ENV")))
	goEnv := strings.ToLower(strings.TrimSpace(os.Getenv("GO_ENV")))
	return appEnv == "production" || appEnv == "prod" || goEnv == "production"
}

// IsOriginAllowed checks whether request Origin is acceptable for signaling endpoints.
func IsOriginAllowed(origin string) bool {
	o := strings.TrimSpace(origin)

	// In production, explicit allowlist is required for browser origins.
	if isProduction() {
		if o == "" {
			return false
		}
		_, ok := allowedOrigins[o]
		return ok
	}

	// In non-production, allow all origins unless an allowlist is explicitly set.
	if len(allowedOrigins) == 0 {
		return true
	}
	_, ok := allowedOrigins[o]
	return ok
}
