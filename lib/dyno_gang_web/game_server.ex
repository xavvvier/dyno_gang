defmodule DynoGangWeb.GameServer do
  use GenServer

  alias DynoGang.State.Game
  alias DynoGang.State.Player
  alias DynoGangWeb.Endpoint

  #Client

  def start_link(_) do
    GenServer.start(__MODULE__, %Game{}, name: :game_server)
  end

  def add_player(player) do
    GenServer.call(:game_server, {:add_player, player})
  end

  def player_move(player_name, move) do
    GenServer.call(:game_server, {:player_move, player_name, move})
  end

  #Server

  def init(state) do
    IO.puts("Game server started")
    :timer.send_interval(1000, :obstable_generator)
    {:ok, state}
  end

  def handle_call({:add_player, player}, _from, state) do
    #create a new player state
    #TODO: what if it's a reconnection?
    player_state = %Player{} 
    new_state = %{state | 
      players: Map.put(state.players, player, player_state)
    }
    IO.inspect(player, label: "player joined")
    {:reply, new_state, new_state}
  end

  def handle_call({:player_move, player_name, key}, _from, state) do
    #get the player state
    player_state = Map.get(state.players, player_name)
    #update the game state
    state = %{state | 
      players: Map.put(state.players, player_name, Player.move(player_state, key)) 
    }
    {:reply, state, state}
  end

  def handle_info(:obstable_generator, state)  do
    Endpoint.broadcast!("obstacle:all", "obstacle_event", %{x: 4, speed: 23})
    {:noreply, state}
  end
  
end
