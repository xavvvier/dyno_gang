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

  def player_move(player_name, move, x) do
    GenServer.call(:game_server, {:player_move, player_name, move, x})
  end

  def remove_player(player) do
    GenServer.cast(:game_server, {:remove_player, player})
  end

  #Server

  def init(state) do
    IO.puts("Game server started")
    :timer.send_interval(3000, :obstable_generator)
    {:ok, state}
  end

  def handle_call({:add_player, player}, _from, state) do
    current_players = state.players
    #create a new player state
    player_state = %Player{name: player} 
    new_state = %{state | 
      players: Map.put(state.players, player, player_state)
    }
    Endpoint.broadcast!("obstacle:all", "player_joined", player_state)
    IO.inspect(player, label: "player joined")
    {:reply, current_players, new_state}
  end

  def handle_cast({:remove_player, player}, state) do
    new_state = %{state | 
      players: Map.delete(state.players, player)
    }
    Endpoint.broadcast!("obstacle:all", "player_left", %{name: player})
    IO.inspect(player, label: "player left")
    {:noreply, new_state}
  end

  def handle_call({:player_move, player_name, key, x}, _from, state) do
    #get the player state
    player_state = Map.get(state.players, player_name)
    #update the game state
    state = %{state | 
      players: Map.put(state.players, player_name, 
        Player.move(player_state, key, x)) 
    }
    {:reply, state, state}
  end

  def handle_info(:obstable_generator, state)  do
    obstable_type = :random.uniform(4) 
    Endpoint.broadcast!("obstacle:all", "obstacle_event", %{type: obstable_type})
    {:noreply, state}
  end
  
end
