defmodule SpaceGang.State.Player do
  defstruct name: "",
    moving: false,
    direction: "R",
    score: 0

  alias SpaceGang.State.Player

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
