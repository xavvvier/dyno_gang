defmodule DynoGang.State.Player do
  @derive {Jason.Encoder, only: [:name, :move, :score, :x, :alive, :character, :ghost]}
  defstruct name: "",
    move: "",
    x: 0,
    score: 0,
    alive: true,
    ghost: false,
    character: ""

  alias DynoGang.State.Player

  def move(%Player{} = player, move, x, score) do
    %{player | move: move, x: x, score: score}
  end

  def die(%Player{} = player) do
    %{player | alive: false}
  end

end
