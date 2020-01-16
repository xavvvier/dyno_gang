defmodule DynoGangWeb.PageController do
  use DynoGangWeb, :controller

  def index(conn, %{"user" => username}) do
    render(assign(conn, :user_token, username), "index.html")
  end
end
