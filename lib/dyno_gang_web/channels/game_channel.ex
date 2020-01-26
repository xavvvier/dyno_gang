defmodule DynoGangWeb.GameChannel do
  use Phoenix.Channel

  alias DynoGangWeb.GameServer
  alias DynoGangWeb.Endpoint
  alias Phoenix.Socket.Broadcast

  def join("game:all", %{"character" => character}, socket) do
    #Prepare a list of current players to send
    #Add the player to the game state
    player_name = Map.get(socket.assigns, :user_id)
    current_players = GameServer.add_player(player_name, character)
    #Subscribe to the obstacle topic
    Endpoint.subscribe("obstacle:all")
    {:ok, %{players: current_players}, socket}
  end
  
  def join("game:" <> _private_room, _message, _socket) do
    {:error, %{error: "unauthorized"}}
  end

  def handle_in("action", %{"key" => key, "x" => x, "score" => score}, socket) do
    player_name = Map.get(socket.assigns, :user_id)
    state = GameServer.player_move(player_name, key, x, score)
    broadcast!(socket, "player_move", %{response: state})
    {:noreply, socket}
  end

  def handle_in("die", _ , socket) do
    player_name = Map.get(socket.assigns, :user_id)
    state = GameServer.player_dead(player_name)
    broadcast!(socket, "player_dead", %{name: player_name})
    {:noreply, socket}
  end

  #Message generated at intervals in GameServer to broadcast obstacle events
  def handle_info(%Broadcast{event: event, payload: payload}, socket) do
    push(socket, event, payload)
    {:noreply, socket}
  end

  def terminate(reason, state) do
    GameServer.remove_player(state.assigns.user_id)
  end

end
