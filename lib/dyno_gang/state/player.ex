defmodule DynoGang.State.Player do
  @derive {Jason.Encoder, only: [:name, :move, :score]}
  defstruct name: "",
    move: "",
    x: 0,
    score: 0

  alias DynoGang.State.Player

  def move(%Player{} = player, move) do
    %{player | move: move}
  end

end
