defmodule SpaceGangWeb.GameChannel do
  use Phoenix.Channel

  alias SpaceGangWeb.GameServer
  alias SpaceGangWeb.Endpoint
  alias Phoenix.Socket.Broadcast

  def join("game:all", _message, socket) do
    #Add the player to the game state
    player_name = Map.get(socket.assigns, :user_id)
    GameServer.add_player(player_name)
    #Subscribe to the obstacle topic
    Endpoint.subscribe("obstacle:all")
    {:ok, socket}
  end
  
  def join("game:" <> _private_room, _message, _socket) do
    {:error, %{error: "unauthorized"}}
  end

  def handle_in("action", %{"key" => key}, socket) do
    broadcast!(socket, "player_move", %{response: key})
    {:noreply, socket}
  end

  #Message generated at intervals in GameServer to broadcast obstacle events
  def handle_info(%Broadcast{event: event, payload: payload}, socket) do
    push(socket, event, payload)
    {:noreply, socket}
  end

  def terminate(reason, state) do
    IO.puts("GameChannel about to exit!!!!!!")
    IO.inspect(reason, label: "reason")
    IO.inspect(state, label: "state")
  end

end
