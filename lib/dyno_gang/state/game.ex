defmodule DynoGang.State.Game do
  @derive {Jason.Encoder, only: [:players, :max_score]}
  defstruct players: %{}, max_score: nil

  alias DynoGang.State.Game

  def player_names(%Game{}=game) do
    Enum.map(game.players, fn {_k,v} -> v.name end)
  end
end
