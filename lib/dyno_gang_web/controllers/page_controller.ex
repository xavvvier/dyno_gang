defmodule DynoGangWeb.PageController do
  use DynoGangWeb, :controller

  alias DynoGangWeb.GameServer

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def validate(conn, %{"username" => username}) do
    players = GameServer.player_names()
    #Validate the username is not on the game server
    valid = not username in players
    #assign user token only when a valid username is requested
    case valid do
      true ->
        token = Phoenix.Token.sign(DynoGangWeb.Endpoint, "user authentication salt", username)
        conn
        |> assign(:user_token, token)
        |> assign(:user_id, username)
        |> json(%{valid: valid, token: token})
      false ->
        json(conn, %{valid: valid})
    end
  end
end
