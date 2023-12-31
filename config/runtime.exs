import Config

if config_env() == :prod do
  config :dyno_gang, DynoGangWeb.Endpoint,
    server: true,
    secret_key_base: "Rk6jg8UN51TC3SrL8AF0JjdfNvo8vyWvkoj6jAl3YTmDaYqfsux5Z1Uv8hQVsGXl"

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  config :dyno_gang, DynoGangWeb.Endpoint,
    http: [
      # Enable IPv6 and bind on all interfaces.
      # Set it to  {0, 0, 0, 0, 0, 0, 0, 1} for local network only access.
      # See the documentation on https://hexdocs.pm/plug_cowboy/Plug.Cowboy.html
      # for details about using IPv6 vs IPv4 and loopback vs public addresses.
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: String.to_integer(System.get_env("PORT") || "4000")
    ],
    secret_key_base: secret_key_base
end
