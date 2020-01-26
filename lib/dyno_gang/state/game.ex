defmodule DynoGang.State.Game do
  @derive {Jason.Encoder, only: [:players]}
  defstruct players: %{}

  alias DynoGang.State.Game

  def player_names(%Game{}=game) do
    Enum.map(game.players, fn {_k,v} -> v.name end)
  end
end
