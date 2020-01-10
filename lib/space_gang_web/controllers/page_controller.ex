defmodule SpaceGangWeb.PageController do
  use SpaceGangWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
