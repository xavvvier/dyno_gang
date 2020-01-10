defmodule SpaceGangWeb.GameChannel do
  use Phoenix.Channel

  alias SpaceGang.GameServer

  def join("game:all", _message, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end
  
  def join("game:" <> _private_room, _message, _socket) do
    {:error, %{error: "unauthorized"}}
  end

  def handle_in("action", %{"key" => key}, socket) do
    broadcast!(socket, "player_move", %{response: key})
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    player_name = Map.get(socket.assigns, :user_id)
    GameServer.add_player(player_name, socket)
    {:noreply, socket}
  end

  def terminate(reason, state) do
    IO.puts("GameChannel about to exit!!!!!!")
    IO.inspect(reason, label: "reason")
    IO.inspect(state, label: "reason")
  end

end
