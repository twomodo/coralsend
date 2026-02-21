package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/alifakhimi/coralsend/apps/server/internal/signal"
)

var addr = flag.String("addr", ":8080", "http service address")

type rateLimitState struct {
	count   int
	resetAt time.Time
}

type fixedWindowLimiter struct {
	mu      sync.Mutex
	window  time.Duration
	maxReq  int
	clients map[string]*rateLimitState
}

func newFixedWindowLimiter(window time.Duration, maxReq int) *fixedWindowLimiter {
	return &fixedWindowLimiter{
		window:  window,
		maxReq:  maxReq,
		clients: make(map[string]*rateLimitState),
	}
}

func (l *fixedWindowLimiter) allow(clientKey string, now time.Time) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	state, ok := l.clients[clientKey]
	if !ok || now.After(state.resetAt) {
		l.clients[clientKey] = &rateLimitState{
			count:   1,
			resetAt: now.Add(l.window),
		}
		return true
	}

	if state.count >= l.maxReq {
		return false
	}

	state.count++
	return true
}

func getClientIP(r *http.Request) string {
	if xff := strings.TrimSpace(r.Header.Get("X-Forwarded-For")); xff != "" {
		parts := strings.Split(xff, ",")
		if len(parts) > 0 {
			if ip := strings.TrimSpace(parts[0]); ip != "" {
				return ip
			}
		}
	}

	if xrip := strings.TrimSpace(r.Header.Get("X-Real-IP")); xrip != "" {
		return xrip
	}

	host, _, err := net.SplitHostPort(strings.TrimSpace(r.RemoteAddr))
	if err == nil && host != "" {
		return host
	}
	return strings.TrimSpace(r.RemoteAddr)
}

func getEnvInt(key string, fallback int) int {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback
	}
	value, err := strconv.Atoi(raw)
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}

func getEnvDurationSeconds(key string, fallbackSeconds int) time.Duration {
	return time.Duration(getEnvInt(key, fallbackSeconds)) * time.Second
}

// CORS middleware
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		origin := strings.TrimSpace(r.Header.Get("Origin"))
		if origin != "" && signal.IsOriginAllowed(origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Max-Age", "600")

		if origin != "" && !signal.IsOriginAllowed(origin) {
			http.Error(w, "origin not allowed", http.StatusForbidden)
			return
		}

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next(w, r)
	}
}

func main() {
	flag.Parse()
	hub := signal.NewHub()
	go hub.Run()

	window := getEnvDurationSeconds("RATE_LIMIT_WINDOW", 60)
	maxReq := getEnvInt("RATE_LIMIT_MAX_REQUESTS", 120)
	limiter := newFixedWindowLimiter(window, maxReq)

	http.HandleFunc("/ws", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		clientIP := getClientIP(r)
		if !limiter.allow(clientIP, time.Now()) {
			http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
			return
		}
		signal.ServeWs(hub, w, r)
	}))

	http.HandleFunc("/health", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":    "ok",
			"service":   "CoralSend Signal Server",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	}))

	fmt.Printf("CoralSend Signaling Server listening on %s\n", *addr)
	fmt.Printf("Server is accessible from all network interfaces (0.0.0.0)\n")
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
