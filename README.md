# DynoGang

To start your Phoenix server:

  * Install dependencies with `mix deps.get`
  * Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## Container

Build the image:

`podman build --tag dynogang .`

Run the image:

`podman run -e SECRET_KEY_BASE=<some_secret_key> --name dynogang_server dynogang`
