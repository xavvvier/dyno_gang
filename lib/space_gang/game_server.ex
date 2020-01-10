defmodule SpaceGang.GameServer do
  use GenServer

  alias SpaceGang.State.Game
  alias SpaceGang.State.Player

  #Client

  def start_link(_) do
    GenServer.start(__MODULE__, %Game{}, name: :game_server)
  end

  def add_player(player, socket) do
    GenServer.call(:game_server, {:add_player, player, socket})
  end

  def player_move(player_name, move) do
    GenServer.cast(:game_server, {:player_move, player_name, move})
  end

  #Server

  def init(state) do
    IO.puts("Game server started")
    :timer.send_interval(16, :game_tick)
    {:ok, state}
  end

  def handle_call({:add_player, player, socket}, _from, state) do
    #create a new player state
    #TODO: what if it's a reconnection?
    player_state = %Player{socket: socket} 
    new_state = %{state | 
      players: Map.put(state.players, player, player_state)
    }
    IO.inspect(player, label: "player added")
    {:reply, new_state, new_state}
  end

  def handle_cast({:player_move, player_name, key}, state) do
    #get the player state
    player_state = Map.get(state.players, player_name)
    #update the game state
    state = %{state | 
      players: Map.put(state.players, player_name, Player.move(player_state, key)) 
    }
    IO.inspect(state, label: "new state")
    {:noreply, state}
  end

  def handle_info(:game_tick, state)  do
    #Iterate on all player's socket and push the event
    Enum.each(state.players, fn {player_name, player_state} ->
      if player_state.socket.joined do
        Phoenix.Channel.push(player_state.socket, 
          "current_rank",
          %{val: 34})
      end
    end)
    {:noreply, state}
  end
  
end
