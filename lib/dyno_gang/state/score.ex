defmodule DynoGang.State.Score do
  @derive {Jason.Encoder, only: [:username, :value]}
  defstruct username: "", value: 0

  alias DynoGang.State.Score

  def max(nil, %Score{}=new), do: new
  def max(%Score{value: old_value}, %Score{value: new_value}=new) when new_value>old_value do
    new
  end
  def max(old, _new), do: old

  def equal?(nil, _), do: false
  def equal?(score1, score2) do
    score1.username == score2.username and score1.value == score2.value
  end

end
