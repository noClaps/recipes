package main

import (
	"os/exec"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	app.Static("/", "./public")
	app.Get("/recipe", func(c *fiber.Ctx) error {
		link := c.Query("link", "")
		if link == "" {
			return c.SendStatus(404)
		}

		cmd := exec.Command("./recipe-parser", link)
		output, err := cmd.Output()
		if err != nil {
			return err
		}

		c.Set("Content-Type", "text/html")

		return c.SendString(string(output))
	})

	app.Listen(":8080")
}
