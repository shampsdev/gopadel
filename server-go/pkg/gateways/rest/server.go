package rest

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/penglongli/gin-metrics/ginmetrics"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/middlewares"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
	"github.com/tj/go-spin"
	"golang.org/x/sync/errgroup"
)

const shutdownDuration = 1500 * time.Millisecond

type Server struct {
	HttpServer http.Server
	Router     *gin.Engine
}

func NewServer(ctx context.Context, cfg *config.Config, useCases usecase.Cases) *Server {
	r := gin.New()
	r.Use(gin.Recovery())

	m := ginmetrics.GetMonitor()
	m.SetMetricPath("/metrics")
	m.Use(r)

	s := &Server{
		Router: r,
		HttpServer: http.Server{
			Addr:    fmt.Sprintf(":%d", cfg.Server.Port),
			Handler: r,
		},
	}

	middlewares.BotToken = cfg.TG.BotToken
	setupRouter(ctx, s.Router, useCases)

	return s
}

func (s *Server) Run(ctx context.Context) error {
	eg := errgroup.Group{}
	eg.Go(func() error {
		return s.HttpServer.ListenAndServe()
	})

	<-ctx.Done()
	err := s.HttpServer.Shutdown(ctx)
	shutdownWait()
	return err
}

func shutdownWait() {
	spinner := spin.New()
	const spinIterations = 20
	for range spinIterations {
		fmt.Printf("\rgraceful shutdown %s ", spinner.Next())
		time.Sleep(shutdownDuration / spinIterations)
	}
	fmt.Println()
}
