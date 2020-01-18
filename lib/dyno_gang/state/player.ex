defmodule DynoGang.State.Player do
  @derive {Jason.Encoder, only: [:name, :move, :score, :x]}
  defstruct name: "",
    move: "",
    x: 0,
    score: 0

  alias DynoGang.State.Player

  def move(%Player{} = player, move, x, score) do
    %{player | move: move, x: x, score: score}
  end

end
