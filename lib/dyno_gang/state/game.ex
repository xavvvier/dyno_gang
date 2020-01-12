defmodule DynoGang.State.Game do
  @derive {Jason.Encoder, only: [:players]}
  defstruct players: %{}
end
