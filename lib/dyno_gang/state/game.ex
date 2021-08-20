defmodule DynoGang.State.Game do
  @derive {Jason.Encoder, only: [:players, :max_score]}
  defstruct players: %{}, max_score: nil, obstacle_generator: false

  alias DynoGang.State.Game

  def player_names(%Game{}=game) do
    Enum.map(game.players, fn {_k,v} -> v.name end)
  end

  def total_players(%Game{}=game) do
    Enum.count(game.players)
  end
end
