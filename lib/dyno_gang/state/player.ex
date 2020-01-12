defmodule DynoGang.State.Player do
  @derive {Jason.Encoder, only: [:name, :moving, :direction, :score]}
  defstruct name: "",
    moving: false,
    direction: "R",
    score: 0

  alias DynoGang.State.Player

  def move(%Player{} = player, "right_press") do
    %{player | moving: true, direction: "R"}
  end
  def move(%Player{} = player, "left_press") do
    %{player | moving: true, direction: "L"}
  end
  def move(%Player{} = player, _) do
    %{player | moving: false}
  end

end
