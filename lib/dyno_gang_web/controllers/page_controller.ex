defmodule DynoGangWeb.PageController do
  use DynoGangWeb, :controller

  alias DynoGangWeb.GameServer

  @maximum_players 8

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def validate(conn, %{"username" => username}) do
    players = GameServer.player_names()
    #Validate the username is not on the game server
    valid = not username in players
    maximum_players = Enum.count(players) <= @maximum_players
    #assign user token only when a valid username is requested
    case {valid, maximum_players} do
      {true, true} ->
        token = Phoenix.Token.sign(DynoGangWeb.Endpoint, "user authentication salt", username)
        conn
        |> assign(:user_token, token)
        |> assign(:user_id, username)
        |> json(%{valid: valid, token: token})
      {false, _} ->
        json(conn, %{valid: false, error: "Name already taken"})
      {_, false} ->
        json(conn, %{valid: false, error: "There are no free spots"})
    end
  end
end
