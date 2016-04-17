defmodule Concerted.Mixfile do
  use Mix.Project

  def project do
    [app: :concerted,
     version: "0.0.1",
     elixir: "~> 1.2",
     elixirc_paths: elixirc_paths(Mix.env),
     compilers: [:phoenix, :gettext] ++ Mix.compilers,
     build_embedded: Mix.env == :prod,
     start_permanent: Mix.env == :prod,
     deps: deps]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [mod: {Concerted, []},
     applications: [:phoenix, :phoenix_html, :cowboy, :logger, :gettext]]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "web", "test/support"]
  defp elixirc_paths(_),     do: ["lib", "web"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [{:phoenix, path: "../..", override: true},
     {:phoenix_html, "~> 2.3"},
     {:phoenix_live_reload, "~> 1.0", only: :dev},
     # TODO move to hex release
     {:phoenix_pubsub, github: "phoenixframework/phoenix_pubsub"},
     {:gettext, "~> 0.9"},
     {:cowboy, "~> 1.0"},
     {:uuid, "~> 1.1"}]
  end
end
