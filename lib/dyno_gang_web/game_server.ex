defmodule DynoGangWeb.GameServer do
  use GenServer

  alias DynoGang.State.{Game, Player, Score}
  alias DynoGangWeb.Endpoint

  #Client

  def start_link(_) do
    GenServer.start(__MODULE__, %Game{}, name: :game_server)
  end

  def player_join(player, character) do
    GenServer.call(:game_server, {:player_join, player, character})
  end

  def player_move(player_name, move, x, score) do
    GenServer.call(:game_server, {:player_move, player_name, move, x, score})
  end

  def remove_player(player) do
    GenServer.cast(:game_server, {:remove_player, player})
  end

  def player_dead(player) do
    GenServer.call(:game_server, {:die, player})
  end

  def player_names() do
    GenServer.call(:game_server, {:player_names})
  end

  #Server

  def init(state) do
    :timer.send_after(3000, :obstable_generator)
    IO.puts("Game server started")
    {:ok, read_score(state)}
  end

  defp read_score(state) do
    #Read the maximum score
    {:ok, table} = :dets.open_file(:scoring, [])
    content = :dets.lookup(table, :max) 
    :dets.close(table)
    max_score = case content do
      [max: [name_as_list, value]] ->
        name = List.to_string(name_as_list) 
        %Score{username: name, value: value}
      _ -> nil
    end
    %{state| max_score: max_score}
  end

  def handle_call({:player_join, player, character}, _from, state) do
    current_players = state.players
    #create a new player state
    IO.inspect(player, label: "adding player")
    player_state = %Player{name: player, character: character} 
    new_state = %{state | 
      players: Map.put(state.players, player, player_state)
    }
    Endpoint.broadcast!("obstacle:all", "player_joined", player_state)
    {:reply, current_players, new_state}
  end

  def handle_cast({:remove_player, player}, state) do
    new_state = %{state | 
      players: Map.delete(state.players, player)
    }
    Endpoint.broadcast!("obstacle:all", "player_left", %{name: player})
    player_names = Game.player_names(new_state)
    IO.inspect(player, label: "removed player")
    IO.inspect(player_names, label: "players in room")
    {:noreply, new_state}
  end

  def handle_call({:player_move, player_name, key, x, score}, _from, state) do
    #get the player state
    player_state = Map.get(state.players, player_name)
    #update the game state
    state = %{state | 
      players: Map.put(state.players, player_name, 
        Player.move(player_state, key, x, score)) 
    }
    {:reply, state, state}
  end

  def handle_call({:die, player_name}, _from, state) do
    #get the player state
    player_state = Map.get(state.players, player_name)
    user_score= %Score{username: player_name, value: player_state.score}
    #update the game state
    state = %{state | 
      players: Map.put(state.players, player_name, Player.die(player_state)) ,
      max_score: Score.max(state.max_score, user_score)
    }
    #Persist score 
    if Score.equal?(state.max_score, user_score) do
      {:ok, table} = :dets.open_file(:scoring, [])
      :dets.insert(table, {:max, [String.to_charlist(player_name), user_score.value]})
      :dets.close(table)
    end

    {:reply, state, state}
  end

  def handle_call({:player_names}, _from, state) do
    #get the player names
    player_names = Game.player_names(state)
    {:reply, player_names, state}
  end

  def handle_info(:obstable_generator, state)  do
    obstacle_type = :random.uniform(4) 
    min = 1500
    max = 2800
    next_wait = floor(:random.uniform() * (max-min) + min)
    :timer.send_after(next_wait, :obstable_generator)
    Endpoint.broadcast!("obstacle:all", "obstacle_event", %{type: obstacle_type})
    {:noreply, state}
  end
  
end
